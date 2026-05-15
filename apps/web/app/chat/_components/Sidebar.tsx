"use client"

import {
  RoasiHead,
  type RoasiHeadHandle,
} from "@roaster/sprite-animations/components/roasi/RoasiHead"
import { buttonVariants } from "@roaster/ui/components/button"
import { cn } from "@roaster/ui/lib/utils"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import Link from "next/link"
import { useRef, useState } from "react"

interface ChatHistory {
  id: string
  title: string
  updatedAt: string
}

interface SidebarProps {
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  activeChatId?: string
}

export function Sidebar({
  onNewChat,
  onSelectChat,
  onDeleteChat,
  activeChatId,
}: SidebarProps) {
  const headRef = useRef<RoasiHeadHandle>(null)
  const [chats] = useState<ChatHistory[]>([
    { id: "1", title: "First chat", updatedAt: "2024-01-15" },
    { id: "2", title: "Second chat", updatedAt: "2024-01-14" },
    { id: "3", title: "Third chat", updatedAt: "2024-01-13" },
  ])

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-[var(--black)] border-r-[3px] bg-[var(--bg-card)]",
        "w-56 min-w-56"
      )}
    >
      <Link
        href="/"
        onMouseEnter={() => headRef.current?.play()}
        className="flex w-full shrink-0 cursor-pointer items-center gap-1 border-[var(--black)] border-b-[3px] bg-transparent px-2"
        style={{ height: 56, minHeight: 56 }}
      >
        <RoasiHead ref={headRef} className="shrink-0" size={48} />
        <img
          src="/roasi-brand.svg"
          alt="Roasi"
          className="-ml-4 h-10 w-auto shrink-0"
        />
      </Link>

      <div className="flex flex-col gap-2 p-3">
        <button
          type="button"
          onClick={onNewChat}
          className={cn(
            buttonVariants({ variant: "accent", size: "sm" }),
            "flex w-full items-center justify-center gap-2"
          )}
        >
          <IconPlus size={14} />
          <span>NEW CHAT</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-2 pb-3">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              "group relative flex w-full cursor-pointer items-center gap-2 border-[3px] border-transparent px-2 py-2",
              activeChatId === chat.id &&
                "border-[var(--black)] bg-[var(--smoke)]"
            )}
            onClick={() => onSelectChat(chat.id)}
          >
            <span
              className={cn(
                "flex-1 truncate text-left",
                activeChatId === chat.id
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)]"
              )}
              style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
            >
              {chat.title.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteChat(chat.id)
              }}
              className="hidden text-[var(--text-muted)] hover:text-[var(--fire-red)] group-hover:block"
            >
              <IconTrash size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
