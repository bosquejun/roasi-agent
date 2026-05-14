# Confirmation Pattern Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate mutating AI tools (`scanSite`, `installDependencies`) behind user confirmation, and add `installDependencies` to automatically recover when Chrome is missing.

**Architecture:** A `withApproval` wrapper adds `needsApproval: () => true` to any tool at the AI SDK level. A generic `ConfirmationRenderer` in the Studio renders approval requests and calls `addToolResult` to resolve them. `addToolResult` is threaded from `useChat` down through `ConversationPanel` to each renderer via `ToolRendererProps`.

**Tech Stack:** Vercel AI SDK v6, Hono, Vitest, React 19, Tailwind v4, `@roaster/ui` Confirmation + Tool components.

---

### Task 1: `withApproval` utility + `installDependencies` tool

**Files:**
- Create: `packages/ai/src/tools/with-approval.ts`
- Create: `packages/ai/src/tools/install-dependencies.ts`
- Create: `packages/ai/src/tools/install-dependencies.test.ts`

- [ ] **Step 1: Write the failing tests for `installDependencies`**

```ts
// packages/ai/src/tools/install-dependencies.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("child_process", () => ({
  spawnSync: vi.fn(() => ({ status: 0 })),
}))

import { spawnSync } from "child_process"
import { installDependencies } from "./install-dependencies.js"

const mockSpawnSync = vi.mocked(spawnSync)

describe("installDependencies", () => {
  const execute = installDependencies.execute!

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns success when npm install exits 0", async () => {
    mockSpawnSync.mockReturnValue({ status: 0 } as any)
    const result = await execute({}, {} as any)
    expect(result).toEqual({ success: true })
  })

  it("returns error when npm install exits non-zero", async () => {
    mockSpawnSync.mockReturnValue({ status: 1 } as any)
    const result = await execute({}, {} as any)
    expect(result).toEqual({ error: "Install failed with exit code 1" })
  })

  it("returns error when spawnSync itself errors (ENOENT)", async () => {
    mockSpawnSync.mockReturnValue({ status: null, error: new Error("spawn npm ENOENT") } as any)
    const result = await execute({}, {} as any)
    expect(result).toEqual({ error: "Install process error: spawn npm ENOENT" })
  })

  it("calls npm install -g with @unlighthouse/cli and puppeteer", async () => {
    mockSpawnSync.mockReturnValue({ status: 0 } as any)
    await execute({}, {} as any)
    expect(mockSpawnSync).toHaveBeenCalledWith(
      "npm",
      ["install", "-g", "@unlighthouse/cli", "puppeteer"],
      { stdio: "inherit" }
    )
  })

  it("has needsApproval: true", () => {
    expect(typeof installDependencies.needsApproval).toBe("function")
    expect((installDependencies.needsApproval as () => boolean)()).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/ai && pnpm vitest run src/tools/install-dependencies.test.ts
```

Expected: FAIL — `installDependencies` not found.

- [ ] **Step 3: Create `withApproval` utility**

```ts
// packages/ai/src/tools/with-approval.ts
import type { Tool } from "ai"

export function withApproval<T extends Tool>(tool: T): T {
  return { ...tool, needsApproval: () => true }
}
```

- [ ] **Step 4: Create `installDependencies` tool**

```ts
// packages/ai/src/tools/install-dependencies.ts
import { tool } from "ai"
import { spawnSync } from "child_process"
import { z } from "zod"
import { withApproval } from "./with-approval.js"

export const installDependencies = withApproval(
  tool({
    description:
      "Install @unlighthouse/cli and puppeteer globally. This provides the Chromium browser engine required by scanSite. Only call this when scanSite returns a Chrome/Chromium not found error.",
    inputSchema: z.object({}),
    execute: async () => {
      const result = spawnSync(
        "npm",
        ["install", "-g", "@unlighthouse/cli", "puppeteer"],
        { stdio: "inherit" }
      )
      if (result.error) {
        return { error: `Install process error: ${result.error.message}` }
      }
      if (result.status !== 0) {
        return { error: `Install failed with exit code ${result.status}` }
      }
      return { success: true }
    },
  })
)
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd packages/ai && pnpm vitest run src/tools/install-dependencies.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/ai/src/tools/with-approval.ts packages/ai/src/tools/install-dependencies.ts packages/ai/src/tools/install-dependencies.test.ts
git commit -m "feat(ai): add withApproval wrapper and installDependencies tool"
```

