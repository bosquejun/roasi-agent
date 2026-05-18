# AI-Generated Chat Titles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a 3–6 word AI title for each new chat and display it in the sidebar history list and chat header.

**Architecture:** Title is generated via `generateText()` inside `createUIMessageStream`'s `execute` before the agent runs, written to the stream as `messageMetadata`, and persisted as a `chat-meta` JSONL entry. The sidebar loads the real chat list from a new `GET /api/chats` route. The header receives the title via message metadata (new chats) or a server-read prop (existing chats).

**Tech Stack:** Vercel AI SDK (`generateText`, `UIMessageStreamWriter`), Next.js App Router server components, Node.js `fs/promises`, React `useEffect`/`useState`

---

### Task 1: Add `writeChatTitle` and `readChatTitle` to memory-tool

**Files:**
- Modify: `packages/ai/src/tools/memory/memory-tool.ts`
- Modify: `packages/ai/src/tools/memory/index.ts`

- [ ] **Step 1: Add `writeChatTitle` function**

Add after the `appendConversation` function in `packages/ai/src/tools/memory/memory-tool.ts`:

```ts
export async function writeChatTitle(chatId: string, title: string): Promise<void> {
  await ensureDir()
  await mkdir(CONVERSATIONS_DIR, { recursive: true })
  const filePath = getConversationsFile(chatId)
  const entry = JSON.stringify({ type: "chat-meta", title, createdAt: new Date().toISOString() })
  await appendFile(filePath, `${entry}\n`, "utf-8")
}
```

- [ ] **Step 2: Add `readChatTitle` function**

Add immediately after `writeChatTitle`:

```ts
export async function readChatTitle(chatId: string): Promise<string | null> {
  const filePath = getConversationsFile(chatId)
  try {
    const raw = await readFile(filePath, "utf-8")
    for (const line of raw.split("\n").filter(Boolean)) {
      try {
        const entry = JSON.parse(line)
        if (entry.type === "chat-meta" && entry.title) return entry.title as string
      } catch {
        // skip malformed lines
      }
    }
    return null
  } catch {
    return null
  }
}
```

- [ ] **Step 3: Export both functions from the package index**

In `packages/ai/src/tools/memory/index.ts`, add the two new exports:

```ts
export {
  appendConversation,
  memoryTool,
  readChatTitle,
  readConversations,
  readCoreMemory,
  writeChatTitle,
} from "./memory-tool"
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph
pnpm --filter @roaster/ai build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add packages/ai/src/tools/memory/memory-tool.ts packages/ai/src/tools/memory/index.ts
git commit -m "feat: add writeChatTitle and readChatTitle to memory-tool"
```

---

### Task 2: Generate title in `createChatStream` and write to stream

**Files:**
- Modify: `apps/web/app/api/chat/service.ts`

- [ ] **Step 1: Update imports in service.ts**

Replace the current `ai` import line with one that also includes `generateText`:

```ts
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  generateText,
  isLoopFinished,
  ToolLoopAgent,
} from "ai"
```

Add a new import for `writeChatTitle` after the existing memory import:

```ts
import { memoryTool, readCoreMemory, writeChatTitle } from "@roaster/ai/tools/memory"
```

- [ ] **Step 2: Update `createChatStream` signature**

Change the function signature to accept `chatId` and `isNewChat`:

```ts
export async function createChatStream(
  messages: UIMessage[],
  skills: SkillMetadata[],
  instructions: string,
  chatId: string,
  isNewChat: boolean,
  onFinish?: (parts: UIMessage["parts"]) => Promise<void>
)
```

- [ ] **Step 3: Add title generation block inside `execute`, before the agent**

Inside the `execute: async ({ writer }) => {` block, add this before `const agent = new ToolLoopAgent`:

