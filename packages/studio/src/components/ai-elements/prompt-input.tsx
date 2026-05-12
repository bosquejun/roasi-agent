"use client"

import { type ComponentProps, useState, useRef, useCallback } from "react"
import { cn } from "@roaster/ui/lib/utils"
import { Button } from "@roaster/ui/components/button"

export interface PromptInputMessage {
  text: string
  files?: File[]
}

export interface PromptInputProps {
  onSubmit: (message: PromptInputMessage) => void
  className?: string
}

export function PromptInput({ onSubmit, className }: PromptInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit({ text: trimmed })
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [value, onSubmit])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div
      className={cn(
        "border-[3px] border-[var(--black)] shadow-[var(--shadow-md)] bg-[var(--bg-card)] p-1.5 flex gap-2 items-end",
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        aria-label="Message"
        placeholder="Ask about your metrics..."
        rows={1}
        className="flex-1 resize-none px-2.5 py-2 bg-[var(--bg-base)] text-[var(--text-primary)] outline-none leading-6 overflow-auto"
        style={{ fontFamily: "var(--font-mono)", fontSize: 13, boxSizing: "border-box" }}
      />
      <Button
        onClick={handleSubmit}
        disabled={!value.trim()}
        variant="primary"
        size="sm"
        className="shrink-0"
      >
        SEND
      </Button>
    </div>
  )
}

export type PromptInputTextareaProps = ComponentProps<"textarea">

export function PromptInputTextarea({
  className,
  ...props
}: PromptInputTextareaProps) {
  return (
    <textarea
      className={cn(
        "flex-1 resize-none px-2.5 py-2 bg-[var(--bg-base)] text-[var(--text-primary)] outline-none leading-6 overflow-auto",
        className
      )}
      style={{ fontFamily: "var(--font-mono)", fontSize: 13, boxSizing: "border-box" }}
      {...props}
    />
  )
}

export interface PromptInputSubmitProps {
  disabled?: boolean
  className?: string
}

export function PromptInputSubmit({
  disabled,
  className
}: PromptInputSubmitProps) {
  return (
    <Button
      type="submit"
      disabled={disabled}
      variant="primary"
      size="sm"
      className={cn("shrink-0", className)}
    >
      SEND
    </Button>
  )
}