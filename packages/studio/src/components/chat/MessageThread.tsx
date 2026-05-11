import { useEffect, useRef } from "react"
import { MessageBubble, type Message } from "./MessageBubble"

interface MessageThreadProps {
  messages: Message[]
}

export function MessageThread({ messages }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length === 0) return
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div
      role="log"
      aria-label="Chat messages"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.length === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 2,
          }}
        >
          <span>ASK ME ANYTHING ABOUT</span>
          <br />
          <span>YOUR METRICS</span>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
