import { getStatusBadge } from "@roaster/ui/components/ai-elements/tool"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@roaster/ui/components/collapsible"
import { cn } from "@roaster/ui/lib/utils"
import type { DynamicToolUIPart, ToolUIPart } from "ai"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleIcon,
  Loader2Icon,
  SkipForwardIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react"

export type AnyToolPart = ToolUIPart | (DynamicToolUIPart & { type: string })

function getToolName(part: AnyToolPart): string {
  if (part.type === "dynamic-tool") return (part as DynamicToolUIPart).toolName
  return part.type.replace(/^tool-/, "")
}

type StepStatus = "pending" | "in_progress" | "done" | "error" | "skipped"

type PlanStepDecl = { id: string; label: string; description?: string }
type PlanInput = { title: string; steps: PlanStepDecl[] }
type StepUpdateOutput = {
  type: "step-update"
  stepId: string
  status: StepStatus
  summary?: string
}

const planStepIcon: Record<StepStatus, React.ReactNode> = {
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

const planStepBorder: Record<StepStatus, string> = {
  pending: "border-l-ash",
  in_progress: "border-l-fire-orange",
  done: "border-l-acid-lime",
  error: "border-l-fire-red",
  skipped: "border-l-ash",
}

function buildStepStatusMap(
  updateParts: AnyToolPart[]
): Map<string, { status: StepStatus; summary?: string }> {
  const map = new Map<string, { status: StepStatus; summary?: string }>()
  for (const part of updateParts) {
    if ((part as ToolUIPart).state !== "output-available") continue
    const output = (part as ToolUIPart).output as StepUpdateOutput | undefined
    if (output?.stepId)
      map.set(output.stepId, { status: output.status, summary: output.summary })
  }
  return map
}

function StepRow({
  id,
  label,
  status,
  summary,
  messageId,
}: {
  id: string
  label: string
  status: StepStatus
  summary?: string
  messageId: string
}) {
  return (
    <div
      key={`${messageId}-plan-${id}`}
      className={cn(
        "flex flex-col gap-0.5 border-[2px] border-black border-l-[3px] bg-bg-card px-2.5 py-1.5",
        planStepBorder[status]
      )}
    >
      <div className="flex items-center gap-2">
        {planStepIcon[status]}
        <span
          className="text-text-secondary leading-tight"
          style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
        >
          {label}
        </span>
      </div>
      {summary && (
        <p
          className="pl-5 text-slate leading-tight opacity-70"
          style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
        >
          {summary}
        </p>
      )}
    </div>
  )
}

function PlanSection({
  planPart,
  statusMap,
  resolvedPending,
  messageId,
}: {
  planPart: AnyToolPart
  statusMap: Map<string, { status: StepStatus; summary?: string }>
  resolvedPending: (status: StepStatus) => StepStatus
  messageId: string
}) {
  const input = (planPart.input ?? {}) as Partial<PlanInput>
  const declaredSteps = input.steps ?? []
  const declaredIds = new Set(declaredSteps.map((s) => s.id))

  const dynamicSteps = [...statusMap.entries()]
    .filter(([id]) => !declaredIds.has(id))
    .map(([id, { status, summary }]) => ({ id, label: id, status, summary }))

  return (
    <div className="mb-1.5 space-y-1">
      {input.title && (
        <p
          className="px-0.5 text-slate uppercase tracking-widest opacity-60"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
        >
          {input.title}
        </p>
      )}
      {declaredSteps.map((step) => {
        const resolved = statusMap.get(step.id) ?? {
          status: "pending" as StepStatus,
        }
        return (
          <StepRow
            key={step.id}
            id={step.id}
            label={step.label}
            status={resolvedPending(resolved.status)}
            summary={resolved.summary}
            messageId={messageId}
          />
        )
      })}
      {dynamicSteps.map((step) => (
        <StepRow
          key={step.id}
          id={step.id}
          label={step.label}
          status={resolvedPending(step.status)}
          summary={step.summary}
          messageId={messageId}
        />
      ))}
    </div>
  )
}

interface TaskSummaryProps {
  parts: AnyToolPart[]
  messageId: string
  chatDone: boolean
}

export function TaskSummary({ parts, messageId, chatDone }: TaskSummaryProps) {
  const planPart = parts.find((p) => getToolName(p) === "planWorkflow")
  const updateParts = parts.filter((p) => getToolName(p) === "updateStep")

  if (!planPart && updateParts.length === 0) return null

  const rawStatusMap = buildStepStatusMap(updateParts)
  const planSteps =
    (planPart?.input as Partial<PlanInput> | undefined)?.steps ?? []

  const statusMap: typeof rawStatusMap = chatDone
    ? new Map(
        [...rawStatusMap.entries()].map(([id, entry]) => [
          id,
          entry.status === "pending"
            ? { ...entry, status: "skipped" as StepStatus }
            : entry.status === "in_progress"
              ? { ...entry, status: "done" as StepStatus }
              : entry,
        ])
      )
    : rawStatusMap

  const resolvedPending = (status: StepStatus): StepStatus => {
    if (!chatDone) return status
    if (status === "pending") return "skipped"
    if (status === "in_progress") return "done"
    return status
  }

  const declaredIds = new Set(planSteps.map((s) => s.id))
  const dynamicStepCount = [...statusMap.keys()].filter(
    (id) => !declaredIds.has(id)
  ).length
  const totalCount = planSteps.length + dynamicStepCount
  const doneCount = [...statusMap.entries()].filter(
    ([, { status }]) => status === "done"
  ).length

  const stepStatuses = [...statusMap.values()].map((s) => s.status)
  const hasError = stepStatuses.some((s) => s === "error")
  const isRunning =
    !chatDone &&
    (stepStatuses.some((s) => s === "in_progress") ||
      updateParts.some((p) => (p as ToolUIPart).state === "input-available"))

  const overallState: ToolUIPart["state"] = hasError
    ? "output-error"
    : chatDone || (doneCount === totalCount && totalCount > 0)
      ? "output-available"
      : isRunning
        ? "input-available"
        : "input-streaming"

  return (
    <Collapsible className="group w-full border-[3px] border-black" defaultOpen>
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 border-black border-b-[3px] px-3 py-2 group-data-[state=closed]:border-b-0">
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-3.5 text-slate" />
          <span
            className="text-text-primary uppercase tracking-widest"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
          >
            Tasks
          </span>
          {getStatusBadge(overallState)}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-slate tabular-nums"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
          >
            {doneCount}/{totalCount}
          </span>
          <ChevronDownIcon className="size-4 text-slate transition-transform duration-150 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-1.5 bg-smoke p-3 outline-none">
        {planPart ? (
          <PlanSection
            planPart={planPart}
            statusMap={statusMap}
            resolvedPending={resolvedPending}
            messageId={messageId}
          />
        ) : (
          [...statusMap.entries()].map(([id, { status, summary }]) => (
            <StepRow
              key={id}
              id={id}
              label={id}
              status={resolvedPending(status)}
              summary={summary}
              messageId={messageId}
            />
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
