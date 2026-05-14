import type { DynamicToolUIPart, ToolUIPart } from "ai"
import { BashToolRenderer } from "./bash"
import { DefaultToolRenderer } from "./default"
import { PlanToolRenderer } from "./plan"
import type { ToolRenderer } from "./types"

const registry: Record<string, ToolRenderer> = {
  bash: BashToolRenderer,
  planWorkflow: PlanToolRenderer,
}

export function renderToolPart(part: ToolUIPart, messageId: string) {
  const toolName = part.type.split("-").slice(1).join("-")
  const Renderer = registry[toolName] ?? DefaultToolRenderer
  return <Renderer part={part} messageId={messageId} />
}

export function renderDynamicToolPart(
  part: DynamicToolUIPart,
  messageId: string
) {
  const Renderer = registry[part.toolName] ?? DefaultToolRenderer
  return (
    <Renderer
      part={{ ...part, type: `tool-${part.toolName}` } as ToolUIPart}
      messageId={messageId}
    />
  )
}
