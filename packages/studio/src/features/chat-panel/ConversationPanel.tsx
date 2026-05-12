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
import { IconCopy, IconLoader, IconRefresh } from "@tabler/icons-react"
import type { ChatStatus, UIMessage } from "ai"
import { Fragment } from "react/jsx-runtime"

interface ConversationPanelProps {
  messages: UIMessage[]
  regenerate: () => void
  status: ChatStatus
}

export default function ConversationPanel({
  messages,
  regenerate,
  status,
}: ConversationPanelProps) {
  return (
    <Conversation>
      <ConversationContent className="mx-auto max-w-2xl pb-48">
        {messages.map((message, messageIndex) => (
          <Fragment key={message.id}>
            {message.parts.map((part) => {
              switch (part.type) {
                case "text": {
                  const isLastMessage = messageIndex === messages.length - 1
                  return (
                    <Fragment key={message.id}>
                      <Message from={message.role}>
                        <MessageContent className="group-[.is-user]:!bg-transparent group-[.is-user]:py-1">
                          <MessageResponse
                            key={message.id}
                            className={cn("font-medium text-md", {
                              "!p-2 flex flex-col rounded-none border-[3px] border-black bg-bg-card font-semibold text-md shadow-neo-sm":
                                message.role === "user",
                              "": message.role !== "user",
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
                  )
                }
                default:
                  return null
              }
            })}
          </Fragment>
        ))}
        {status === "submitted" && <IconLoader className="animate-spin" />}
      </ConversationContent>
      <ConversationScrollButton
        className="!translate-x-[-50%] !translate-y-0 !shadow-none hover:!translate-x-[-50%] hover:!translate-y-0 bottom-42 rounded-none p-1"
        variant="orange"
      />
    </Conversation>
  )
}
