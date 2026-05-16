# Automated Preview Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically open the preview panel to the Live tab when a scan starts, and switch to the Report tab when analysis completes.

**Architecture:** `scan.ts` adds `reportPath` to `ScanResult`. A new `useEffect` in `ChatPanel` watches messages for `scanSite` and `analyzeScanReport` tool parts and fires callbacks. `StudioClient` handles those callbacks to drive `projectUrl`, `reportUrl`, and panel state.

**Tech Stack:** React (useEffect, useRef, useState), Vercel AI SDK UIMessage parts, Next.js App Router

---

## File Map

| File | Change |
|---|---|
| `packages/ai/src/skills/sitewarden/tools/scan.ts` | Add `reportPath` to `ScanResult` type and return value |
| `apps/web/app/chat/_components/chat-panel/ChatPanel.tsx` | Add `onScanStarted`/`onScanComplete` props + message-parsing `useEffect` |
| `apps/web/app/chat/_components/StudioClient.tsx` | Add state, handlers, wire to ChatPanel and PreviewPanel |

---

## Task 1: Add `reportPath` to `ScanResult`

**Files:**
- Modify: `packages/ai/src/skills/sitewarden/tools/scan.ts`

- [ ] **Step 1: Update `ScanResult` interface**

In `packages/ai/src/skills/sitewarden/tools/scan.ts`, change lines 80-83:

```ts
export interface ScanResult {
  pages: PageReport[]
  mode: Mode
  reportPath: string
}
```

- [ ] **Step 2: Return `reportPath` from `execute`**

Change line 189 in `scan.ts`:

```ts
return { pages, mode, reportPath: outputPath }
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph
pnpm --filter @roaster/ai typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ai/src/skills/sitewarden/tools/scan.ts
git commit -m "feat: include reportPath in ScanResult"
```

---

## Task 2: Add scan event callbacks to `ChatPanel`

**Files:**
- Modify: `apps/web/app/chat/_components/chat-panel/ChatPanel.tsx`

The new `useEffect` mirrors the existing terminal extraction pattern. It:
1. Scans all messages for a `scanSite` dynamic-tool part that has `input.url` — fires `onScanStarted` once per unique `toolCallId`.
2. Scans all messages for an `analyzeScanReport` dynamic-tool part with `state === "output-available"` — at that moment, also finds the `scanSite` output to read `reportPath` — fires `onScanComplete` once per unique `toolCallId`.

A `useRef<Set<string>>` tracks already-fired tool call IDs so callbacks are not repeated across re-renders.

- [ ] **Step 1: Add callbacks to `ChatPanelProps`**

In `ChatPanel.tsx`, update the `ChatPanelProps` interface:

```ts
interface ChatPanelProps {
  chatId?: string
  title?: string
  previewOpen: boolean
  onTogglePreview: () => void
  onTerminalUpdate?: (output: string, streaming: boolean) => void
  onScanStarted?: (url: string) => void
  onScanComplete?: (reportPath: string) => void
  onChatCreated?: () => void
  empty?: boolean
  messages?: UIMessage[]
}
```

- [ ] **Step 2: Destructure new props in `ChatPanel`**

Add `onScanStarted` and `onScanComplete` to the destructured props list in the `ChatPanel` function signature:

```ts
export function ChatPanel({
  chatId,
  title: titleProp,
  previewOpen,
  onTogglePreview,
  onTerminalUpdate,
  onScanStarted,
  onScanComplete,
  onChatCreated,
  messages: defaultMessages,
  empty = false,
}: ChatPanelProps) {
```

- [ ] **Step 3: Add fired-IDs ref**

After the existing `const bottomRef = useRef<HTMLDivElement>(null)` line, add:

```ts
const firedScanCallsRef = useRef<Set<string>>(new Set())
```

- [ ] **Step 4: Add scan-event `useEffect`**

Add this effect after the existing terminal `useEffect` (after line 109):

