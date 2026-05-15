# Dashboard Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3-pane dashboard shell (collapsible sidebar + AI chat + closable preview) in `@roaster/studio` using the Roaster design system.

**Architecture:** Flexbox shell (`AppShell`) owns all layout state and passes callbacks down. Sidebar and PreviewPanel have fixed widths that transition via `width: 200ms ease`; ChatPanel uses `flex: 1` to fill remaining space. No routing — active nav is local state for now.

**Tech Stack:** React 19, Vite 6, Tailwind v4 (`@tailwindcss/vite`), `@roaster/ui` (design tokens + components), `@tabler/icons-react` (icons), inline styles for layout-critical values.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Add `@roaster/ui`, `@tabler/icons-react` deps; add `tailwindcss`, `@tailwindcss/vite` devDeps |
| `vite.config.ts` | Modify | Add `@tailwindcss/vite` plugin |
| `src/index.css` | Replace | Import `@roaster/ui/globals.css`, Google Fonts, add `@source` for studio files |
| `src/App.tsx` | Replace | Mount `<AppShell />` |
| `src/components/layout/AppShell.tsx` | Create | Flex row shell; owns `sidebarExpanded`, `previewOpen`, `previewMode`, `activeNav` state |
| `src/components/layout/Sidebar.tsx` | Create | Left nav pane, collapsible |
| `src/components/layout/ChatPanel.tsx` | Create | Center pane — header + message thread + input |
| `src/components/chat/MessageThread.tsx` | Create | Scrollable message list |
| `src/components/chat/MessageBubble.tsx` | Create | Single message bubble (user or AI) |
| `src/components/chat/ChatInput.tsx` | Create | Textarea + send button |
| `src/components/layout/PreviewPanel.tsx` | Create | Right pane — header + content area |
| `src/components/preview/LiveViewer.tsx` | Create | iframe wrapper |
| `src/components/preview/ReportViewer.tsx` | Create | Score breakdown using `ScoreBadge` + `ScoreBreakdown` |

---

## Task 1: Install dependencies and configure Tailwind

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Replace: `src/index.css`

- [ ] **Step 1: Add dependencies to package.json**

Open `packages/studio/package.json` and update it to:

```json
{
  "name": "@roaster/studio",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@roaster/ui": "workspace:*",
    "@tabler/icons-react": "^3.44.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@roaster/eslint-config": "workspace:*",
    "@roaster/typescript-config": "workspace:*",
    "@tailwindcss/vite": "^4.1.18",
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3",
    "vite": "^6.3.5"
  }
}
```

- [ ] **Step 2: Install packages**

Run from monorepo root:
```bash
pnpm install
```
Expected: lockfile updates, no errors.

- [ ] **Step 3: Configure Tailwind in vite.config.ts**

Replace `packages/studio/vite.config.ts` with:

```ts
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 4: Replace src/index.css**

Replace `packages/studio/src/index.css` with:

```css
@import "@roaster/ui/globals.css";
@source "../src/**/*.{ts,tsx}";

@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:wght@400;700&display=swap");

body {
  margin: 0;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-mono);
}
```

- [ ] **Step 5: Verify dev server starts**

```bash
cd packages/studio && pnpm dev
```
Expected: Vite dev server starts on `http://localhost:5173` with no errors in terminal.

- [ ] **Step 6: Commit**

```bash
git add packages/studio/package.json packages/studio/vite.config.ts packages/studio/src/index.css pnpm-lock.yaml
git commit -m "chore(studio): add tailwind, @roaster/ui, and tabler icons"
```

---

## Task 2: AppShell — flex row shell with state

**Files:**
- Create: `src/components/layout/AppShell.tsx`

- [ ] **Step 1: Create AppShell.tsx**

Create `packages/studio/src/components/layout/AppShell.tsx`:

```tsx
import { useState } from "react"
import { ChatPanel } from "./ChatPanel"
import { PreviewPanel } from "./PreviewPanel"
import { Sidebar } from "./Sidebar"

export type NavItem = "projects" | "metrics" | "settings"
export type PreviewMode = "live" | "report"

export function AppShell() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>("live")
  const [activeNav, setActiveNav] = useState<NavItem>("projects")

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg-base)",
      }}
    >
      <Sidebar
        expanded={sidebarExpanded}
        activeNav={activeNav}
        onToggle={() => setSidebarExpanded((v) => !v)}
        onNavChange={setActiveNav}
      />
      <ChatPanel
        projectName="Roasi"
        previewOpen={previewOpen}
        onTogglePreview={() => setPreviewOpen((v) => !v)}
      />
      <PreviewPanel
        open={previewOpen}
        mode={previewMode}
        onModeChange={setPreviewMode}
        onClose={() => setPreviewOpen(false)}
        projectUrl="https://Roasi"
      />
    </div>
  )
}
```

