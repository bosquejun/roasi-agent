import {
  Tool,
  ToolContent,
  ToolHeader,
} from "@roaster/ui/components/ai-elements/tool"
import { cn } from "@roaster/ui/lib/utils"
import {
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  SkipForwardIcon,
  XCircleIcon,
} from "lucide-react"
import type { ToolRendererProps } from "./types"

type PlanStep = {
  id: string
  label: string
  description?: string
  status: "pending" | "in_progress" | "done" | "error" | "skipped"
  summary?: string
}

type PlanOutput = {
  type: "plan"
  title: string
  steps: PlanStep[]
}

const stepStatusIcon: Record<PlanStep["status"], React.ReactNode> = {
  pending: <CircleIcon className="size-3 shrink-0 text-slate opacity-50" />,
  in_progress: (
    <Loader2Icon className="size-3 shrink-0 animate-spin text-fire-orange" />
  ),
  done: <CheckCircle2Icon className="size-3 shrink-0 text-acid-lime" />,
  error: <XCircleIcon className="size-3 shrink-0 text-fire-red" />,
  skipped: (
    <SkipForwardIcon className="size-3 shrink-0 text-slate opacity-40" />
  ),
}

const stepBorderColor: Record<PlanStep["status"], string> = {
  pending: "border-l-ash",
  in_progress: "border-l-fire-orange",
  done: "border-l-acid-lime",
  error: "border-l-fire-red",
  skipped: "border-l-ash",
}

export function PlanToolRenderer({ part, messageId }: ToolRendererProps) {
  const output = part.output as PlanOutput | undefined
  const input = (part.input ?? {}) as {
    title?: string
    steps?: Omit<PlanStep, "status">[]
  }
  const steps: PlanStep[] =
    output?.steps ??
    input.steps?.map((s) => ({ ...s, status: "pending" })) ??
    []

  return (
    <Tool key={`${messageId}-${part.toolCallId}`}>
      <ToolHeader
        type={part.type}
        state={part.state}
        title={input.title ?? ""}
      />
      <ToolContent className="space-y-1.5 p-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex flex-col gap-0.5 border-[2px] border-black border-l-[3px] bg-bg-card px-2.5 py-2",
              stepBorderColor[step.status]
            )}
          >
            <div className="flex items-center gap-2">
              {stepStatusIcon[step.status]}
              <span
                className="text-text-secondary leading-tight"
                style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
              >
                {step.label}
              </span>
            </div>
            {step.summary && (
              <p
                className="pl-5 text-slate leading-tight opacity-70"
                style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
              >
                {step.summary}
              </p>
            )}
          </div>
        ))}
      </ToolContent>
    </Tool>
  )
}
