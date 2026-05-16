/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client"

import { useChat } from "@ai-sdk/react"
import { RoasiAnimation } from "@roaster/sprite-animations/components/roasi/RoasiAnimation"
import type { PromptInputMessage } from "@roaster/ui/components/ai-elements/prompt-input"
import type { ScanResult } from "@roaster/ai"
import type { DynamicToolUIPart, ToolUIPart, UIMessage } from "ai"
import { DefaultChatTransport } from "ai"
import { nanoid } from "nanoid"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { ChatHeader } from "./ChatHeader"
import { ChatInput } from "./ChatInput"
import ConversationPanel from "./ConversationPanel"

interface ChatPanelProps {
  chatId?: string
  title?: string
  previewOpen: boolean
  onTogglePreview: () => void
  onTerminalUpdate?: (output: string, streaming: boolean) => void
  onScanStarted?: (url: string) => void
  onScanComplete?: (reportPath: string) => void
  onChatCreated?: () => void
  empty?: boolean
  messages?: UIMessage[]
}

const QUICK_CHATS = [
  { id: "1", label: "Build a landing page" },
  { id: "2", label: "Add authentication" },
  { id: "3", label: "Set up database" },
  { id: "4", label: "Deploy to Vercel" },
]

export function ChatPanel({
  chatId,
  title: titleProp,
  previewOpen,
  onTogglePreview,
  onTerminalUpdate,
  onScanStarted,
  onScanComplete,
  onChatCreated,
  messages: defaultMessages,
  empty = false,
}: ChatPanelProps) {
  const router = useRouter()
  const isNewChatRef = useRef(false)
  const { messages, sendMessage, status, regenerate, error, clearError } =
    useChat({
      transport: new DefaultChatTransport({
        prepareSendMessagesRequest({ messages, id }) {
          return { body: { message: messages[messages.length - 1], id } }
        },
      }),
      messages: defaultMessages,
      id: chatId,
    })
  const chatTitle = titleProp ?? extractTitle(messages)
  const bottomRef = useRef<HTMLDivElement>(null)
  const firedScanCallsRef = useRef<Set<string>>(new Set())

  // useEffect(() => {
  //   if (!chatId) return
  //   fetch(`/api/chat/history/${chatId}`)
  //     .then((r) => r.json())
  //     .then(({ messages }) => {
  //       if (messages.length > 0) setMessages(messages)
  //     })
  //     .catch(console.error)
  // }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!onTerminalUpdate) return
    const lines: string[] = []
    let streaming = false

    for (const msg of messages) {
      for (const rawPart of msg.parts) {
        const isBashTool =
          rawPart.type === "tool-bash" ||
          (rawPart.type === "dynamic-tool" &&
            (rawPart as DynamicToolUIPart).toolName === "bash")

        if (!isBashTool) continue

        const part =
          rawPart.type === "dynamic-tool"
            ? ({
                ...(rawPart as DynamicToolUIPart),
                type: "tool-bash",
              } as unknown as ToolUIPart)
            : (rawPart as ToolUIPart)

        const input = part.input as BashPart
        const output = part.output as BashOutput | undefined

        if (input?.command) lines.push(`\x1b[90m$ ${input.command}\x1b[0m`)
        if (output?.stdout) lines.push(output.stdout)
        if (output?.stderr) lines.push(`\x1b[31m${output.stderr}\x1b[0m`)
        if (output?.exitCode !== undefined && output.exitCode !== 0) {
          lines.push(`\x1b[31m[exit ${output.exitCode}]\x1b[0m`)
        }
        if (part.state === "input-available") streaming = true
      }
    }

    onTerminalUpdate(lines.join("\n"), streaming)
  }, [messages, onTerminalUpdate])

  useEffect(() => {
    if (!onScanStarted && !onScanComplete) return

    let scanSiteOutput: ScanResult | undefined

    for (const msg of messages) {
      for (const rawPart of msg.parts) {
        if (rawPart.type !== "dynamic-tool") continue
        const part = rawPart as DynamicToolUIPart

        if (
          part.toolName === "scanSite" &&
          part.input &&
          !firedScanCallsRef.current.has(`start:${part.toolCallId}`)
        ) {
          const input = part.input as { url: string }
          if (input.url) {
            firedScanCallsRef.current.add(`start:${part.toolCallId}`)
            onScanStarted?.(input.url)
          }
        }

        if (
          part.toolName === "scanSite" &&
          part.state === "output-available" &&
          part.output
        ) {
          scanSiteOutput = part.output as ScanResult
        }

        if (
          part.toolName === "analyzeScanReport" &&
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

  useEffect(() => {
    if (!chatId) return
    const key = `pending-message:${chatId}`
    const pending = sessionStorage.getItem(key)
    if (!pending) return
    sessionStorage.removeItem(key)
    isNewChatRef.current = true
    sendMessage({ text: pending })
  }, [chatId])

  const newChatStreamedRef = useRef(false)
  useEffect(() => {
    if (isNewChatRef.current && (status === "streaming" || status === "submitted")) {
      newChatStreamedRef.current = true
    }
    if (newChatStreamedRef.current && status === "ready") {
      newChatStreamedRef.current = false
      isNewChatRef.current = false
      onChatCreated?.()
    }
  }, [status, onChatCreated])

  function handleSubmit(message: PromptInputMessage) {
    if (!message.text) return
    if (!chatId) {
      const newChatId = nanoid()
      sessionStorage.setItem(`pending-message:${newChatId}`, message.text)
      router.push(`/chat/${newChatId}`)
      return
    }
    sendMessage({ text: message.text })
  }

  function handleQuickChat(text: string) {
    sendMessage({ text })
  }

  if (empty || messages.length === 0) {
    return (
      <div className="relative flex h-screen min-w-0 flex-1 flex-col">
        <ChatHeader
          title={chatTitle}
          previewOpen={previewOpen}
          onTogglePreview={onTogglePreview}
        />
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <h1
            className="mb-8 text-center text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 14 }}
          >
            WHAT DO YOU WANT TO BUILD?
          </h1>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
            <ChatInput
              clearError={clearError}
              status={status}
              onSubmit={handleSubmit}
            />
            <p className="pb-2 text-center text-muted-foreground text-sm">
              AI can make mistakes, please double-check responses.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {QUICK_CHATS.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => handleQuickChat(chat.label)}
                className="border-[3px] border-[var(--black)] bg-[var(--bg-card)] px-3 py-1.5 text-[var(--text-muted)] shadow-[var(--shadow-xs)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--smoke)] hover:shadow-[var(--shadow-md)]"
                style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
              >
                {chat.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <RoasiAnimation className="pointer-events-none fixed bottom-0 left-0 -z-10 w-full" />
      </div>
    )
  }

  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col">
      <ChatHeader title={chatTitle} previewOpen={previewOpen} onTogglePreview={onTogglePreview} />
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

function extractTitle(msgs: UIMessage[]): string | undefined {
  for (const m of msgs) {
    if (m.role !== "assistant") continue
    const meta = m.metadata as { title?: string } | undefined
    if (meta?.title) return meta.title
  }
  return undefined
}

interface BashPart {
  command: string
}

interface BashOutput {
  stdout: string
  stderr: string
  exitCode: number
}