---

### Task 2: Wire up `packages/ai` — wrap `scanSite`, export `installDependencies`

**Files:**
- Modify: `packages/ai/src/tools/scan-site.ts`
- Modify: `packages/ai/src/index.ts`
- Test: `packages/ai/src/tools/scan-site.test.ts` (existing — one test must be updated)

- [ ] **Step 1: Verify existing `scanSite` tests still access `.execute` correctly**

The test file already uses `const execute = scanSite.execute!` — this works after wrapping because `withApproval` spreads all tool properties. Run to confirm current state passes:

```bash
cd packages/ai && pnpm vitest run src/tools/scan-site.test.ts
```

Expected: All tests pass.

- [ ] **Step 2: Wrap `scanSite` with `withApproval`**

In `packages/ai/src/tools/scan-site.ts`, change the last section:

```ts
// Add this import at the top (after existing imports):
import { withApproval } from "./with-approval.js"

// Change the export at the bottom — replace:
export const scanSite = tool({
// with:
export const scanSite = withApproval(tool({
// and close with:
}))
```

Full final export section (replace everything from `export const scanSite` to end of file):

```ts
import { withApproval } from "./with-approval.js"

export const scanSite = withApproval(
  tool({
    description:
      "Scan a website using Unlighthouse. Checks prerequisites, runs the scan, and returns outputPath for use with analyzeResults.",
    inputSchema: z.object({
      url: z.string().url().describe("The website URL to scan"),
    }),
    execute: async ({ url }) => {
      const prereqError = checkPrerequisites()
      if (prereqError) return { error: prereqError }

      const outputPath = deriveOutputPath(url)
      const result = spawnSync(
        "npx",
        ["unlighthouse-ci", "--site", url, "--output-path", outputPath, "--reporter", "jsonExpanded"],
        { stdio: "inherit" }
      )
      if (result.error) {
        return { error: `Scan process error: ${result.error.message}` }
      }
      if (result.status !== 0) {
        return { error: `Scan failed with exit code ${result.status ?? "unknown"}` }
      }
      return { outputPath }
    },
  })
)
```

- [ ] **Step 3: Run `scanSite` tests to confirm still passing**

```bash
cd packages/ai && pnpm vitest run src/tools/scan-site.test.ts
```

Expected: All 11 tests pass.

- [ ] **Step 4: Export `installDependencies` from `packages/ai/src/index.ts`**

```ts
// packages/ai/src/index.ts — add line:
export { installDependencies } from "./tools/install-dependencies.js"
```

Full file after edit:

```ts
export { discoverSkills } from "./skills/discover-skills.js"
export { scanSite } from "./tools/scan-site.js"
export { analyzeResults } from "./tools/analyze-results.js"
export { installDependencies } from "./tools/install-dependencies.js"
```

- [ ] **Step 5: Run all `packages/ai` tests**

```bash
cd packages/ai && pnpm vitest run
```

Expected: All 16 tests pass (11 scanSite + 5 installDependencies).

- [ ] **Step 6: Typecheck `packages/ai`**

```bash
cd packages/ai && pnpm typecheck
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ai/src/tools/scan-site.ts packages/ai/src/index.ts
git commit -m "feat(ai): gate scanSite + installDependencies with approval"
```

---

### Task 3: `local-server` — register `installDependencies` + update agent instructions

**Files:**
- Modify: `packages/local-server/src/index.ts`

- [ ] **Step 1: Add `installDependencies` to tools and update agent instructions**

In `packages/local-server/src/index.ts`:

1. Update the import from `@roaster/ai`:

```ts
import { discoverSkills, scanSite, analyzeResults, installDependencies } from "@roaster/ai"
```

2. Update the tools object:

```ts
const tools = { ...skillTools, getWeather, scanSite, analyzeResults, installDependencies }
```

3. Update the `instructions` constant — append the `installDependencies` block inside the template literal, before `buildSkillsPrompt(skills)`:

