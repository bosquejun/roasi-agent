import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
} from "@roaster/ui/components/ai-elements/tool"
import { cn } from "@roaster/ui/lib/utils"
import type { ToolRendererProps } from "./types"

type BashOutput = {
  stdout?: string
  stderr?: string
  exitCode?: number
}

export function BashToolRenderer({ part, messageId }: ToolRendererProps) {
  const output = part.output as BashOutput | undefined
  const hasOutput = output?.stdout || output?.stderr

  return (
    <Tool key={`${messageId}-${part.toolCallId}`}>
      <ToolHeader type={part.type} state={part.state} />
      <ToolContent>
        <ToolInput input={part.input} />
        {hasOutput && (
          <div className="space-y-1.5">
            <h4 className="font-pixel text-[8px] tracking-widest text-slate uppercase">
              Output
            </h4>
            <div
              className={cn(
                "border-[2px] border-black bg-[#0A0A0A] p-2",
                output.exitCode !== 0 && "border-fire-red"
              )}
            >
              {output.stdout && (
                <pre className="font-mono text-[11px] text-acid-lime whitespace-pre-wrap break-all">
                  {output.stdout}
                </pre>
              )}
              {output.stderr && (
                <pre className="font-mono text-[11px] text-fire-red whitespace-pre-wrap break-all">
                  {output.stderr}
                </pre>
              )}
              {output.exitCode !== undefined && output.exitCode !== 0 && (
                <p className="mt-1 font-pixel text-[8px] text-fire-red">
                  Exit {output.exitCode}
                </p>
              )}
            </div>
          </div>
        )}
      </ToolContent>
    </Tool>
  )
}
