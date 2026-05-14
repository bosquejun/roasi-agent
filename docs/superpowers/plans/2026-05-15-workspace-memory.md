# Workspace Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist workspaces to a `.jsonl` file and expose CRUD API endpoints, then wire the existing Studio UI to read/write from those endpoints.

**Architecture:** A file-based `WorkspaceService` reads/writes `packages/local-server/.memory/workspaces.jsonl` (one JSON record per line). Five Hono routes in a new `routes/workspaces.ts` expose CRUD operations. `ChatHeader.tsx` replaces ephemeral state with `fetch` calls to those routes.

**Tech Stack:** Hono.js, Node.js `fs/promises`, TypeScript, React 19

---

## File Map

| Action | Path |
|--------|------|
| Modify | `packages/local-server/src/types/index.ts` |
| Create | `packages/local-server/src/services/workspaces.ts` |
| Create | `packages/local-server/src/routes/workspaces.ts` |
| Modify | `packages/local-server/src/routes/index.ts` |
| Modify | `packages/studio/src/features/chat-panel/ChatHeader.tsx` |

---

### Task 1: Add Workspace type

**Files:**
- Modify: `packages/local-server/src/types/index.ts`

- [ ] **Step 1: Add Workspace type**

Open `packages/local-server/src/types/index.ts` and append:

```ts
export type Workspace = {
  id: string
  name: string
  path: string
  lastOpenedAt: string
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/local-server && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/local-server/src/types/index.ts
git commit -m "feat: add Workspace type"
```

---

### Task 2: Create workspace file service

**Files:**
- Create: `packages/local-server/src/services/workspaces.ts`

- [ ] **Step 1: Create the service**

Create `packages/local-server/src/services/workspaces.ts` with this content:

```ts
import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"
import type { Workspace } from "../types/index.js"

const MEMORY_DIR = path.join(process.cwd(), ".memory")
const WORKSPACES_FILE = path.join(MEMORY_DIR, "workspaces.jsonl")

async function ensureDir(): Promise<void> {
  await mkdir(MEMORY_DIR, { recursive: true })
}

async function readAll(): Promise<Workspace[]> {
  try {
    const raw = await readFile(WORKSPACES_FILE, "utf-8")
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Workspace)
  } catch {
    return []
  }
}

async function writeAll(workspaces: Workspace[]): Promise<void> {
  await ensureDir()
  await writeFile(
    WORKSPACES_FILE,
    workspaces.map((w) => JSON.stringify(w)).join("\n") + (workspaces.length ? "\n" : ""),
    "utf-8"
  )
}

export const workspaceService = {
  async list(): Promise<Workspace[]> {
    return readAll()
  },

  async get(id: string): Promise<Workspace | undefined> {
    const all = await readAll()
    return all.find((w) => w.id === id)
  },

  async create(workspace: Workspace): Promise<Workspace | null> {
    await ensureDir()
    const all = await readAll()
    if (all.some((w) => w.id === workspace.id)) return null
    const { appendFile } = await import("fs/promises")
    await appendFile(WORKSPACES_FILE, JSON.stringify(workspace) + "\n", "utf-8")
    return workspace
  },

  async update(id: string, patch: Partial<Omit<Workspace, "id">>): Promise<Workspace | undefined> {
    const all = await readAll()
    const idx = all.findIndex((w) => w.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...patch }
    await writeAll(all)
    return all[idx]
  },

  async delete(id: string): Promise<boolean> {
    const all = await readAll()
    const filtered = all.filter((w) => w.id !== id)
    if (filtered.length === all.length) return false
    await writeAll(filtered)
    return true
  },
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/local-server && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/local-server/src/services/workspaces.ts
git commit -m "feat: add file-based workspace service"
```

---

### Task 3: Create workspace routes

**Files:**
- Create: `packages/local-server/src/routes/workspaces.ts`

- [ ] **Step 1: Create the route file**

Create `packages/local-server/src/routes/workspaces.ts`:

```ts
import { Hono } from "hono"
import type { Workspace } from "../types/index.js"
import { workspaceService } from "../services/workspaces.js"

export function createWorkspacesRouter() {
  const router = new Hono()

  router.get("/", async (c) => {
    const workspaces = await workspaceService.list()
    return c.json({ workspaces })
  })

  router.post("/", async (c) => {
    const body = await c.req.json<Pick<Workspace, "id" | "name" | "path">>()
    if (!body.id || !body.name || !body.path) {
      return c.json({ error: "id, name, and path are required" }, 400)
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

  router.get("/:id", async (c) => {
    const id = c.req.param("id")
    const workspace = await workspaceService.get(id)
    if (!workspace) {
      return c.json({ error: "Not found" }, 404)
    }
    return c.json({ workspace })
  })

  router.patch("/:id", async (c) => {
    const id = c.req.param("id")
    const patch = await c.req.json<Partial<Omit<Workspace, "id">>>()
    const updated = await workspaceService.update(id, patch)
    if (!updated) {
      return c.json({ error: "Not found" }, 404)
    }
    return c.json({ workspace: updated })
  })

  router.delete("/:id", async (c) => {
    const id = c.req.param("id")
    const deleted = await workspaceService.delete(id)
    if (!deleted) {
      return c.json({ error: "Not found" }, 404)
    }
    return c.json({ success: true })
  })

  return router
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/local-server && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/local-server/src/routes/workspaces.ts
git commit -m "feat: add workspace API routes"
```