- [ ] **Step 2: Update App.tsx to mount AppShell**

Replace `packages/studio/src/App.tsx` with:

```tsx
import { AppShell } from "./components/layout/AppShell"

export default function App() {
  return <AppShell />
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/studio/src/components/layout/AppShell.tsx packages/studio/src/App.tsx
git commit -m "feat(studio): add AppShell layout shell with state"
```

---

## Task 3: Sidebar

**Files:**
- Create: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

Create `packages/studio/src/components/layout/Sidebar.tsx`:

```tsx
import { IconFolders, IconMenu2, IconChevronLeft, IconChartBar, IconSettings } from "@tabler/icons-react"
import type { NavItem } from "./AppShell"

interface SidebarProps {
  expanded: boolean
  activeNav: NavItem
  onToggle: () => void
  onNavChange: (nav: NavItem) => void
}

const NAV_ITEMS: { id: NavItem; icon: React.ReactNode; label: string }[] = [
  { id: "projects", icon: <IconFolders size={20} />, label: "PROJECTS" },
  { id: "metrics", icon: <IconChartBar size={20} />, label: "METRICS" },
  { id: "settings", icon: <IconSettings size={20} />, label: "SETTINGS" },
]

export function Sidebar({ expanded, activeNav, onToggle, onNavChange }: SidebarProps) {
  const width = expanded ? 220 : 56

  return (
    <div
      style={{
        width,
        minWidth: width,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-card)",
        borderRight: "3px solid var(--black)",
        overflow: "hidden",
        transition: "width 200ms ease, min-width 200ms ease",
        flexShrink: 0,
      }}
    >
      {/* Toggle header */}
      <button
        onClick={onToggle}
        style={{
          height: 56,
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "space-between" : "center",
          padding: expanded ? "0 16px" : "0",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          borderBottom: "3px solid var(--black)",
          background: "none",
          cursor: "pointer",
          color: "var(--text-primary)",
          flexShrink: 0,
          width: "100%",
        }}
      >
        {expanded ? (
          <>
            <img
              src="/roaster-logo.png"
              alt="Roaster"
              style={{ height: 32, imageRendering: "pixelated" }}
            />
            <IconChevronLeft size={18} />
          </>
        ) : (
          <IconMenu2 size={20} />
        )}
      </button>

      {/* Nav items */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 0" }}>
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const isActive = activeNav === id
          return (
            <button
              key={id}
              onClick={() => onNavChange(id)}
              style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: expanded ? "0 16px" : "0",
                justifyContent: expanded ? "flex-start" : "center",
                background: isActive ? "var(--fire-red)" : "transparent",
                color: isActive ? "#fff" : "var(--text-muted)",
                border: "none",
                cursor: "pointer",
                transition: "background 150ms, box-shadow 150ms, transform 150ms",
                boxShadow: "none",
                fontFamily: "var(--font-pixel)",
                fontSize: 8,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.boxShadow = "var(--shadow-xs)"
                  e.currentTarget.style.transform = "translate(-1px, -1px)"
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.transform = "none"
              }}
            >
              {icon}
              {expanded && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom avatar */}
      <div
        style={{
          padding: expanded ? "12px 16px" : "12px 0",
          display: "flex",
          justifyContent: expanded ? "flex-start" : "center",
          borderTop: "3px solid var(--black)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "var(--fire-red)",
            border: "3px solid var(--black)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-pixel)",
            fontSize: 10,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          R
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:5173`. You should see a 56px-wide sidebar on the left with three icon buttons and a hamburger toggle at the top. Clicking the hamburger expands it to 220px with labels visible.

- [ ] **Step 3: Commit**

```bash
git add packages/studio/src/components/layout/Sidebar.tsx
git commit -m "feat(studio): add collapsible Sidebar component"
```

---

## Task 4: ChatInput

**Files:**
- Create: `src/components/chat/ChatInput.tsx`

- [ ] **Step 1: Create ChatInput.tsx**

Create `packages/studio/src/components/chat/ChatInput.tsx`:

