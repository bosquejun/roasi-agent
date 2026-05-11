import { useState } from "react"
import { ChatInput } from "../chat/ChatInput"
import { MessageThread } from "../chat/MessageThread"
import type { Message } from "../chat/MessageBubble"

interface ChatPanelProps {
  projectName: string
  previewOpen: boolean
  onTogglePreview: () => void
}

export function ChatPanel({ projectName, previewOpen, onTogglePreview }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])

  function handleSend(content: string) {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content }
    const aiMsg: Message = {
      id: crypto.randomUUID(),
      role: "ai",
      content: "Analyzing your metrics... (AI response goes here)",
    }
    setMessages((prev) => [...prev, userMsg, aiMsg])
  }

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "var(--bg-card)",
          borderBottom: "3px solid var(--black)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            letterSpacing: "0.04em",
            color: "var(--text-primary)",
          }}
        >
          {projectName.toUpperCase()}
        </span>
        <button
          onClick={onTogglePreview}
          aria-label={previewOpen ? "Close preview panel" : "Open preview panel"}
          aria-pressed={previewOpen}
          style={{
            padding: "6px 12px",
            background: previewOpen ? "var(--electric-blue)" : "transparent",
            color: previewOpen ? "var(--white)" : "var(--text-muted)",
            border: "3px solid var(--black)",
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "background 150ms, color 150ms",
            boxShadow: previewOpen ? "var(--shadow-xs)" : "none",
          }}
        >
          PREVIEW
        </button>
      </div>

      <MessageThread messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  )
}