---

### Task 4: Register workspace routes

**Files:**
- Modify: `packages/local-server/src/routes/index.ts`

- [ ] **Step 1: Register the router**

Open `packages/local-server/src/routes/index.ts`. Add the import and registration:

```ts
import type { Hono } from "hono"
import type { SkillMetadata } from "@roaster/ai/tools/skills"
import { createChatRouter } from "./chat.js"
import { createAnalyticsRouter } from "./analytics.js"
import { createMemoryRouter } from "./memory.js"
import { createPublishingRouter } from "./publishing.js"
import { createWorkspacesRouter } from "./workspaces.js"

export function registerRoutes(app: Hono, skills: SkillMetadata[]): void {
  app.route("/api/chat", createChatRouter(skills))
  app.route("/api/analytics", createAnalyticsRouter())
  app.route("/api/memory", createMemoryRouter())
  app.route("/api/publish", createPublishingRouter())
  app.route("/api/workspaces", createWorkspacesRouter())
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/local-server && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Smoke test the API**

Start the server in one terminal:
```bash
cd packages/local-server && pnpm dev
```

In another terminal, run these curl commands and verify the expected responses:

```bash
# List (empty)
curl http://localhost:5002/api/workspaces
# Expected: {"workspaces":[]}

# Create
curl -X POST http://localhost:5002/api/workspaces \
  -H "Content-Type: application/json" \
  -d '{"id":"my-project","name":"My Project","path":"/home/user/my-project"}'
# Expected: {"workspace":{"id":"my-project","name":"My Project","path":"/home/user/my-project","lastOpenedAt":"<iso-timestamp>"}}, HTTP 201

# List again
curl http://localhost:5002/api/workspaces
# Expected: {"workspaces":[{"id":"my-project",...}]}

# Get by id
curl http://localhost:5002/api/workspaces/my-project
# Expected: {"workspace":{"id":"my-project",...}}

# Patch lastOpenedAt
curl -X PATCH http://localhost:5002/api/workspaces/my-project \
  -H "Content-Type: application/json" \
  -d '{"lastOpenedAt":"2026-05-15T12:00:00.000Z"}'
# Expected: {"workspace":{...,"lastOpenedAt":"2026-05-15T12:00:00.000Z"}}

# Delete
curl -X DELETE http://localhost:5002/api/workspaces/my-project
# Expected: {"success":true}

# 404
curl http://localhost:5002/api/workspaces/nonexistent
# Expected: {"error":"Not found"}, HTTP 404

# Duplicate id
curl -X POST http://localhost:5002/api/workspaces \
  -H "Content-Type: application/json" \
  -d '{"id":"my-project","name":"My Project","path":"/home/user/my-project"}'
# then repeat — Expected: {"error":"Workspace with that id already exists"}, HTTP 409
```

- [ ] **Step 4: Commit**

```bash
git add packages/local-server/src/routes/index.ts
git commit -m "feat: register workspace routes"
```

---

### Task 5: Wire frontend to workspace API

**Files:**
- Modify: `packages/studio/src/features/chat-panel/ChatHeader.tsx`

- [ ] **Step 1: Update the Workspace interface and add API helpers**

Replace the contents of `packages/studio/src/features/chat-panel/ChatHeader.tsx` with:

```tsx
import { Button } from "@roaster/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@roaster/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@roaster/ui/components/select"
import { cn } from "@roaster/ui/lib/utils"
import { IconFolderOpen, IconPlus } from "@tabler/icons-react"
import { useEffect, useState } from "react"

const API_BASE = "http://localhost:5002"

interface Workspace {
  id: string
  name: string
  path: string
  lastOpenedAt: string
}

interface ChatHeaderProps {
  previewOpen: boolean
  onTogglePreview: () => void
}

async function fetchWorkspaces(): Promise<Workspace[]> {
  const res = await fetch(`${API_BASE}/api/workspaces`)
  const data = await res.json()
  return data.workspaces ?? []
}

async function createWorkspace(
  payload: Pick<Workspace, "id" | "name" | "path">
): Promise<Workspace | null> {
  const res = await fetch(`${API_BASE}/api/workspaces`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.workspace
}

async function touchWorkspace(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/workspaces/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lastOpenedAt: new Date().toISOString() }),
  })
}

