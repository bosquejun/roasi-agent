import type { ChatStatus, DynamicToolUIPart, ToolUIPart, UIMessage } from "ai"
import { IconBolt, IconFlame, IconLoader, IconTool } from "@tabler/icons-react"

type IndicatorState =
  | { kind: "thinking" }
  | { kind: "step-start" }
  | { kind: "tool-preparing"; toolName: string }
  | { kind: "tool-running"; toolName: string }
  | { kind: "generating" }
  | null

function deriveState(status: ChatStatus, messages: UIMessage[]): IndicatorState {
  if (status === "ready" || status === "error") return null

  const lastMessage = messages[messages.length - 1]

  if (status === "submitted" || !lastMessage || lastMessage.role !== "assistant") {
    return { kind: "thinking" }
  }

  const lastPart = lastMessage.parts[lastMessage.parts.length - 1]
  if (!lastPart) return { kind: "thinking" }

  if (lastPart.type === "step-start") {
    return { kind: "step-start" }
  }

  if (lastPart.type.startsWith("tool-")) {
    const toolPart = lastPart as ToolUIPart
    const toolName = lastPart.type.split("-").slice(1).join("-")
    if (toolPart.state === "input-streaming") return { kind: "tool-preparing", toolName }
    if (toolPart.state === "input-available") return { kind: "tool-running", toolName }
  }

  if (lastPart.type === "dynamic-tool") {
    const dynPart = lastPart as DynamicToolUIPart
    if (dynPart.state === "input-streaming") return { kind: "tool-preparing", toolName: dynPart.toolName }
    if (dynPart.state === "input-available") return { kind: "tool-running", toolName: dynPart.toolName }
  }

  if (status === "streaming") return { kind: "generating" }

  return null
}

function BouncingDots({ color }: { color: string }) {
  return (
    <span className="inline-flex items-end gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block size-1 rounded-full"
          style={{
            backgroundColor: color,
            animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </span>
  )
}

const stateConfig: Record<
  NonNullable<IndicatorState>["kind"],
  {
    icon: (toolName?: string) => React.ReactNode
    label: string | ((toolName: string) => string)
    accentColor: string
    bgClass: string
    borderClass: string
    textClass: string
  }
> = {
  thinking: {
    icon: () => <IconLoader className="size-3.5 animate-spin" />,
    label: "Sharpening the knives",
    accentColor: "#8A8478",
    bgClass: "bg-smoke",
    borderClass: "border-ash",
    textClass: "text-slate",
  },
  "step-start": {
    icon: () => <IconBolt className="size-3.5 animate-pulse" />,
    label: "Going in harder",
    accentColor: "#F47820",
    bgClass: "bg-fire-org-soft",
    borderClass: "border-fire-orange",
    textClass: "text-fire-orange",
  },
  "tool-preparing": {
    icon: () => <IconTool className="size-3.5 animate-pulse" />,
    label: (toolName) => `Firing up ${toolName}`,
    accentColor: "#4D9EFF",
    bgClass: "bg-blue-soft",
    borderClass: "border-electric-blue",
    textClass: "text-electric-blue",
  },
  "tool-running": {
    icon: (toolName) => <IconTool className="size-3.5 animate-spin" />,
    label: (toolName) => `${toolName} doing the dirty work`,
    accentColor: "#C8F135",
    bgClass: "bg-acid-soft",
    borderClass: "border-acid-lime",
    textClass: "text-[#5A7A00]",
  },
  generating: {
    icon: () => <IconFlame className="size-3.5 animate-pulse" />,
    label: "Roasting",
    accentColor: "#F47820",
    bgClass: "bg-fire-org-soft",
    borderClass: "border-fire-orange",
    textClass: "text-fire-orange",
  },
}

interface StreamingIndicatorProps {
  status: ChatStatus
  messages: UIMessage[]
}

export function StreamingIndicator({ status, messages }: StreamingIndicatorProps) {
  const state = deriveState(status, messages)
  if (!state) return null

  const config = stateConfig[state.kind]
  const toolName = "toolName" in state ? state.toolName : undefined
  const label = typeof config.label === "function" ? config.label(toolName!) : config.label

  return (
    <div
      className={`flex items-center gap-3 border-l-[3px] py-2 pl-3 pr-4 ${config.bgClass} ${config.borderClass}`}
    >
      <span className={config.textClass}>{config.icon(toolName)}</span>
      <span className={`font-pixel text-[8px] tracking-wide ${config.textClass}`}>
        {label}
      </span>
      <BouncingDots color={config.accentColor} />
    </div>
  )
}