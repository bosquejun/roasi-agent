import {
  Terminal,
  TerminalActions,
  TerminalContent,
  TerminalCopyButton,
  TerminalHeader,
  TerminalTitle,
} from "@roaster/ui/components/ai-elements/terminal"
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
} from "@roaster/ui/components/ai-elements/tool"
import type { ToolRendererProps } from "./types"

type BashInput = { command?: string }
type BashOutput = {
  stdout?: string
  stderr?: string
  exitCode?: number
}

export function BashToolRenderer({ part, messageId }: ToolRendererProps) {
  const input = (part.input ?? {}) as BashInput
  const output = part.output as BashOutput | undefined
  const isStreaming = part.state === "input-available"
  const hasOutput = output?.stdout || output?.stderr

  const terminalOutput = [
    output?.stdout ?? "",
    output?.stderr ? `\x1b[31m${output.stderr}\x1b[0m` : "",
    output?.exitCode !== undefined && output.exitCode !== 0
      ? `\x1b[31m[exit ${output.exitCode}]\x1b[0m`
      : "",
  ]
    .filter(Boolean)
    .join("\n")

  const title = input.command
    ? input.command.length > 48
      ? `${input.command.slice(0, 48)}…`
      : input.command
    : "bash"

  return (
    <Tool key={`${messageId}-${part.toolCallId}`}>
      <ToolHeader type={part.type} state={part.state} />
      <ToolContent>
        <ToolInput input={part.input} />
        {(hasOutput || isStreaming) && (
          <Terminal
            output={terminalOutput}
            isStreaming={isStreaming}
            className="rounded-none border-[3px] border-black"
          >
            <TerminalHeader>
              <TerminalTitle>{title}</TerminalTitle>
              <TerminalActions>
                <TerminalCopyButton />
              </TerminalActions>
            </TerminalHeader>
            <TerminalContent className="max-h-64 text-[11px]" />
          </Terminal>
        )}
      </ToolContent>
    </Tool>
  )
}
