"use client"

import { cn } from "@roaster/ui/lib/utils"
import { useChat } from "@ai-sdk/react"
import { useEffect, useRef } from "react"
import { MessageList } from "./MessageList"
import { ChatHeader } from "./ChatHeader"
import { ChatInput } from "./ChatInput"
import { type PromptInputMessage } from "@/components/ai-elements/prompt-input"

interface ChatPanelProps {
  projectName: string
  previewOpen: boolean
  onTogglePreview: () => void
}

export function ChatPanel({ projectName, previewOpen, onTogglePreview }: ChatPanelProps) {
  const { messages, sendMessage, status } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSubmit(message: PromptInputMessage) {
    sendMessage({ text: message.text })
  }

  const isLoading = status === "streaming"

  return (
    <div className="flex-1 min-w-0 flex flex-col h-screen relative">
      <ChatHeader
        projectName={projectName}
        previewOpen={previewOpen}
        onTogglePreview={onTogglePreview}
      />
      <MessageList messages={messages} isLoading={isLoading} bottomRef={bottomRef} />
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-[var(--bg-base)]">
        <div className="w-full max-w-2xl mx-auto">
          <ChatInput onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}

export { type PromptInputMessage } from "@/components/ai-elements/prompt-input"