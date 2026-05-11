import { useState, useRef } from "react"

interface ChatInputProps {
  onSend: (message: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: 12,
        borderTop: "3px solid var(--black)",
        background: "var(--bg-card)",
        alignItems: "flex-end",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your metrics..."
        rows={1}
        style={{
          flex: 1,
          resize: "none",
          border: "3px solid var(--black)",
          padding: "8px 10px",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          background: "var(--bg-base)",
          color: "var(--text-primary)",
          outline: "none",
          lineHeight: 1.5,
          overflow: "hidden",
        }}
      />
      <button
        onClick={handleSend}
        style={{
          padding: "10px 14px",
          background: "var(--acid-lime)",
          color: "var(--black)",
          border: "3px solid var(--black)",
          boxShadow: "var(--shadow-sm)",
          fontFamily: "var(--font-pixel)",
          fontSize: 8,
          cursor: "pointer",
          transition: "box-shadow 80ms, transform 80ms",
          flexShrink: 0,
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow = "none"
          e.currentTarget.style.transform = "translate(2px, 2px)"
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-sm)"
          e.currentTarget.style.transform = "none"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-sm)"
          e.currentTarget.style.transform = "none"
        }}
      >
        SEND
      </button>
    </div>
  )
}