```tsx
import { useState, useRef } from "react"

interface ChatInputProps {
  onSend: (message: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: 12,
        borderTop: "3px solid var(--black)",
        background: "var(--bg-card)",
        alignItems: "flex-end",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your metrics..."
        rows={1}
        style={{
          flex: 1,
          resize: "none",
          border: "3px solid var(--black)",
          padding: "8px 10px",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          background: "var(--bg-base)",
          color: "var(--text-primary)",
          outline: "none",
          lineHeight: 1.5,
          overflow: "hidden",
        }}
      />
      <button
        onClick={handleSend}
        style={{
          padding: "10px 14px",
          background: "var(--acid-lime)",
          color: "var(--black)",
          border: "3px solid var(--black)",
          boxShadow: "var(--shadow-sm)",
          fontFamily: "var(--font-pixel)",
          fontSize: 8,
          cursor: "pointer",
          transition: "box-shadow 80ms, transform 80ms",
          flexShrink: 0,
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow = "none"
          e.currentTarget.style.transform = "translate(2px, 2px)"
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-sm)"
          e.currentTarget.style.transform = "none"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-sm)"
          e.currentTarget.style.transform = "none"
        }}
      >
        SEND
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/studio/src/components/chat/ChatInput.tsx
git commit -m "feat(studio): add ChatInput component"
```

---

## Task 5: MessageBubble and MessageThread

**Files:**
- Create: `src/components/chat/MessageBubble.tsx`
- Create: `src/components/chat/MessageThread.tsx`

- [ ] **Step 1: Create MessageBubble.tsx**

Create `packages/studio/src/components/chat/MessageBubble.tsx`:

```tsx
export type MessageRole = "user" | "ai"

export interface Message {
  id: string
  role: MessageRole
  content: string
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: "72%",
          padding: "10px 14px",
          background: isUser ? "var(--fire-red)" : "var(--bg-card)",
          color: isUser ? "#fff" : "var(--text-primary)",
          border: "3px solid var(--black)",
          boxShadow: "var(--shadow-xs)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create MessageThread.tsx**

Create `packages/studio/src/components/chat/MessageThread.tsx`:

```tsx
import { useEffect, useRef } from "react"
import { MessageBubble, type Message } from "./MessageBubble"

interface MessageThreadProps {
  messages: Message[]
}

export function MessageThread({ messages }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.length === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 2,
          }}
        >
          ASK ME ANYTHING ABOUT
          <br />
          YOUR METRICS
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/studio/src/components/chat/MessageBubble.tsx packages/studio/src/components/chat/MessageThread.tsx
git commit -m "feat(studio): add MessageBubble and MessageThread components"
```

---

## Task 6: ChatPanel

**Files:**
- Create: `src/components/layout/ChatPanel.tsx`

- [ ] **Step 1: Create ChatPanel.tsx**

Create `packages/studio/src/components/layout/ChatPanel.tsx`:

```tsx
import { useState } from "react"
import { ChatInput } from "../chat/ChatInput"
import { MessageThread } from "../chat/MessageThread"
import type { Message } from "../chat/MessageBubble"

interface ChatPanelProps {
  projectName: string
  previewOpen: boolean
  onTogglePreview: () => void
}

export function ChatPanel({ projectName, previewOpen, onTogglePreview }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])

  function handleSend(content: string) {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content }
    const aiMsg: Message = {
      id: crypto.randomUUID(),
      role: "ai",
      content: "Analyzing your metrics... (AI response goes here)",
    }
    setMessages((prev) => [...prev, userMsg, aiMsg])
  }

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "var(--bg-card)",
          borderBottom: "3px solid var(--black)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            letterSpacing: "0.06em",
            color: "var(--text-primary)",
          }}
        >
          {projectName.toUpperCase()}
        </span>
        <button
          onClick={onTogglePreview}
          style={{
            padding: "6px 12px",
            background: previewOpen ? "var(--electric-blue)" : "transparent",
            color: previewOpen ? "#fff" : "var(--text-muted)",
            border: "3px solid var(--black)",
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            cursor: "pointer",
            letterSpacing: "0.06em",
            transition: "background 150ms, color 150ms",
            boxShadow: previewOpen ? "var(--shadow-xs)" : "none",
          }}
        >
          PREVIEW
        </button>
      </div>

      <MessageThread messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

The chat panel should fill the remaining width. The header shows the project name and a PREVIEW toggle button. The message area shows an empty state. Typing in the input and pressing Enter/SEND adds a user bubble and a placeholder AI reply. The thread auto-scrolls.

- [ ] **Step 3: Commit**

```bash
git add packages/studio/src/components/layout/ChatPanel.tsx
git commit -m "feat(studio): add ChatPanel with message thread"
```

---

## Task 7: LiveViewer and ReportViewer

**Files:**
- Create: `src/components/preview/LiveViewer.tsx`
- Create: `src/components/preview/ReportViewer.tsx`

- [ ] **Step 1: Create LiveViewer.tsx**

Create `packages/studio/src/components/preview/LiveViewer.tsx`:

```tsx
interface LiveViewerProps {
  url: string
}

export function LiveViewer({ url }: LiveViewerProps) {
  return (
    <iframe
      src={url}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
      }}
      title="Live preview"
    />
  )
}
```

