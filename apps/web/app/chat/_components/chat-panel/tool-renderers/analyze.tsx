import { DefaultToolRenderer } from "./default"
import type { ToolRendererProps } from "./types"

export function AnalyzeToolRenderer({ part, messageId }: ToolRendererProps) {
  return <DefaultToolRenderer part={part} messageId={messageId} />
}
