# Confirmation Pattern Design

**Date:** 2026-05-13  
**Status:** Approved  
**Scope:** `packages/ai` + `packages/local-server` + `packages/studio`

---

## Overview

Add a general-purpose confirmation gate for mutating AI agent tools. Any tool wrapped with `withApproval()` pauses before executing and waits for explicit user confirmation in the chat UI. The first two tools gated this way are `scanSite` (spawns a long-running process) and `installDependencies` (new — installs `@unlighthouse/cli` + `puppeteer` globally when Chrome is missing).

The gate is enforced at the AI SDK level via `needsApproval: () => true` — the agent cannot bypass it.

---

## Architecture

```
packages/ai/src/
  tools/
    with-approval.ts          ← NEW: wraps any tool with needsApproval: true
    install-dependencies.ts   ← NEW: installs @unlighthouse/cli + puppeteer globally
    scan-site.ts              ← MODIFY: wrap export with withApproval
  index.ts                    ← MODIFY: export installDependencies

packages/local-server/src/
  index.ts                    ← MODIFY: register installDependencies, update agent instructions

packages/studio/src/features/chat-panel/
  ChatPanel.tsx               ← MODIFY: extract addToolResult from useChat, pass down
  ConversationPanel.tsx       ← MODIFY: accept addToolResult prop, thread to renderers
  tool-renderers/
    types.ts                  ← MODIFY: add addToolResult to ToolRendererProps
    confirmation.tsx          ← NEW: generic renderer for all approval-gated tools
    index.tsx                 ← MODIFY: register scanSite + installDependencies → ConfirmationRenderer
```

---

## `withApproval` Utility

**File:** `packages/ai/src/tools/with-approval.ts`

```ts
import type { Tool } from "ai"
export function withApproval<T extends Tool>(tool: T): T {
  return { ...tool, needsApproval: () => true }
}
```

Any tool passed through gets `needsApproval: () => true`. Adding the gate to a future tool is one call.

---

## Tool: `installDependencies`

**File:** `packages/ai/src/tools/install-dependencies.ts`

**Input schema:** `{}` — no parameters. Always installs `@unlighthouse/cli puppeteer`.

**Execution:**
1. Run `spawnSync("npm", ["install", "-g", "@unlighthouse/cli", "puppeteer"], { stdio: "inherit" })`
2. Check `result.error` → return `{ error: "Install process error: <message>" }`
3. Check `result.status !== 0` → return `{ error: "Install failed with exit code <n>" }`
4. Return `{ success: true }`

**Export:** `export const installDependencies = withApproval(tool({...}))`

**Description string (shown to agent):**  
`"Install @unlighthouse/cli and puppeteer globally. This provides the Chromium browser engine required by scanSite. Only call this when scanSite returns a Chrome/Chromium not found error."`

---

## `scanSite` Modification

**File:** `packages/ai/src/tools/scan-site.ts`

Change only the export line — wrap with `withApproval`:

```ts
export const scanSite = withApproval(tool({ ... }))
```

No other changes to the tool's logic.

---

## Exports

**`packages/ai/src/index.ts`** — add:
```ts
export { installDependencies } from "./tools/install-dependencies.js"
```

---

## Generic ConfirmationRenderer

**File:** `packages/studio/src/features/chat-panel/tool-renderers/confirmation.tsx`

Handles any approval-gated tool. Three display states:

| Tool state | What renders |
|-----------|-------------|
| `approval-requested` | Tool name + input summary + **Confirm** / **Cancel** buttons |
| `approval-responded` / `output-denied` | "Approved" or "Denied" badge only |
| `output-available` | Delegates to `DefaultToolRenderer` for result display |

**On Confirm:**
```ts
addToolResult({ toolCallId: part.toolCallId, result: { approved: true } })
```

**On Cancel:**
```ts
addToolResult({ toolCallId: part.toolCallId, result: { approved: false } })
```

Uses existing components from `@roaster/ui/components/ai-elements/confirmation`:
`Confirmation`, `ConfirmationRequest`, `ConfirmationActions`, `ConfirmationAction`, `ConfirmationAccepted`, `ConfirmationRejected`

And `Tool`, `ToolHeader`, `ToolContent` from `@roaster/ui/components/ai-elements/tool`.

---

## UI Threading

Three small changes to thread `addToolResult` from `useChat` down to renderers:

**`ChatPanel.tsx`**
```ts
const { messages, sendMessage, status, regenerate, error, clearError, addToolResult } = useChat({...})
// pass addToolResult to ConversationPanel
```

**`ConversationPanel.tsx`**
```ts
interface ConversationPanelProps {
  // ...existing props
  addToolResult: (opts: { toolCallId: string; result: unknown }) => void
}
// pass addToolResult to renderToolPart / renderDynamicToolPart
```

**`tool-renderers/types.ts`**
```ts
export type ToolRendererProps = {
  part: ToolUIPart
  messageId: string
  addToolResult: (opts: { toolCallId: string; result: unknown }) => void
}
```

**`tool-renderers/index.tsx`** — register new renderers:
```ts
const registry: Record<string, ToolRenderer> = {
  bash: BashToolRenderer,
  scanSite: ConfirmationRenderer,
  installDependencies: ConfirmationRenderer,
}
```

Registry keys are derived by the existing extraction logic: `part.type.split("-").slice(1).join("-")`. Since tools are registered in `local-server` with camelCase keys (`{ scanSite, installDependencies }`), the AI SDK sets `part.type` to `"tool-scanSite"` and `"tool-installDependencies"`, which yields registry keys `"scanSite"` and `"installDependencies"`.

Note: `BashToolRenderer` and `DefaultToolRenderer` signatures must also be updated to accept `addToolResult` (unused but required by the shared `ToolRendererProps` type).

---

## Local-Server Integration

**`packages/local-server/src/index.ts`**

Add to tools object:
```ts
const tools = { ...skillTools, getWeather, scanSite, analyzeResults, installDependencies }
```

Add to agent instructions:
```
When scanSite returns a "Chrome/Chromium not found" error:
- Call installDependencies — the user will be prompted to confirm the installation
- Do not ask the user to install manually unless they deny the tool

When the user denies installDependencies:
- Explain what to install manually: npm install -g @unlighthouse/cli puppeteer
```

---

## Error Handling

| Scenario | Behavior |
|----------|---------|
| User denies `scanSite` | Agent responds: "Scan cancelled." |
| User denies `installDependencies` | Agent explains manual install command |
| `installDependencies` succeeds | Agent retries `scanSite` automatically (within the 5-step loop) |
| `installDependencies` fails | Agent surfaces the error message and suggests manual install |

---

## Out of Scope

- Per-tool custom confirmation copy (generic renderer for now)
- Configuring which tools require approval at runtime
- Approval timeout / auto-deny
- Audit log of approvals