- [ ] **Step 2: Create ReportViewer.tsx**

Create `packages/studio/src/components/preview/ReportViewer.tsx`:

```tsx
import { ScoreBadge } from "@roaster/ui/components/badge"
import { ScoreBreakdown } from "@roaster/ui/components/score-bar"

export function ReportViewer() {
  // Placeholder scores — will be replaced by real data
  const overall = 42
  const scores = { design: 38, copy: 55, ux: 40, performance: 30, mobile: 45 }

  return (
    <div
      style={{
        overflowY: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          Overall Score
        </div>
        <ScoreBadge score={overall} />
      </div>
      <ScoreBreakdown
        design={scores.design}
        copy={scores.copy}
        ux={scores.ux}
        performance={scores.performance}
        mobile={scores.mobile}
      />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/studio/src/components/preview/LiveViewer.tsx packages/studio/src/components/preview/ReportViewer.tsx
git commit -m "feat(studio): add LiveViewer and ReportViewer for preview panel"
```

---

## Task 8: PreviewPanel

**Files:**
- Create: `src/components/layout/PreviewPanel.tsx`

- [ ] **Step 1: Create PreviewPanel.tsx**

Create `packages/studio/src/components/layout/PreviewPanel.tsx`:

```tsx
import { IconX } from "@tabler/icons-react"
import { LiveViewer } from "../preview/LiveViewer"
import { ReportViewer } from "../preview/ReportViewer"
import type { PreviewMode } from "./AppShell"

interface PreviewPanelProps {
  open: boolean
  mode: PreviewMode
  onModeChange: (mode: PreviewMode) => void
  onClose: () => void
  projectUrl: string
}

export function PreviewPanel({ open, mode, onModeChange, onClose, projectUrl }: PreviewPanelProps) {
  const width = open ? 420 : 0

  return (
    <div
      style={{
        width,
        minWidth: width,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-card)",
        borderLeft: open ? "3px solid var(--black)" : "none",
        overflow: "hidden",
        transition: "width 200ms ease, min-width 200ms ease",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          borderBottom: "3px solid var(--black)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            letterSpacing: "0.06em",
            color: "var(--text-primary)",
            marginRight: "auto",
          }}
        >
          PREVIEW
        </span>

        {/* Mode switcher */}
        {(["live", "report"] as PreviewMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            style={{
              padding: "5px 10px",
              background: mode === m ? "var(--black)" : "transparent",
              color: mode === m ? "#fff" : "var(--text-muted)",
              border: "3px solid var(--black)",
              fontFamily: "var(--font-pixel)",
              fontSize: 7,
              letterSpacing: "0.06em",
              cursor: "pointer",
              transition: "background 150ms, color 150ms",
            }}
          >
            {m.toUpperCase()}
          </button>
        ))}

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "3px solid var(--black)",
            cursor: "pointer",
            color: "var(--text-primary)",
            marginLeft: 4,
          }}
        >
          <IconX size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {mode === "live" ? (
          <LiveViewer url={projectUrl} />
        ) : (
          <ReportViewer />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify full layout in browser**

Open `http://localhost:5173`. Expected behavior:
- 56px sidebar on the left with hamburger, 3 nav icons, avatar
- Clicking hamburger expands sidebar to 220px with labels + logo; clicking again collapses it
- Chat panel fills remaining width with header, empty state, and input bar
- Clicking PREVIEW in chat header opens 420px preview panel from the right; chat shrinks to fill remaining space
- In the preview panel, toggling LIVE / REPORT switches between iframe and score breakdown
- Clicking × closes the preview panel

- [ ] **Step 3: Commit**

```bash
git add packages/studio/src/components/layout/PreviewPanel.tsx
git commit -m "feat(studio): add PreviewPanel with live/report toggle"
```

---

## Task 9: Final wiring check and polish

- [ ] **Step 1: Typecheck**

```bash
cd packages/studio && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 2: Lint**

```bash
cd packages/studio && pnpm lint
```
Expected: no errors or warnings.

- [ ] **Step 3: Fix any issues found**

Resolve all TypeScript and lint errors before moving on.

- [ ] **Step 4: Final visual pass**

Check these in the browser:
- [ ] Sidebar collapse/expand animates smoothly at 200ms
- [ ] Preview panel open/close animates smoothly at 200ms
- [ ] Chat input grows up to 4 lines then stops
- [ ] Sending a message auto-scrolls the thread to the bottom
- [ ] PREVIEW button turns electric-blue when panel is open
- [ ] Active nav item turns fire-red
- [ ] Score bars in Report mode render with tier colors
- [ ] Fonts: pixel font on labels/buttons, mono on message body

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(studio): complete 3-pane dashboard layout"
```
