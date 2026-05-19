/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client"

import { useChat } from "@ai-sdk/react"
import type { ScanResult } from "@roaster/ai"
import { RoasiAnimation } from "@roaster/sprite-animations/components/roasi/RoasiAnimation"
import type { PromptInputMessage } from "@roaster/ui/components/ai-elements/prompt-input"
import {
  PromptInputProvider,
  usePromptInputController,
} from "@roaster/ui/components/ai-elements/prompt-input"
import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import { TypingAnimation } from "@roaster/ui/components/typing-animation"
import type { DynamicToolUIPart, ToolUIPart, UIMessage } from "ai"
import { DefaultChatTransport } from "ai"
import { nanoid } from "nanoid"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { Turnstile } from "@marsidev/react-turnstile"
import { ChatHeader } from "./ChatHeader"
import { ChatInput } from "./ChatInput"
import ConversationPanel from "./ConversationPanel"

interface ChatPanelProps {
  chatId?: string
  title?: string
  previewOpen: boolean
  onTogglePreview: () => void
  onScanStarted?: () => void
  onScanComplete?: (reportPath: string) => void
  onChatCreated?: () => void
  empty?: boolean
  messages?: UIMessage[]
}

const QUICK_CHATS = [
  { id: "1", label: "Audit my website" },
  { id: "2", label: "Why is my site slow?" },
  { id: "3", label: "Check my Lighthouse score" },
  { id: "4", label: "How do I improve my performance?" },
]

export function ChatPanel({
  chatId,
  title: titleProp,
  previewOpen,
  onTogglePreview,
  onScanStarted,
  onScanComplete,
  onChatCreated,
  messages: defaultMessages,
  empty = false,
}: ChatPanelProps) {
  const router = useRouter()
  const isNewChatRef = useRef(false)
  const turnstileTokenRef = useRef<string | null>(null)
  const { messages, sendMessage, status, regenerate, error, clearError } =
    useChat({
      transport: new DefaultChatTransport({
        prepareSendMessagesRequest({ messages, id }) {
          return {
            body: {
              message: messages[messages.length - 1],
              id,
              turnstileToken: turnstileTokenRef.current,
            },
          }
        },
      }),
      messages: defaultMessages,
      id: chatId,
      resume: !!chatId && (defaultMessages?.length ?? 0) > 0,
    })
  const chatTitle = titleProp ?? extractTitle(messages)
  const bottomRef = useRef<HTMLDivElement>(null)
  const firedScanCallsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!onScanStarted && !onScanComplete) return

    function getToolInfo(
      rawPart: (typeof messages)[0]["parts"][0]
    ): { name: string; part: ToolUIPart } | null {
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

    let scanSiteOutput: ScanResult | undefined
    for (const msg of messages) {
      for (const rawPart of msg.parts) {
        const info = getToolInfo(rawPart)
        if (!info) continue
        if (
          info.name === "scanSite" &&
          info.part.state === "output-available" &&
          info.part.output
        ) {
          scanSiteOutput = info.part.output as ScanResult
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
          (part.state === "input-available" ||
            part.state === "output-available") &&
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
    if (
      isNewChatRef.current &&
      (status === "streaming" || status === "submitted")
    ) {
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

  if (empty || messages.length === 0) {
    return (
      <div className="relative flex h-screen min-w-0 flex-1 flex-col">
        <ChatHeader
          title={chatTitle}
          previewOpen={previewOpen}
          onTogglePreview={onTogglePreview}
        />
        <BackgroundRippleEffect rows={17} cellSize={32} cols={72} />
        <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center px-4">
          <h1
            className="mb-8 flex flex-wrap items-center justify-center gap-x-[0.4em] text-center text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 14 }}
          >
            <span>WHAT</span>
            <TypingAnimation
              loop
              words={["WEBSITE", "PORTFOLIO", "STARTUP", "LANDING PAGE"]}
              pauseDelay={3000}
              className="text-fire-orange"
            />
            <span>ARE WE LOOKING AT?</span>
          </h1>
          <PromptInputProvider>
            <div className="pointer-events-auto mx-auto flex w-full max-w-2xl flex-col gap-2">
              <ChatInput
                clearError={clearError}
                status={status}
                onSubmit={handleSubmit}
              />
              <p className="pb-2 text-center text-muted-foreground text-sm">
                AI can make mistakes, please double-check responses.
              </p>
            </div>
            <QuickChatButtons />
          </PromptInputProvider>
        </div>
        <RoasiAnimation className="pointer-events-none fixed bottom-0 left-0 -z-10 w-full" />
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          options={{ appearance: "interaction-only" }}
          onSuccess={(token) => {
            turnstileTokenRef.current = token
          }}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col">
      <ChatHeader
        title={chatTitle}
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
          <PromptInputProvider>
            <ChatInput
              clearError={clearError}
              status={status}
              onSubmit={handleSubmit}
            />
          </PromptInputProvider>
          <p className="pb-2 text-center text-muted-foreground text-sm">
            AI can make mistakes, please double-check responses.
          </p>
        </div>
      </div>
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        options={{ appearance: "interaction-only" }}
        onSuccess={(token) => {
          turnstileTokenRef.current = token
        }}
        className="hidden"
      />
    </div>
  )
}

function QuickChatButtons() {
  const { textInput } = usePromptInputController()
  return (
    <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-2">
      {QUICK_CHATS.map((chat) => (
        <button
          key={chat.id}
          type="button"
          onClick={() => textInput.setInput(chat.label)}
          className="border-[3px] border-[var(--black)] bg-[var(--bg-card)] px-3 py-1.5 text-[var(--text-muted)] shadow-[var(--shadow-xs)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--smoke)] hover:shadow-[var(--shadow-md)]"
          style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
        >
          {chat.label.toUpperCase()}
        </button>
      ))}
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
