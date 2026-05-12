"use client"

import { cn } from "@roaster/ui/lib/utils"
import type { UIMessage } from "ai"
import type { ComponentProps } from "react"

export type MessageProps = ComponentProps<"div"> & {
  from?: UIMessage["role"]
}

export function Message({ from = "user", className, ...props }: MessageProps) {
  return (
    <div
      className={cn(
        "flex",
        from === "user" ? "justify-end" : "justify-start",
        className
      )}
      {...props}
    />
  )
}

export type MessageContentProps = ComponentProps<"div">

export function MessageContent({
  className,
  ...props
}: MessageContentProps) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />
}

export type MessageResponseProps = ComponentProps<"div"> & {
  children?: string
}

export function MessageResponse({
  className,
  children,
  ...props
}: MessageResponseProps) {
  return (
    <div
      className={cn(
        "max-w-[72%] px-3 py-2 border-[3px] border-[var(--black)] shadow-[var(--shadow-xs)]",
        className
      )}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        lineHeight: 1.6,
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
      }}
      {...props}
    >
      {children}
    </div>
  )
}