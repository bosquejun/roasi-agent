import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@roaster/ui/components/ai-elements/conversation"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@roaster/ui/components/ai-elements/message"
import {
  getStatusBadge,
  type ToolPart,
} from "@roaster/ui/components/ai-elements/tool"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@roaster/ui/components/collapsible"
import { cn } from "@roaster/ui/lib/utils"
import { IconAlertTriangle, IconCopy, IconRefresh } from "@tabler/icons-react"
import type { ChatStatus, DynamicToolUIPart, ToolUIPart, UIMessage } from "ai"
import { ChevronDownIcon, WrenchIcon } from "lucide-react"
import { Fragment } from "react/jsx-runtime"
import { StreamingIndicator } from "./StreamingIndicator"
import { type AnyToolPart, TaskSummary } from "./TaskSummary"
import {
  renderDynamicToolPart,
  renderToolPart,
} from "./tool-renderers/index"
import type { AnalyzeResult } from "./tool-renderers/scan-results-card"
import { ScanResultsCard } from "./tool-renderers/scan-results-card"

const PLAN_TOOLS = new Set(["planWorkflow", "updateStep"])

function getToolName(part: AnyToolPart): string {
  if (part.type === "dynamic-tool") return (part as DynamicToolUIPart).toolName
  return part.type.replace(/^tool-/, "")
}

interface ToolGroup {
  toolName: string
  parts: AnyToolPart[]
}

function groupConsecutive(parts: AnyToolPart[]): ToolGroup[] {
  const groups: ToolGroup[] = []
  for (const part of parts) {
    const name = getToolName(part)
    const last = groups[groups.length - 1]
    if (last && last.toolName === name) {
      last.parts.push(part)
    } else {
      groups.push({ toolName: name, parts: [part] })
    }
  }
  return groups
}

const STATE_PRIORITY: Record<ToolPart["state"], number> = {
  "output-error": 0,
  "output-denied": 1,
  "input-available": 2,
  "approval-requested": 3,
  "input-streaming": 4,
  "approval-responded": 5,
  "output-available": 6,
}

function worstState(parts: AnyToolPart[]): ToolPart["state"] {
  const states = parts
    .map((p) => (p as ToolUIPart).state)
    .filter((s): s is ToolPart["state"] => s !== undefined)
  return (
    states.sort((a, b) => STATE_PRIORITY[a] - STATE_PRIORITY[b])[0] ??
    "input-streaming"
  )
}