```ts
if (isNewChat) {
  const firstUser = messages.find((m) => m.role === "user")
  const firstUserText = (() => {
    if (!firstUser) return ""
    for (const part of firstUser.parts) {
      if (part.type === "text") return (part as { type: "text"; text: string }).text
    }
    return ""
  })()

  let title = firstUserText.slice(0, 40)
  try {
    const { text } = await generateText({
      model,
      prompt: `Generate a short 3-6 word title for a chat that starts with this message: "${firstUserText.slice(0, 200)}". Reply with only the title, no quotes or punctuation.`,
    })
    if (text.trim()) title = text.trim()
  } catch {
    // fallback to truncated first message
  }

  writer.write({ type: "start", messageMetadata: { title } })
  await writeChatTitle(chatId, title)
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph
pnpm --filter @roaster/web build 2>&1 | tail -30
```

Expected: no TypeScript errors in service.ts (there will be a call-site error in route.ts — that's fixed next).

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/api/chat/service.ts
git commit -m "feat: generate AI title before agent run and write to UIMessage stream"
```

---

### Task 3: Pass `chatId` and `isNewChat` from the chat route

**Files:**
- Modify: `apps/web/app/api/chat/route.ts`

- [ ] **Step 1: Update the `createChatStream` call to pass new params**

The `history` variable already tells us if this is a new chat (`history.length === 0`). Update the call:

```ts
const stream = await createChatStream(
  fullMessages,
  skills,
  instructions,
  id,
  history.length === 0,
  async (parts) => {
    await appendConversation({
      role: "assistant",
      parts,
      timestamp: new Date().toISOString(),
      chatId: id,
    })
  }
)
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph
pnpm --filter @roaster/web build 2>&1 | tail -30
```

Expected: no TypeScript errors.

- [ ] **Step 3: Smoke-test title generation manually**

Start the dev server:
```bash
pnpm --filter @roaster/web dev
```

Open `http://localhost:3000/chat`, send a first message. Check the JSONL file for the new chat:
```bash
ls -t apps/web/.memory/conversations/ | head -1 | xargs -I{} cat apps/web/.memory/conversations/{}
```

Expected: the last line of the file contains `{"type":"chat-meta","title":"<short title>","createdAt":"..."}`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/api/chat/route.ts
git commit -m "feat: pass chatId and isNewChat to createChatStream"
```

---

### Task 4: Create `GET /api/chats` route

**Files:**
- Create: `apps/web/app/api/chats/route.ts`

- [ ] **Step 1: Create the route file**

Create `apps/web/app/api/chats/route.ts`:

```ts
import { readChatTitle } from "@roaster/ai/tools/memory"
import { readdir, stat } from "fs/promises"
import { NextResponse } from "next/server"
import path from "path"

const CONVERSATIONS_DIR = path.join(process.cwd(), ".memory", "conversations")

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const files = await readdir(CONVERSATIONS_DIR)
    const jsonlFiles = files.filter((f) => f.endsWith(".jsonl"))

    const chats = await Promise.all(
      jsonlFiles.map(async (filename) => {
        const chatId = filename.replace(".jsonl", "")
        const filePath = path.join(CONVERSATIONS_DIR, filename)
        const [title, stats] = await Promise.all([
          readChatTitle(chatId),
          stat(filePath),
        ])
        return {
          id: chatId,
          title: title ?? chatId,
          updatedAt: stats.mtime.toISOString(),
        }
      })
    )

    chats.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return NextResponse.json(chats)
  } catch {
    return NextResponse.json([])
  }
}
```

- [ ] **Step 2: Verify the route works**

With the dev server running, open a terminal and run:
```bash
curl http://localhost:3000/api/chats | jq .
```

Expected: JSON array of `{ id, title, updatedAt }` objects for each existing conversation file. If no conversations exist yet, returns `[]`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/api/chats/route.ts
git commit -m "feat: add GET /api/chats route for chat history list"
```

---

### Task 5: Wire up Sidebar to fetch real chat list

**Files:**
- Modify: `apps/web/app/chat/_components/Sidebar.tsx`
- Modify: `apps/web/app/chat/_components/StudioClient.tsx`