```ts
const instructions = `
You are Roaster, a website quality analyst.

When a user asks to analyze, roast, audit, or get feedback on a website:
1. Call scanSite with the URL — wait for the outputPath
2. Call analyzeResults with that outputPath — get the structured report
3. Reason over the report and deliver findings in your persona

If scanSite returns an error, explain the issue to the user with the exact error message and suggest the fix.

When scanSite returns a "Chrome/Chromium not found" error:
- Call installDependencies — the user will be prompted to confirm the installation
- Do not ask the user to install manually unless they deny the tool

When the user denies installDependencies:
- Explain what to install manually: npm install -g @unlighthouse/cli puppeteer

${buildSkillsPrompt(skills)}
`.trim()
```

- [ ] **Step 2: Typecheck `packages/local-server`**

```bash
cd packages/local-server && pnpm typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/local-server/src/index.ts
git commit -m "feat(local-server): register installDependencies tool and update agent instructions"
```

---

### Task 4: Thread `addToolResult` through studio UI types and renderers

**Files:**
- Modify: `packages/studio/src/features/chat-panel/tool-renderers/types.ts`
- Modify: `packages/studio/src/features/chat-panel/ChatPanel.tsx`
- Modify: `packages/studio/src/features/chat-panel/ConversationPanel.tsx`
- Modify: `packages/studio/src/features/chat-panel/tool-renderers/index.tsx`
- Modify: `packages/studio/src/features/chat-panel/tool-renderers/bash.tsx`
- Modify: `packages/studio/src/features/chat-panel/tool-renderers/default.tsx`

- [ ] **Step 1: Update `ToolRendererProps` to include `addToolResult`**

Replace the entire content of `packages/studio/src/features/chat-panel/tool-renderers/types.ts`:

```ts
import type { ToolUIPart } from "ai"

export type ToolRendererProps = {
  part: ToolUIPart
  messageId: string
  addToolResult: (opts: { toolCallId: string; result: unknown }) => void
}

export type ToolRenderer = (props: ToolRendererProps) => React.ReactNode
```

- [ ] **Step 2: Extract `addToolResult` in `ChatPanel.tsx` and pass to `ConversationPanel`**

In `packages/studio/src/features/chat-panel/ChatPanel.tsx`:

1. Add `addToolResult` to the `useChat` destructure:

```ts
const { messages, sendMessage, status, regenerate, error, clearError, addToolResult } = useChat({
  transport: new DefaultChatTransport({
    api: "http://192.168.100.21:5002/api/chat",
  }),
})
```

2. Pass `addToolResult` to `ConversationPanel`:

```tsx
<ConversationPanel
  messages={messages}
  regenerate={regenerate}
  status={status}
  error={error}
  addToolResult={addToolResult}
/>
```

- [ ] **Step 3: Accept `addToolResult` in `ConversationPanel` and pass to renderers**

In `packages/studio/src/features/chat-panel/ConversationPanel.tsx`:

1. Update the interface:

```ts
interface ConversationPanelProps {
  messages: UIMessage[]
  regenerate: () => void
  status: ChatStatus
  error?: Error
  addToolResult: (opts: { toolCallId: string; result: unknown }) => void
}
```

2. Destructure the new prop:

```ts
export default function ConversationPanel({
  messages,
  regenerate,
  status,
  error,
  addToolResult,
}: ConversationPanelProps) {
```

3. Pass `addToolResult` to both render calls (in the `message.parts.map` switch):

```ts
case "dynamic-tool":
  return renderDynamicToolPart(part, message.id, addToolResult)
default: {
  if (part.type.startsWith("tool-")) {
    return renderToolPart(part as import("ai").ToolUIPart, message.id, addToolResult)
  }
  return null
}
```

- [ ] **Step 4: Update `renderToolPart` and `renderDynamicToolPart` in `index.tsx`**

Replace the entire content of `packages/studio/src/features/chat-panel/tool-renderers/index.tsx`:

```tsx
import type { DynamicToolUIPart, ToolUIPart } from "ai"
import { BashToolRenderer } from "./bash"
import { DefaultToolRenderer } from "./default"
import type { ToolRenderer, ToolRendererProps } from "./types"

const registry: Record<string, ToolRenderer> = {
  bash: BashToolRenderer,
}

export function renderToolPart(
  part: ToolUIPart,
  messageId: string,
  addToolResult: ToolRendererProps["addToolResult"]
) {
  const toolName = part.type.split("-").slice(1).join("-")
  const Renderer = registry[toolName] ?? DefaultToolRenderer
  return <Renderer part={part} messageId={messageId} addToolResult={addToolResult} />
}

export function renderDynamicToolPart(
  part: DynamicToolUIPart,
  messageId: string,
  addToolResult: ToolRendererProps["addToolResult"]
) {
  const Renderer = registry[part.toolName] ?? DefaultToolRenderer
  return (
    <Renderer
      part={{ ...part, type: `tool-${part.toolName}` } as ToolUIPart}
      messageId={messageId}
      addToolResult={addToolResult}
    />
  )
}
```

Note: `ConfirmationRenderer` will be added to the registry in Task 5 to avoid a circular import during this step.

- [ ] **Step 5: Update `BashToolRenderer` to accept (and ignore) `addToolResult`**

In `packages/studio/src/features/chat-panel/tool-renderers/bash.tsx`, change the function signature:

```ts
export function BashToolRenderer({ part, messageId }: ToolRendererProps) {
```

becomes:

```ts
export function BashToolRenderer({ part, messageId, addToolResult: _ }: ToolRendererProps) {
```