function GroupedToolRenderer({
  group,
  messageId,
}: {
  group: ToolGroup
  messageId: string
}) {
  const state = worstState(group.parts)
  return (
    <Collapsible className="group mb-3 w-full rounded-md border">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 border-black border-b-[3px] px-3 py-2 group-data-[state=closed]:border-b-0">
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-3.5 text-slate" />
          <span className="font-pixel text-[10px] tracking-wide">
            {group.toolName}
          </span>
          {getStatusBadge(state)}
          <span
            className="border-[2px] border-black px-1.5 py-0.5 text-slate"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
          >
            ×{group.parts.length}
          </span>
        </div>
        <ChevronDownIcon className="size-4 text-slate transition-transform duration-150 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 bg-smoke p-2 outline-none">
        {group.parts.map((part, i) => (
          <div
            key={`${messageId}-grouped-${i}`}
            className="border-[2px] border-black"
          >
            {part.type === "dynamic-tool"
              ? renderDynamicToolPart(part as DynamicToolUIPart, messageId)
              : renderToolPart(part as ToolUIPart, messageId)}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface ConversationPanelProps {
  messages: UIMessage[]
  regenerate: () => void
  status: ChatStatus
  error?: Error
}

export default function ConversationPanel({
  messages,
  regenerate,
  status,
  error,
}: ConversationPanelProps) {
  return (
    <Conversation>
      <ConversationContent className="mx-auto max-w-2xl px-8 pb-48">
        {messages.map((message, messageIndex) => {
          const isLastMessage = messageIndex === messages.length - 1
          const textParts = message.parts.filter((p) => p.type === "text") as {
            type: "text"
            text: string
          }[]
          const toolParts = message.parts.filter(
            (p) => p.type === "dynamic-tool" || p.type.startsWith("tool-")
          ) as AnyToolPart[]

          const planParts = toolParts.filter((p) =>
            PLAN_TOOLS.has(getToolName(p))
          )
          const otherParts = toolParts.filter(
            (p) => !PLAN_TOOLS.has(getToolName(p))
          )
          const otherGroups = groupConsecutive(otherParts)
          const scanResults = otherParts
            .filter(
              (p) =>
                getToolName(p) === "analyzeScanReport" &&
                (p as ToolUIPart).state === "output-available" &&
                (p as ToolUIPart).output
            )
            .map((p) => (p as ToolUIPart).output as AnalyzeResult)

          return (
            <Fragment key={`${message.id}-${messageIndex}`}>
              {process.env.NODE_ENV === "development" && (
                <pre className="text-[8px] text-slate opacity-50">
                  {JSON.stringify(message.parts.map((p) => p.type))}
                </pre>
              )}
              {textParts.map((part, i) => (
                <Fragment key={`${message.id}-text-${i}`}>
                  <Message from={message.role}>
                    <MessageContent className="group-[.is-user]:!bg-transparent group-[.is-user]:py-1">
                      <MessageResponse
                        className={cn("font-medium text-md", {
                          "!p-2 flex flex-col rounded-none border-[3px] border-black bg-bg-card font-semibold text-md shadow-neo-sm":
                            message.role === "user",
                        })}
                      >
                        {part.text}
                      </MessageResponse>
                      {message.role === "assistant" && isLastMessage && (
                        <MessageActions>
                          <MessageAction
                            size="sm"
                            onClick={() => regenerate()}
                            label="Retry"
                            className="p-1"
                          >
                            <IconRefresh className="size-3" />
                          </MessageAction>
                          <MessageAction
                            size="sm"
                            onClick={() =>
                              navigator.clipboard.writeText(part.text)
                            }
                            className="p-1"
                            label="Copy"
                          >
                            <IconCopy className="size-3" />
                          </MessageAction>
                        </MessageActions>
                      )}
                    </MessageContent>
                  </Message>
                </Fragment>
              ))}
              {planParts.length > 0 && (
                <TaskSummary parts={planParts} messageId={message.id} />
              )}
              {scanResults.map((result, i) => (
                <ScanResultsCard
                  key={`${message.id}-scan-${i}`}
                  result={result}
                />
              ))}
              {otherGroups.map((group, i) =>
                group.parts.length === 1 ? (
                  <Fragment key={`${message.id}-tool-${i}`}>
                    {group.parts[0]?.type === "dynamic-tool"
                      ? renderDynamicToolPart(
                          group.parts[0] as DynamicToolUIPart,
                          message.id
                        )
                      : renderToolPart(
                          group.parts[0] as ToolUIPart,
                          message.id
                        )}
                  </Fragment>
                ) : (
                  <GroupedToolRenderer
                    key={`${message.id}-group-${i}`}
                    group={group}
                    messageId={message.id}
                  />
                )
              )}
            </Fragment>
          )
        })}
        <StreamingIndicator status={status} messages={messages} />
        {status === "error" && Boolean(error) && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 text-fire-red">
              <IconAlertTriangle className="mt-1 size-5" />{" "}
              <p>{error?.message}</p>
            </div>
            <MessageActions>
              <MessageAction
                size="sm"
                onClick={() => regenerate()}
                label="Retry"
                className="p-1"
              >
                <IconRefresh className="size-3" />
              </MessageAction>
            </MessageActions>
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton
        className="!translate-x-[-50%] !translate-y-0 !shadow-none hover:!translate-x-[-50%] hover:!translate-y-0 bottom-42 rounded-none p-1"
        variant="orange"
      />
    </Conversation>
  )
}
