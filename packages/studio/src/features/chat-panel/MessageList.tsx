import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message"
import type { RefObject } from "react"
import type { UIMessage } from "ai"

interface MessageListProps {
  messages: UIMessage[]
  isLoading: boolean
  bottomRef: RefObject<HTMLDivElement | null>
}

export function MessageList({ messages, isLoading, bottomRef }: MessageListProps) {
  return (
    <div
      role="log"
      aria-label="Chat messages"
      className="flex-1 overflow-y-auto p-4 flex flex-col"
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
        {messages.length === 0 && (
          <div
            className="flex-1 flex flex-col items-center justify-center text-center text-[var(--text-muted)]"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8, lineHeight: 2.5 }}
          >
            <span>ASK ME ANYTHING ABOUT</span>
            <br />
            <span>YOUR METRICS</span>
          </div>
        )}
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageContent>
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <MessageResponse
                      key={`${message.id}-${i}`}
                      className={
                        message.role === "user"
                          ? "bg-[var(--fire-red)] text-[var(--white)]"
                          : "bg-[var(--bg-card)] text-[var(--text-primary)]"
                      }
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
            <MessageResponse className="bg-[var(--bg-card)] text-[var(--text-primary)] animate-pulse">
              Thinking...
            </MessageResponse>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}