(The `_` prefix satisfies Biome's unused-variable rule while making the intent clear.)

- [ ] **Step 6: Update `DefaultToolRenderer` to accept (and ignore) `addToolResult`**

In `packages/studio/src/features/chat-panel/tool-renderers/default.tsx`, change the function signature:

```ts
export function DefaultToolRenderer({ part, messageId }: ToolRendererProps) {
```

becomes:

```ts
export function DefaultToolRenderer({ part, messageId, addToolResult: _ }: ToolRendererProps) {
```

- [ ] **Step 7: Typecheck `packages/studio`**

```bash
cd packages/studio && pnpm typecheck
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add \
  packages/studio/src/features/chat-panel/tool-renderers/types.ts \
  packages/studio/src/features/chat-panel/ChatPanel.tsx \
  packages/studio/src/features/chat-panel/ConversationPanel.tsx \
  packages/studio/src/features/chat-panel/tool-renderers/index.tsx \
  packages/studio/src/features/chat-panel/tool-renderers/bash.tsx \
  packages/studio/src/features/chat-panel/tool-renderers/default.tsx
git commit -m "feat(studio): thread addToolResult through ConversationPanel to tool renderers"
```

---

### Task 5: `ConfirmationRenderer` + update registry

**Files:**
- Create: `packages/studio/src/features/chat-panel/tool-renderers/confirmation.tsx`
- Modify: `packages/studio/src/features/chat-panel/tool-renderers/index.tsx`

- [ ] **Step 1: Create `ConfirmationRenderer`**

```tsx
// packages/studio/src/features/chat-panel/tool-renderers/confirmation.tsx
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@roaster/ui/components/ai-elements/confirmation"
import { Tool, ToolContent, ToolHeader, ToolInput } from "@roaster/ui/components/ai-elements/tool"
import { DefaultToolRenderer } from "./default"
import type { ToolRendererProps } from "./types"

export function ConfirmationRenderer({ part, messageId, addToolResult }: ToolRendererProps) {
  if (part.state === "output-available") {
    return (
      <DefaultToolRenderer part={part} messageId={messageId} addToolResult={addToolResult} />
    )
  }

  const approval = "approval" in part ? (part.approval as { id: string; approved?: boolean }) : undefined

  return (
    <Tool key={`${messageId}-${part.toolCallId}`}>
      <ToolHeader type={part.type} state={part.state} />
      <ToolContent>
        <Confirmation approval={approval} state={part.state}>
          <ConfirmationRequest>
            <ToolInput input={part.input} />
            <ConfirmationActions>
              <ConfirmationAction
                variant="outline"
                onClick={() =>
                  addToolResult({ toolCallId: part.toolCallId, result: { approved: false } })
                }
              >
                Cancel
              </ConfirmationAction>
              <ConfirmationAction
                onClick={() =>
                  addToolResult({ toolCallId: part.toolCallId, result: { approved: true } })
                }
              >
                Confirm
              </ConfirmationAction>
            </ConfirmationActions>
          </ConfirmationRequest>
          <ConfirmationAccepted>
            <ConfirmationTitle>Approved</ConfirmationTitle>
          </ConfirmationAccepted>
          <ConfirmationRejected>
            <ConfirmationTitle>Denied</ConfirmationTitle>
          </ConfirmationRejected>
        </Confirmation>
      </ToolContent>
    </Tool>
  )
}
```

- [ ] **Step 2: Register `ConfirmationRenderer` for `scanSite` and `installDependencies`**

In `packages/studio/src/features/chat-panel/tool-renderers/index.tsx`, add the import and registry entries:

```tsx
import type { DynamicToolUIPart, ToolUIPart } from "ai"
import { BashToolRenderer } from "./bash"
import { ConfirmationRenderer } from "./confirmation"
import { DefaultToolRenderer } from "./default"
import type { ToolRenderer, ToolRendererProps } from "./types"

const registry: Record<string, ToolRenderer> = {
  bash: BashToolRenderer,
  scanSite: ConfirmationRenderer,
  installDependencies: ConfirmationRenderer,
}

export function renderToolPart(
  part: ToolUIPart,
  messageId: string,
  addToolResult: ToolRendererProps["addToolResult"]
) {
  const toolName = part.type.split("-").slice(1).join("-")
  const Renderer = registry[toolName] ?? DefaultToolRenderer
  return <Renderer part={part} messageId={messageId} addToolResult={addToolResult} />
}

export function renderDynamicToolPart(
  part: DynamicToolUIPart,
  messageId: string,
  addToolResult: ToolRendererProps["addToolResult"]
) {
  const Renderer = registry[part.toolName] ?? DefaultToolRenderer
  return (
    <Renderer
      part={{ ...part, type: `tool-${part.toolName}` } as ToolUIPart}
      messageId={messageId}
      addToolResult={addToolResult}
    />
  )
}
```

- [ ] **Step 3: Typecheck `packages/studio`**

```bash
cd packages/studio && pnpm typecheck
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add \
  packages/studio/src/features/chat-panel/tool-renderers/confirmation.tsx \
  packages/studio/src/features/chat-panel/tool-renderers/index.tsx
git commit -m "feat(studio): add ConfirmationRenderer for approval-gated tools"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| `withApproval<T>(tool: T): T` adds `needsApproval: () => true` | Task 1 |
| `installDependencies` runs `npm install -g @unlighthouse/cli puppeteer` | Task 1 |
| `installDependencies` handles `result.error` and non-zero exit | Task 1 |
| `installDependencies` wrapped with `withApproval` | Task 1 |
| `scanSite` export wrapped with `withApproval` | Task 2 |
| `installDependencies` exported from `packages/ai/src/index.ts` | Task 2 |
| `local-server` registers `installDependencies` in tools | Task 3 |
| Agent instructions updated with Chrome/installDependencies guidance | Task 3 |
| `addToolResult` in `ToolRendererProps` | Task 4 |
| `addToolResult` extracted from `useChat` in `ChatPanel` | Task 4 |
| `addToolResult` threaded through `ConversationPanel` | Task 4 |
| `BashToolRenderer` and `DefaultToolRenderer` accept `addToolResult` | Task 4 |
| `ConfirmationRenderer` renders `approval-requested` with Confirm/Cancel | Task 5 |
| `ConfirmationRenderer` renders Approved/Denied badge after response | Task 5 |
| `ConfirmationRenderer` delegates `output-available` to `DefaultToolRenderer` | Task 5 |
| Registry maps `scanSite` and `installDependencies` → `ConfirmationRenderer` | Task 5 |

**Placeholder scan:** No TBDs or incomplete sections found.

**Type consistency:** `ToolRendererProps["addToolResult"]` used consistently in Task 4 index.tsx and Task 5 — matches the type defined in types.ts.
