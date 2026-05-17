# Chat List Sidebar UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the `/chat` sidebar chat list with active state (inverted fill), date group labels (Today / Yesterday / Older), hover feedback, a New Chat separator, and an empty state — all aligned with the existing neo-brutal design system.

**Architecture:** All changes are confined to a single file: `apps/web/app/chat/_components/Sidebar.tsx`. A pure `groupChatsByDate` helper is added inline to bucket chats by date, and the flat `chats.map()` is replaced with a grouped render. Active/hover state is applied conditionally using the `currentChatId` prop that already exists.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS (CSS variable tokens), `@tabler/icons-react`, `cn()` from `@roaster/ui/lib/utils`

---

## File Map

| Action | Path | Notes |
|--------|------|-------|
| Modify | `apps/web/app/chat/_components/Sidebar.tsx` | Only file changed |

---

### Task 1: Add date-bucketing helper and `useMemo` import

**Files:**
- Modify: `apps/web/app/chat/_components/Sidebar.tsx`

- [ ] **Step 1: Add `useMemo` to the React import**

In `Sidebar.tsx` line 13, change:
```tsx
import { useEffect, useRef, useState } from "react"
```
to:
```tsx
import { useEffect, useMemo, useRef, useState } from "react"
```

- [ ] **Step 2: Add the `groupChatsByDate` helper above the component**

Insert this function directly above the `export function Sidebar` declaration (after the interface definitions):

```tsx
type ChatGroup = { label: string; chats: ChatHistory[] }

function groupChatsByDate(chats: ChatHistory[]): ChatGroup[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: ChatGroup[] = [
    { label: "TODAY", chats: [] },
    { label: "YESTERDAY", chats: [] },
    { label: "OLDER", chats: [] },
  ]

  for (const chat of chats) {
    const d = new Date(chat.updatedAt)
    d.setHours(0, 0, 0, 0)
    if (d.getTime() === today.getTime()) {
      groups[0].chats.push(chat)
    } else if (d.getTime() === yesterday.getTime()) {
      groups[1].chats.push(chat)
    } else {
      groups[2].chats.push(chat)
    }
  }

  return groups.filter((g) => g.chats.length > 0)
}
```

- [ ] **Step 3: Typecheck**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter web typecheck
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/chat/_components/Sidebar.tsx
git commit -m "feat(chat): add date-bucketing helper for chat list grouping"
```

---

### Task 2: Replace flat list with grouped render + active/hover state

**Files:**
- Modify: `apps/web/app/chat/_components/Sidebar.tsx`

- [ ] **Step 1: Add grouped memo inside the component**

Inside `Sidebar` function body, after the `chats` state declaration (after line 37), add:

```tsx
const grouped = useMemo(() => groupChatsByDate(chats), [chats])
```

- [ ] **Step 2: Replace the chat list render**

Replace the entire `<div className="flex flex-1 flex-col overflow-y-auto px-2 pb-3">` block (lines 90–115) with:

```tsx
<div className="flex flex-1 flex-col overflow-y-auto px-2 pb-3">
  {chats.length === 0 ? (
    <p
      className="mt-4 text-center text-[var(--text-muted)]"
      style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)" }}
    >
      NO CHATS YET
    </p>
  ) : (
    grouped.map((group) => (
      <div key={group.label}>
        <p
          className="px-2 pt-3 pb-1 text-[var(--text-muted)]"
          style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)" }}
        >
          {group.label}
        </p>
        {group.chats.map((chat) => {
          const isActive = chat.id === currentChatId
          return (
            <div
              key={chat.id}
              className={cn(
                "group relative flex w-full cursor-pointer items-center gap-2 border-[3px] px-2 py-2 transition-colors duration-150",
                isActive
                  ? "border-[var(--black)] bg-[var(--black)]"
                  : "border-transparent hover:bg-[var(--cream-100)]"
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <span
                className={cn(
                  "flex-1 truncate text-left",
                  isActive ? "text-[var(--white)]" : "text-[var(--text-muted)]"
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
                className={cn(
                  "hidden hover:text-[var(--fire-red)] group-hover:block",
                  isActive ? "text-[var(--white)]" : "text-[var(--text-muted)]"
                )}
              >
                <IconTrash size={12} />
              </button>
            </div>
          )
        })}
      </div>
    ))
  )}
</div>
```

- [ ] **Step 3: Typecheck**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter web typecheck
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/chat/_components/Sidebar.tsx
git commit -m "feat(chat): grouped chat list with active state and hover feedback"
```

---

### Task 3: Add separator between New Chat button and chat list

**Files:**
- Modify: `apps/web/app/chat/_components/Sidebar.tsx`

- [ ] **Step 1: Add bottom border to the New Chat button container**

Find the `<div className="flex flex-col gap-2 p-3">` wrapper around the New Chat button (line 83) and add `border-b-[3px] border-[var(--black)]`:

```tsx
<div className="flex flex-col gap-2 border-b-[3px] border-[var(--black)] p-3">
  <Button onClick={onNewChat} size="sm">
    <IconPlus size={14} />
    <span>NEW CHAT</span>
  </Button>
</div>
```

- [ ] **Step 2: Typecheck**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter web typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/chat/_components/Sidebar.tsx
git commit -m "feat(chat): add separator between new chat button and chat list"
```

---

### Task 4: Manual browser verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter web dev
```

- [ ] **Step 2: Verify active state**

Open `http://localhost:3000/chat`. Select a chat. Confirm:
- Active item has black background and white text
- Inactive items show muted text on white background
- Hovering an inactive item shows `--cream-100` background
- Delete icon appears on hover (active and inactive)

- [ ] **Step 3: Verify group labels**

Create chats on different days (or manually set `updatedAt` in the DB). Confirm:
- TODAY / YESTERDAY / OLDER labels appear correctly
- Groups with no chats are hidden
- If no chats exist at all, `NO CHATS YET` is shown

- [ ] **Step 4: Verify separator**

Confirm the 3px black border appears between the New Chat button area and the chat list.

- [ ] **Step 5: Commit if any tweaks were made during verification**

```bash
git add apps/web/app/chat/_components/Sidebar.tsx
git commit -m "fix(chat): post-verification tweaks to chat list UI"
```
