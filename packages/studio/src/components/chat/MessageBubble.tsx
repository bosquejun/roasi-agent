export type MessageRole = "user" | "ai"

export interface Message {
  id: string
  role: MessageRole
  content: string
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: "72%",
          padding: "10px 14px",
          background: isUser ? "var(--fire-red)" : "var(--bg-card)",
          color: isUser ? "#fff" : "var(--text-primary)",
          border: "3px solid var(--black)",
          boxShadow: "var(--shadow-xs)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    </div>
  )
}
