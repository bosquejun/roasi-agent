"use client"

import type { ComponentProps } from "react"
import { useStickToBottomContext } from "use-stick-to-bottom"
import { cn } from "@roaster/ui/lib/utils"
import { Button } from "@roaster/ui/components/button"
import { ArrowDownIcon } from "lucide-react"
import { useCallback } from "react"

export type ConversationProps = ComponentProps<"div">

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <div
    className={cn("relative flex-1 overflow-hidden flex flex-col", className)}
    role="log"
    {...props}
  />
)

export type ConversationContentProps = ComponentProps<"div">

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <div
    className={cn("flex flex-col gap-3 p-4 overflow-y-auto flex-1", className)}
    {...props}
  />
)

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export const ConversationEmptyState = ({
  className,
  title = "ASK ME ANYTHING ABOUT",
  description = "YOUR METRICS",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-1 p-8 text-center",
      className
    )}
    style={{ fontFamily: "var(--font-pixel)", fontSize: 8, lineHeight: 2.5 }}
    {...props}
  >
    {children ?? (
      <>
        <span className="text-[var(--text-muted)]">{title}</span>
        <br />
        <span className="text-[var(--text-muted)]">{description}</span>
      </>
    )}
  </div>
)

export type ConversationScrollButtonProps = ComponentProps<typeof Button>

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext()

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom()
  }, [scrollToBottom])

  if (isAtBottom) return null

  return (
<Button
        onClick={handleScrollToBottom}
        size="sm"
        type="button"
        variant="secondary"
        className={cn(
          "absolute bottom-4 left-[50%] -translate-x-1/2",
          className
        )}
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
  )
}