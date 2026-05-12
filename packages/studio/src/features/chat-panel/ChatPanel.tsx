/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client"

import { useChat } from "@ai-sdk/react"
import type { PromptInputMessage } from "@roaster/ui/components/ai-elements/prompt-input"
import { useEffect, useRef } from "react"
import { ChatHeader } from "./ChatHeader"
import { ChatInput } from "./ChatInput"
import { MessageList } from "./MessageList"

interface ChatPanelProps {
  projectName: string
  previewOpen: boolean
  onTogglePreview: () => void
}

export function ChatPanel({
  projectName,
  previewOpen,
  onTogglePreview,
}: ChatPanelProps) {
  const { messages, sendMessage, status } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSubmit(message: PromptInputMessage) {
    if (!message.text) return
    sendMessage({ text: message.text })
  }

  const isLoading = status === "streaming"

  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col">
      <ChatHeader
        projectName={projectName}
        previewOpen={previewOpen}
        onTogglePreview={onTogglePreview}
      />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        bottomRef={bottomRef}
      />
      <div className="absolute right-0 bottom-0 left-0 mx-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 bg-[var(--bg-base)]">
          <ChatInput status="ready" onSubmit={handleSubmit} />
          <p className="pb-2 text-center text-muted-foreground text-sm">
            AI can make mistakes, please double-check responses.
          </p>
        </div>
      </div>
    </div>
  )
}
