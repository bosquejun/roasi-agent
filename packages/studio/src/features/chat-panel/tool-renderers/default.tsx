import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@roaster/ui/components/ai-elements/tool"
import type { ToolRendererProps } from "./types"

export function DefaultToolRenderer({ part, messageId }: ToolRendererProps) {
  return (
    <Tool key={`${messageId}-${part.toolCallId}`}>
      <ToolHeader type={part.type} state={part.state} />
      <ToolContent>
        <ToolInput input={part.input} />
        <ToolOutput output={part.output} errorText={part.errorText} />
      </ToolContent>
    </Tool>
  )
}