- [ ] **Step 1: Update Sidebar to accept `currentChatId` and fetch real data**

Replace the entire `Sidebar.tsx` with:

```tsx
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
"use client"

import {
  RoasiHead,
  type RoasiHeadHandle,
} from "@roaster/sprite-animations/components/roasi/RoasiHead"
import { Button } from "@roaster/ui/components/button"
import { cn } from "@roaster/ui/lib/utils"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface ChatHistory {
  id: string
  title: string
  updatedAt: string
}

interface SidebarProps {
  currentChatId?: string
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
}

export function Sidebar({
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: SidebarProps) {
  const headRef = useRef<RoasiHeadHandle>(null)
  const [chats, setChats] = useState<ChatHistory[]>([])

  useEffect(() => {
    fetch("/api/chats")
      .then((r) => r.json())
      .then(setChats)
      .catch(() => setChats([]))
  }, [currentChatId])

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
          src="/roasi-brand.png"
          alt="Roasi"
          className="-ml-4 h-10 w-auto shrink-0"
        />
      </Link>

      <div className="flex flex-col gap-2 p-3">
        <Button onClick={onNewChat} size="sm">
          <IconPlus size={14} />
          <span>NEW CHAT</span>
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-2 pb-3">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="group relative flex w-full cursor-pointer items-center gap-2 border-[3px] border-transparent px-2 py-2"
            onClick={() => onSelectChat(chat.id)}
          >
            <span
              className="flex-1 truncate text-left text-[var(--text-muted)]"
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
```

- [ ] **Step 2: Pass `currentChatId` to Sidebar in StudioClient**

In `apps/web/app/chat/_components/StudioClient.tsx`, update the `<Sidebar>` usage:

```tsx
<Sidebar
  currentChatId={chatId}
  onNewChat={handleNewChat}
  onSelectChat={handleSelectChat}
  onDeleteChat={handleDeleteChat}
/>
```

- [ ] **Step 3: Verify sidebar loads real chats**

With dev server running, navigate to `http://localhost:3000/chat`. The sidebar should show real conversation entries from `.memory/conversations/`. Create a new chat to verify the list refreshes when you navigate to the new chat URL.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/chat/_components/Sidebar.tsx apps/web/app/chat/_components/StudioClient.tsx
git commit -m "feat: load real chat history in sidebar from /api/chats"
```

---

### Task 6: Display title in chat header

**Files:**
- Modify: `apps/web/app/chat/[chatId]/page.tsx`
- Modify: `apps/web/app/chat/_components/StudioClient.tsx`
- Modify: `apps/web/app/chat/_components/chat-panel/ChatPanel.tsx`
- Modify: `apps/web/app/chat/_components/chat-panel/ChatHeader.tsx`

- [ ] **Step 1: Read title in the server page and pass to StudioClient**

Update `apps/web/app/chat/[chatId]/page.tsx`:

```ts
import { readChatTitle, readConversations } from "@roaster/ai/tools/memory"
import { StudioClient } from "../_components/StudioClient"

interface PageProps {
  params: Promise<{ chatId: string }>
}

export default async function Page({ params }: PageProps) {
  const { chatId } = await params

  const [messages, title] = await Promise.all([
    readConversations(chatId),
    readChatTitle(chatId),
  ])

  return <StudioClient chatId={chatId} messages={messages} title={title ?? undefined} />
}

export function generateStaticParams() {
  return []
}
```

- [ ] **Step 2: Thread `title` prop through StudioClient to ChatPanel**

In `apps/web/app/chat/_components/StudioClient.tsx`, add `title?: string` to `StudioClientProps` and pass it to `ChatPanel`:

```ts
interface StudioClientProps {
  chatId?: string
  messages?: UIMessage[]
  title?: string
}

