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
import { IconCopy, IconRefresh } from "@tabler/icons-react"
import type { UIMessage } from "ai"
import { Fragment } from "react/jsx-runtime"

interface ConversationPanelProps {
  messages: UIMessage[]
  isLoading: boolean
  regenerate: () => void
}

export default function ConversationPanel({
  messages,
  regenerate,
}: ConversationPanelProps) {
  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message, messageIndex) => (
          <Fragment key={message.id}>
            {message.parts.map((part) => {
              switch (part.type) {
                case "text": {
                  const isLastMessage = messageIndex === messages.length - 1
                  return (
                    <Fragment key={message.id}>
                      <Message from={message.role}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                      </Message>
                      {message.role === "assistant" && isLastMessage && (
                        <MessageActions>
                          <MessageAction
                            onClick={() => regenerate()}
                            label="Retry"
                          >
                            <IconRefresh className="size-3" />
                          </MessageAction>
                          <MessageAction
                            onClick={() =>
                              navigator.clipboard.writeText(part.text)
                            }
                            label="Copy"
                          >
                            <IconCopy className="size-3" />
                          </MessageAction>
                        </MessageActions>
                      )}
                    </Fragment>
                  )
                }
                default:
                  return null
              }
            })}
          </Fragment>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
