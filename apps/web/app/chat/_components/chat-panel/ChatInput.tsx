import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@roaster/ui/components/ai-elements/prompt-input"
import type { ChatStatus } from "ai"

interface ChatInputProps {
  onSubmit: (message: PromptInputMessage) => void
  clearError: () => void
  status: ChatStatus
}

export function ChatInput({ onSubmit, status,clearError }: ChatInputProps) {
  return (
    <PromptInputProvider>
      <PromptInput
        className="rounded-none border-[3px] border-black bg-bg-card shadow-neo-md transition-all duration-base hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-xl"
        multiple
        onSubmit={onSubmit}
      >
        <PromptInputBody>
          <PromptInputTextarea className="!text-md" />
        </PromptInputBody>
        <PromptInputFooter>
          <div />
          <PromptInputSubmit
            status={status}
            size="md"
            className="w-fit px-2 shadow-neo-sm"
            clearError={clearError}
          />
        </PromptInputFooter>
      </PromptInput>
    </PromptInputProvider>
  )
}