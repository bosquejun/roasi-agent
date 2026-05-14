import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@roaster/ui/components/collapsible"
import { getStatusBadge } from "@roaster/ui/components/ai-elements/tool"
import { cn } from "@roaster/ui/lib/utils"
import type { DynamicToolUIPart, ToolUIPart } from "ai"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleIcon,
  Loader2Icon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react"

export type AnyToolPart =
  | ToolUIPart
  | (DynamicToolUIPart & { type: string })

function getToolName(part: AnyToolPart): string {
  if (part.type === "dynamic-tool") return (part as DynamicToolUIPart).toolName
  return part.type.replace(/^tool-/, "")
}

function getTaskLabel(part: AnyToolPart, index: number): string {
  const toolName = getToolName(part)
  const n = index + 1
  const raw = part.input as Record<string, string> | undefined | null

  switch (toolName) {
    case "loadSkill":
      return `Task ${n}: Loading ${raw?.name ?? "skill"} skill`
    case "bash": {
      const cmd = raw?.command ?? ""
      if (cmd.includes("unlighthouse") || cmd.includes("lighthouse"))
        return `Task ${n}: Running Lighthouse scan`
      const label = cmd.length > 55 ? `${cmd.slice(0, 55)}…` : cmd
      return `Task ${n}: ${label || "Running command"}`
    }
    case "readFile":
      return `Task ${n}: Reading ${raw?.path ?? "file"}`
    case "scanSite":
      return `Task ${n}: Scanning ${raw?.url ?? "site"}`
    case "analyzeResults":
      return `Task ${n}: Analyzing audit results`
    default:
      return `Task ${n}: ${toolName}`
  }
}

const stateLeftBorder: Partial<Record<ToolUIPart["state"], string>> = {
  "output-available": "border-l-[3px] border-l-acid-lime",
  "output-error": "border-l-[3px] border-l-fire-red",
  "output-denied": "border-l-[3px] border-l-fire-red",
  "input-available": "border-l-[3px] border-l-fire-orange",
}

function TaskStatusIcon({ state }: { state: ToolUIPart["state"] }) {
  switch (state) {
    case "output-available":
      return <CheckCircle2Icon className="size-3 shrink-0 text-acid-lime" />
    case "output-error":
    case "output-denied":
      return <XCircleIcon className="size-3 shrink-0 text-fire-red" />
    case "input-available":
      return <Loader2Icon className="size-3 shrink-0 animate-spin text-fire-orange" />
    default:
      return <CircleIcon className="size-3 shrink-0 text-slate opacity-50" />
  }
}

interface TaskSummaryProps {
  parts: AnyToolPart[]
  messageId: string
}

export function TaskSummary({ parts, messageId }: TaskSummaryProps) {
  if (parts.length === 0) return null

  const doneCount = parts.filter((p) => p.state === "output-available").length
  const hasError = parts.some(
    (p) => p.state === "output-error" || p.state === "output-denied"
  )
  const isRunning = parts.some((p) => p.state === "input-available")

  const overallState: ToolUIPart["state"] = hasError
    ? "output-error"
    : doneCount === parts.length
      ? "output-available"
      : isRunning
        ? "input-available"
        : "input-streaming"

  return (
    <Collapsible className="group mb-3 w-full border-[3px] border-black" defaultOpen>
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-3 py-2 border-b-[3px] border-black group-data-[state=closed]:border-b-0">
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-3.5 text-slate" />
          <span
            className="tracking-widest uppercase text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
          >
            Site Audit
          </span>
          {getStatusBadge(overallState)}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="tabular-nums text-slate"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
          >
            {doneCount}/{parts.length}
          </span>
          <ChevronDownIcon className="size-4 text-slate transition-transform duration-150 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="bg-smoke p-3 space-y-1.5 outline-none">
        {parts.map((part, i) => {
          const state = (part as ToolUIPart).state ?? "input-streaming"
          return (
            <div
              key={`${messageId}-task-${i}`}
              className={cn(
                "flex items-center gap-2.5 bg-[var(--bg-card)] px-2.5 py-2 border-[2px] border-black border-l-[3px]",
                stateLeftBorder[state] ?? "border-l-ash"
              )}
            >
              <TaskStatusIcon state={state} />
              <span
                className="text-[var(--text-secondary)] leading-tight"
                style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
              >
                {getTaskLabel(part, i)}
              </span>
            </div>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}
