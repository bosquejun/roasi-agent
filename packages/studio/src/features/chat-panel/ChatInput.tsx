import { type PromptInputMessage } from "@/components/ai-elements/prompt-input"
import { PromptInput } from "@/components/ai-elements/prompt-input"

interface ChatInputProps {
  onSubmit: (message: PromptInputMessage) => void
}

export function ChatInput({ onSubmit }: ChatInputProps) {
  return <PromptInput onSubmit={onSubmit} />
}