import type { ToolUIPart } from "ai"

export type ToolRendererProps = {
  part: ToolUIPart
  messageId: string
}

export type ToolRenderer = (props: ToolRendererProps) => React.ReactNode
