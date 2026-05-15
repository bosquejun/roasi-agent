# Workspace Dialog UI Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the broken BROWSE button from the Add Workspace dialog, make the path input full-width with blur validation, and validate path existence server-side before creating a workspace.

**Architecture:** Two-stage validation — frontend checks format on blur (non-empty, absolute path starting with `/`), server validates existence via `fs.stat` in the existing `POST /api/workspaces` endpoint before persisting. No new endpoints or dependencies.

**Tech Stack:** React 19 + TypeScript (studio), Hono + Node.js (local-server), Tailwind CSS v4 + CSS tokens

---

### Task 1: Add path existence validation to POST /api/workspaces

**Files:**
- Modify: `packages/local-server/src/routes/workspaces.ts`

- [ ] **Step 1: Add `fs` import at the top of the file**

At the top of `packages/local-server/src/routes/workspaces.ts`, add:

```ts
import { stat } from "node:fs/promises"
```

- [ ] **Step 2: Add path validation before workspace creation in the POST handler**

Replace the body of `router.post("/", ...)` so it validates the path before creating:

```ts
router.post("/", async (c) => {
  const body = await c.req.json<Pick<Workspace, "id" | "name" | "path">>()
  if (!body.id || !body.name || !body.path) {
    return c.json({ error: "id, name, and path are required" }, 400)
  }

  try {
    const info = await stat(body.path)
    if (!info.isDirectory()) {
      return c.json({ error: "Path is not a directory" }, 400)
    }
  } catch {
    return c.json({ error: "Directory does not exist" }, 400)
  }

  const workspace: Workspace = {
    id: body.id,
    name: body.name,
    path: body.path,
    lastOpenedAt: new Date().toISOString(),
  }
  const created = await workspaceService.create(workspace)
  if (!created) {
    return c.json({ error: "Workspace with that id already exists" }, 409)
  }
  return c.json({ workspace: created }, 201)
})
```

- [ ] **Step 3: Typecheck**

```bash
cd packages/local-server && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/local-server/src/routes/workspaces.ts
git commit -m "feat: validate path exists before creating workspace"
```

---

### Task 2: Update Add Workspace dialog UI

**Files:**
- Modify: `packages/studio/src/features/chat-panel/ChatHeader.tsx`

- [ ] **Step 1: Add per-field path error state**

Inside the `ChatHeader` component, alongside the existing state declarations, add:

```ts
const [pathError, setPathError] = useState("")
```

- [ ] **Step 2: Add blur validation handler**

Add this function inside the component (before the return):

```ts
function handlePathBlur() {
  if (!selectedPath.trim()) {
    setPathError("Directory is required")
  } else if (!selectedPath.startsWith("/")) {
    setPathError("Must be an absolute path (start with /)")
  } else {
    setPathError("")
  }
}
```

- [ ] **Step 3: Clear path error on input change**

Update the `onChange` of the path input to also clear the path error. The onChange should be:

```ts
onChange={(e) => {
  setSelectedPath(e.target.value)
  setPathError("")
}}
```

- [ ] **Step 4: Reset pathError on dialog close**

In the `onOpenChange` handler of the `Dialog`, add `setPathError("")` alongside the existing resets:

```ts
onOpenChange={(open) => {
  setDialogOpen(open)
  if (!open) {
    setAddError("")
    setNewWorkspaceName("")
    setSelectedPath("")
    setPathError("")
  }
}}
```

Also add `setPathError("")` in the CANCEL button's onClick:

```ts
onClick={() => {
  setDialogOpen(false)
  setAddError("")
  setNewWorkspaceName("")
  setSelectedPath("")
  setPathError("")
}}
```

- [ ] **Step 5: Replace BROWSE button + path input with full-width input and inline error**

Replace the entire DIRECTORY section (the `<div className="flex flex-col gap-2">` block that contains the BROWSE button and path input) with:

```tsx
<div className="flex flex-col gap-2">
  <span
    className="text-[var(--text-muted)]"
    style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}
  >
    DIRECTORY
  </span>
  <input
    type="text"
    value={selectedPath}
    onChange={(e) => {
      setSelectedPath(e.target.value)
      setPathError("")
    }}
    onBlur={handlePathBlur}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleAddWorkspace()
    }}
    placeholder="/home/user/my-project"
    className={`w-full border-[3px] bg-transparent px-3 py-2 text-[var(--text-primary)] text-xs outline-none placeholder:text-[var(--text-muted)] ${
      pathError ? "border-[var(--fire-red)]" : "border-[var(--black)]"
    }`}
    style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
  />
  {pathError && (
    <span
      className="text-xs text-[var(--fire-red)]"
      style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}
    >
      {pathError}
    </span>
  )}
</div>
```

- [ ] **Step 6: Remove unused imports**

Remove `IconFolderOpen` from the import at the top since the BROWSE button is gone:

```ts
import { IconPlus } from "@tabler/icons-react"
```

- [ ] **Step 7: Typecheck**

```bash
cd packages/studio && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 8: Verify in browser**

Start the dev servers and open the studio:

```bash
# terminal 1
cd packages/local-server && pnpm dev

# terminal 2
cd packages/studio && pnpm dev
```

Check:
- BROWSE button is gone
- Path input is full-width
- Blurring with empty path shows "Directory is required" with red border
- Blurring with `myproject` (no leading `/`) shows "Must be an absolute path" with red border
- Blurring with `/home/user` clears the error
- Adding a workspace with a non-existent path shows "Directory does not exist"
- Adding a workspace with a valid path succeeds

- [ ] **Step 9: Commit**

```bash
git add packages/studio/src/features/chat-panel/ChatHeader.tsx
git commit -m "feat: improve workspace dialog — remove BROWSE, add path validation"
```
