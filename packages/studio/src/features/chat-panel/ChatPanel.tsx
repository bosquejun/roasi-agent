/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client"

import { useChat } from "@ai-sdk/react"
import type { PromptInputMessage } from "@roaster/ui/components/ai-elements/prompt-input"
import type { DynamicToolUIPart, ToolUIPart } from "ai"
import { DefaultChatTransport } from "ai"
import { useEffect, useRef } from "react"
import { ChatHeader } from "./ChatHeader"
import { ChatInput } from "./ChatInput"
import ConversationPanel from "./ConversationPanel"

interface ChatPanelProps {
  previewOpen: boolean
  onTogglePreview: () => void
  onScanStarted?: () => void
  onScanComplete?: (reportPath: string) => void
}

export function ChatPanel({
  previewOpen,
  onTogglePreview,
  onScanStarted,
  onScanComplete,
}: ChatPanelProps) {
  const { messages, setMessages, sendMessage, status, regenerate, error, clearError } =
    useChat({
      transport: new DefaultChatTransport({
        api: "http://192.168.100.21:5002/api/chat",
        prepareSendMessagesRequest({ messages, id }) {
          return { body: { message: messages[messages.length - 1], id } }
        },
      }),
    })
  const firedScanCallsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    fetch("http://192.168.100.21:5002/api/chat/history")
      .then((r) => r.json())
      .then(({ messages }) => {
        if (messages.length > 0) setMessages(messages)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!onScanStarted && !onScanComplete) return

    function getToolInfo(rawPart: (typeof messages)[0]["parts"][0]): { name: string; part: ToolUIPart } | null {
      if (rawPart.type === "dynamic-tool") {
        const p = rawPart as DynamicToolUIPart
        return { name: p.toolName, part: p as unknown as ToolUIPart }
      }
      if (rawPart.type.startsWith("tool-")) {
        const p = rawPart as ToolUIPart
        return { name: p.type.replace(/^tool-/, ""), part: p }
      }
      return null
    }

    let scanSiteOutput: { reportPath?: string } | undefined
    for (const msg of messages) {
      for (const rawPart of msg.parts) {
        const info = getToolInfo(rawPart)
        if (!info) continue
        if (info.name === "scanSite" && info.part.state === "output-available" && info.part.output) {
          scanSiteOutput = info.part.output as { reportPath?: string }
        }
      }
    }

    for (const msg of messages) {
      for (const rawPart of msg.parts) {
        const info = getToolInfo(rawPart)
        if (!info) continue
        const { name: toolName, part } = info

        if (
          toolName === "scanSite" &&
          (part.state === "input-available" || part.state === "output-available") &&
          !firedScanCallsRef.current.has(`start:${part.toolCallId}`)
        ) {
          const input = part.input as { url?: string }
          if (input?.url) {
            firedScanCallsRef.current.add(`start:${part.toolCallId}`)
            onScanStarted?.()
          }
        }

        if (
          toolName === "analyzeScanReport" &&
          part.state === "output-available" &&
          !firedScanCallsRef.current.has(`complete:${part.toolCallId}`)
        ) {
          if (scanSiteOutput?.reportPath) {
            firedScanCallsRef.current.add(`complete:${part.toolCallId}`)
            onScanComplete?.(scanSiteOutput.reportPath)
          }
        }
      }
    }
  }, [messages, onScanStarted, onScanComplete])

  function handleSubmit(message: PromptInputMessage) {
    if (!message.text) return
    sendMessage({ text: message.text })
  }

  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col">
      <ChatHeader
        previewOpen={previewOpen}
        onTogglePreview={onTogglePreview}
      />
      <ConversationPanel
        messages={messages}
        regenerate={regenerate}
        status={status}
        error={error}
      />
      <div className="absolute right-0 bottom-0 left-0 mx-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 bg-[var(--bg-base)] px-4">
          <ChatInput
            clearError={clearError}
            status={status}
            onSubmit={handleSubmit}
          />
          <p className="pb-2 text-center text-muted-foreground text-sm">
            AI can make mistakes, please double-check responses.
          </p>
        </div>
      </div>
    </div>
  )
}