export function ChatHeader({ previewOpen, onTogglePreview }: ChatHeaderProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const [selectedPath, setSelectedPath] = useState("")

  useEffect(() => {
    fetchWorkspaces().then(setWorkspaces).catch(console.error)
  }, [])

  async function handleAddWorkspace() {
    const name = newWorkspaceName.trim() || selectedPath
    if (!name) return
    const id = name.toLowerCase().replace(/\s+/g, "-")
    const created = await createWorkspace({ id, name, path: selectedPath || name })
    if (created) {
      setWorkspaces((prev) => [...prev.filter((w) => w.id !== id), created])
      setWorkspace(created)
    }
    setNewWorkspaceName("")
    setSelectedPath("")
    setDialogOpen(false)
  }

  async function handleSelectWorkspace(id: string) {
    const found = workspaces.find((w) => w.id === id)
    if (!found) return
    setWorkspace(found)
    await touchWorkspace(id)
  }

  return (
    <div
      className="flex shrink-0 items-center justify-between border-[var(--black)] border-b-[3px] bg-[var(--bg-card)] px-4"
      style={{ height: 56, minHeight: 56 }}
    >
      <Select value={workspace?.id ?? ""} onValueChange={handleSelectWorkspace}>
        <SelectTrigger
          className="border-[3px] border-[var(--black)] bg-transparent shadow-[var(--shadow-xs)] transition-all duration-150 hover:bg-[var(--smoke)]"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            height: 32,
            paddingTop: 0,
            paddingBottom: 0,
          }}
        >
          <SelectValue placeholder="SELECT WORKSPACE" />
        </SelectTrigger>
        <SelectContent
          align="start"
          className="border-[3px] border-[var(--black)] bg-[var(--bg-card)] shadow-neo-md"
          style={{ minWidth: 160 }}
        >
          {workspaces.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name.toUpperCase()}
            </SelectItem>
          ))}
          {workspaces.length > 0 && <SelectSeparator className="my-1" />}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <button
                  type="button"
                  className="flex w-full cursor-default select-none items-center gap-2 rounded-none px-2 py-2 text-[var(--text-muted)] text-xs outline-hidden hover:bg-accent hover:text-accent-foreground"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
                  onSelect={(e) => e.preventDefault()}
                >
                  <IconPlus size={14} />
                  ADD WORKSPACE
                </button>
              }
            />
            <DialogContent className="border-[3px] border-[var(--black)] shadow-neo-lg">
              <DialogHeader>
                <DialogTitle
                  className="text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
                >
                  ADD WORKSPACE
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span
                    className="text-[var(--text-muted)]"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}
                  >
                    NAME
                  </span>
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddWorkspace()
                    }}
                    placeholder="my-workspace"
                    className="w-full border-[3px] border-[var(--black)] bg-transparent px-3 py-2 text-[var(--text-primary)] text-xs outline-none placeholder:text-[var(--text-muted)]"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span
                    className="text-[var(--text-muted)]"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}
                  >
                    DIRECTORY
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const handle = await window.showDirectoryPicker()
                          setSelectedPath(handle.name)
                          if (!newWorkspaceName.trim()) {
                            setNewWorkspaceName(handle.name)
                          }
                        } catch {
                          // user cancelled
                        }
                      }}
                      className="flex items-center gap-2 border-[3px] border-[var(--black)] bg-transparent px-3 py-2 text-[var(--text-primary)] text-xs shadow-[var(--shadow-xs)] transition-all duration-150 hover:bg-[var(--smoke)]"
                      style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
                    >
                      <IconFolderOpen size={14} />
                      BROWSE
                    </button>
                    <input
                      type="text"
                      value={selectedPath}
                      onChange={(e) => setSelectedPath(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddWorkspace()
                      }}
                      placeholder="/home/user/my-project"
                      className="flex-1 border-[3px] border-[var(--black)] bg-transparent px-3 py-2 text-[var(--text-primary)] text-xs outline-none placeholder:text-[var(--text-muted)]"
                      style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDialogOpen(false)
                      setNewWorkspaceName("")
                      setSelectedPath("")
                    }}
                  >
                    CANCEL
                  </Button>
                  <Button size="sm" onClick={handleAddWorkspace}>
                    ADD
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </SelectContent>
      </Select>
      <span
        className="text-[var(--text-primary)] tracking-[0.04em]"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
      >
        ROASTER STUDIO
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

- [ ] **Step 2: Typecheck studio**

```bash
cd packages/studio && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Start both server and studio:
```bash
# Terminal 1
cd packages/local-server && pnpm dev

# Terminal 2
cd packages/studio && pnpm dev
```

Open the Studio in the browser. Verify:
1. Workspace dropdown shows "SELECT WORKSPACE" (empty on first load)
2. Click dropdown → click "ADD WORKSPACE" → enter a name + path → click ADD → workspace appears in dropdown and is selected
3. Refresh the page → workspace still appears (persisted to `.jsonl`)
4. Select the workspace again → `lastOpenedAt` updates (check via `curl http://localhost:5002/api/workspaces`)

- [ ] **Step 4: Commit**

```bash
git add packages/studio/src/features/chat-panel/ChatHeader.tsx
git commit -m "feat: wire ChatHeader to workspace API"
```