export function StudioClient({ chatId, messages, title }: StudioClientProps) {
```

And update the `<ChatPanel>` usage:

```tsx
<ChatPanel
  chatId={chatId}
  title={title}
  previewOpen={previewOpen}
  onTogglePreview={() => setPreviewOpen(!previewOpen)}
  onTerminalUpdate={handleTerminalUpdate}
  empty={!chatId}
  messages={messages}
/>
```

- [ ] **Step 3: Derive title in ChatPanel and pass to ChatHeader**

In `apps/web/app/chat/_components/chat-panel/ChatPanel.tsx`:

Add `title?: string` to `ChatPanelProps`:

```ts
interface ChatPanelProps {
  chatId?: string
  title?: string
  previewOpen: boolean
  onTogglePreview: () => void
  onTerminalUpdate?: (output: string, streaming: boolean) => void
  empty?: boolean
  messages?: UIMessage[]
}
```

Update the function signature to destructure `title`:

```ts
export function ChatPanel({
  chatId,
  title: titleProp,
  previewOpen,
  onTogglePreview,
  onTerminalUpdate,
  messages: defaultMessages,
  empty = false,
}: ChatPanelProps) {
```

Add a module-level helper at the bottom of `ChatPanel.tsx` (above the existing `BashPart` / `BashOutput` interfaces):

```ts
function extractTitle(msgs: UIMessage[]): string | undefined {
  for (const m of msgs) {
    if (m.role !== "assistant") continue
    const meta = m.metadata as { title?: string } | undefined
    if (meta?.title) return meta.title
  }
  return undefined
}
```

After the `useChat` hook call inside `ChatPanel`, add:

```ts
const chatTitle = titleProp ?? extractTitle(messages)
```

Pass `chatTitle` to both `<ChatHeader>` usages (empty state and normal state):

```tsx
<ChatHeader
  title={chatTitle}
  previewOpen={previewOpen}
  onTogglePreview={onTogglePreview}
/>
```

- [ ] **Step 4: Display title in ChatHeader**

Replace `apps/web/app/chat/_components/chat-panel/ChatHeader.tsx` with:

```tsx
import { cn } from "@roaster/ui/lib/utils"

interface ChatHeaderProps {
  title?: string
  previewOpen: boolean
  onTogglePreview: () => void
}

export function ChatHeader({ title, previewOpen, onTogglePreview }: ChatHeaderProps) {
  return (
    <div
      className="flex shrink-0 items-center justify-between border-[var(--black)] border-b-[3px] bg-[var(--bg-card)] px-4"
      style={{ height: 56, minHeight: 56 }}
    >
      <span
        className="text-[var(--text-primary)] tracking-[0.04em]"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
      >
        {title ? title.toUpperCase() : "ROASTER STUDIO"}
      </span>
      <button
        onClick={onTogglePreview}
        type="button"
        aria-pressed={previewOpen}
        className={cn(
          "cursor-pointer border-[3px] border-[var(--black)] px-3 py-1.5 tracking-[0.04em] transition-all duration-150",
          previewOpen
            ? "bg-[var(--electric-blue)] text-[var(--white)] shadow-[var(--shadow-xs)]"
            : "bg-transparent text-[var(--text-muted)] shadow-none"
        )}
        style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
      >
        PREVIEW
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph
pnpm --filter @roaster/web build 2>&1 | tail -30
```

Expected: no errors.

- [ ] **Step 6: End-to-end smoke test**

With dev server running:

1. Navigate to `http://localhost:3000/chat`
2. Send a first message (e.g., "Build a landing page for my coffee shop")
3. Observe: the chat header should show the AI-generated title shortly after the response begins streaming
4. Navigate away, then back to the chat via the sidebar — the header should still show the title (loaded from JSONL via server component)
5. Open a new chat — sidebar should refresh and show the new entry with its generated title

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/chat/[chatId]/page.tsx apps/web/app/chat/_components/StudioClient.tsx apps/web/app/chat/_components/chat-panel/ChatPanel.tsx apps/web/app/chat/_components/chat-panel/ChatHeader.tsx
git commit -m "feat: display AI-generated title in chat header for new and existing chats"
```
