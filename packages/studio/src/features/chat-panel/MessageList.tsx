/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@roaster/ui/components/ai-elements/message"
import { cn } from "@roaster/ui/lib/utils"
import type { UIMessage } from "ai"
import type { RefObject } from "react"

interface MessageListProps {
  messages: UIMessage[]
  isLoading: boolean
  bottomRef: RefObject<HTMLDivElement | null>
}

export function MessageList({
  messages,
  isLoading,
  bottomRef,
}: MessageListProps) {
  return (
    <div
      role="log"
      aria-label="Chat messages"
      className="flex flex-1 flex-col overflow-y-auto p-4 pb-40"
    >
      <div className="mx-auto flex h-auto w-full max-w-2xl flex-col">
        {messages.length === 0 && (
          <div
            className="flex flex-1 flex-col items-center justify-center text-center text-[var(--text-muted)]"
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 8,
              lineHeight: 2.5,
            }}
          >
            <span>ASK ME ANYTHING ABOUT</span>
            <br />
            <span>YOUR METRICS</span>
          </div>
        )}
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageContent className="group-[.is-user]:!bg-transparent message-response group-[.is-user]:py-1">
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <MessageResponse
                      key={`${message.id}-${i}`}
                      className={cn({
                        "!p-2 flex flex-col rounded-none border-[3px] border-black bg-bg-card font-semibold text-md shadow-neo-md":
                          message.role === "user",
                        "bg-card text-primary": message.role !== "user",
                      })}
                    >
                      {part.text}
                    </MessageResponse>
                  )
                }
                return null
              })}
            </MessageContent>
          </Message>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <MessageResponse className="animate-pulse bg-[var(--bg-card)] text-[var(--text-primary)]">
              Thinking...
            </MessageResponse>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