```ts
useEffect(() => {
  if (!onScanStarted && !onScanComplete) return

  let scanSiteOutput: ScanResult | undefined

  for (const msg of messages) {
    for (const rawPart of msg.parts) {
      if (rawPart.type !== "dynamic-tool") continue
      const part = rawPart as DynamicToolUIPart

      if (part.toolName === "scanSite" && part.input && !firedScanCallsRef.current.has(`start:${part.toolCallId}`)) {
        const input = part.input as { url: string }
        if (input.url) {
          firedScanCallsRef.current.add(`start:${part.toolCallId}`)
          onScanStarted?.(input.url)
        }
      }

      if (part.toolName === "scanSite" && part.state === "output-available" && part.output) {
        scanSiteOutput = part.output as ScanResult
      }

      if (
        part.toolName === "analyzeScanReport" &&
        part.state === "output-available" &&
        !firedScanCallsRef.current.has(`complete:${part.toolCallId}`)
      ) {
        if (scanSiteOutput?.reportPath) {
          firedScanCallsRef.current.add(`complete:${part.toolCallId}`)
          onScanComplete?.(scanSiteOutput.reportPath)
        }
      }
    }
  }
}, [messages, onScanStarted, onScanComplete])
```

- [ ] **Step 5: Export `ScanResult` from `@roaster/ai` and import in `ChatPanel`**

In `packages/ai/src/index.ts`, add:

```ts
export type { ScanResult } from "./skills/sitewarden/tools/scan"
```

Then at the top of `apps/web/app/chat/_components/chat-panel/ChatPanel.tsx`, add:

```ts
import type { ScanResult } from "@roaster/ai"
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph
pnpm --filter @roaster/web typecheck
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/chat/_components/chat-panel/ChatPanel.tsx packages/ai/src/index.ts
git commit -m "feat: add onScanStarted/onScanComplete callbacks to ChatPanel"
```

---

## Task 3: Wire state and handlers in `StudioClient`

**Files:**
- Modify: `apps/web/app/chat/_components/StudioClient.tsx`

- [ ] **Step 1: Add `projectUrl` and `reportUrl` state**

In `StudioClient.tsx`, after the existing `const [terminalStreaming, setTerminalStreaming] = useState(false)` line, add:

```ts
const [projectUrl, setProjectUrl] = useState("")
const [reportUrl, setReportUrl] = useState<string | undefined>()
```

- [ ] **Step 2: Add `handleScanStarted` and `handleScanComplete`**

After `handleTerminalUpdate`, add:

```ts
function handleScanStarted(url: string) {
  setProjectUrl(url)
  setPreviewOpen(true)
  setPreviewMode("live")
}

function handleScanComplete(reportPath: string) {
  setReportUrl(`/api/reports/${reportPath}/reports/lighthouse.html`)
  setPreviewMode("report")
}
```

- [ ] **Step 3: Pass callbacks to `ChatPanel`**

In the `<ChatPanel .../>` JSX, add the two new props:

```tsx
<ChatPanel
  chatId={chatId}
  title={title}
  previewOpen={previewOpen}
  onTogglePreview={() => setPreviewOpen(!previewOpen)}
  onTerminalUpdate={handleTerminalUpdate}
  onScanStarted={handleScanStarted}
  onScanComplete={handleScanComplete}
  onChatCreated={() => setSidebarRefreshKey((k) => k + 1)}
  empty={!chatId}
  messages={messages}
/>
```

- [ ] **Step 4: Pass `projectUrl` to `PreviewPanel`**

Change `projectUrl={""}` to:

```tsx
projectUrl={projectUrl}
```

- [ ] **Step 5: Remove the hardcoded `reportUrl={undefined}` line from `PreviewPanel`**

The `reportUrl` prop is already wired from the previous session. Ensure `PreviewPanel` receives:

```tsx
reportUrl={reportUrl}
```

(Replace `reportUrl={undefined}` with `reportUrl={reportUrl}`.)

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /home/junbosque/roaster-ph
pnpm --filter @roaster/web typecheck
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/chat/_components/StudioClient.tsx
git commit -m "feat: auto-open preview panel on scan events"
```

---

## Verification

After all tasks are complete, do a manual smoke test:

1. Run the dev server: `pnpm dev`
2. Open a new chat and submit a URL (e.g. `https://linear.app`)
3. Confirm: as soon as the AI calls `scanSite`, the preview panel opens and shows the Live tab with the site loaded in the iframe
4. Confirm: when the AI calls `analyzeScanReport` and it completes, the panel switches to the Report tab showing the Lighthouse HTML report
