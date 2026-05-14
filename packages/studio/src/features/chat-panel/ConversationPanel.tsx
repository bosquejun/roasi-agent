/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
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
import { cn } from "@roaster/ui/lib/utils"
import { IconAlertTriangle, IconCopy, IconRefresh } from "@tabler/icons-react"
import type { ChatStatus, UIMessage } from "ai"
import { Fragment } from "react/jsx-runtime"
import { StreamingIndicator } from "./StreamingIndicator"
import { type AnyToolPart, TaskSummary } from "./TaskSummary"

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
      <ConversationContent className="mx-auto max-w-2xl pb-48">
        {messages.map((message, messageIndex) => {
          const isLastMessage = messageIndex === messages.length - 1
          const textParts = message.parts.filter((p) => p.type === "text") as {
            type: "text"
            text: string
          }[]
          const toolParts = message.parts.filter(
            (p) => p.type === "dynamic-tool" || p.type.startsWith("tool-")
          ) as AnyToolPart[]

          return (
            <Fragment key={`${message.id}-${messageIndex}`}>
              {import.meta.env.DEV && (
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
              {toolParts.length > 0 && (
                <TaskSummary parts={toolParts} messageId={message.id} />
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
