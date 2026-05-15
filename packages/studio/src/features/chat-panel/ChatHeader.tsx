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
import { IconPlus } from "@tabler/icons-react"
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addError, setAddError] = useState("")
  const [pathError, setPathError] = useState("")

  useEffect(() => {
    fetchWorkspaces().then(setWorkspaces).catch(console.error)
  }, [])

  async function handleAddWorkspace() {
    if (isSubmitting) return
    const name = newWorkspaceName.trim() || selectedPath
    if (!name) return
    setIsSubmitting(true)
    try {
      const id = name.toLowerCase().replace(/\s+/g, "-")
      const created = await createWorkspace({ id, name, path: selectedPath || name })
      if (created) {
        setWorkspaces((prev) => [...prev.filter((w) => w.id !== id), created])
        setWorkspace(created)
        setNewWorkspaceName("")
        setSelectedPath("")
        setDialogOpen(false)
      } else {
        setAddError("A workspace with that name already exists.")
      }
    } catch {
      setAddError("Failed to add workspace. Is the server running?")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSelectWorkspace(id: string | null) {
    if (!id) return
    const found = workspaces.find((w) => w.id === id)
    if (!found) return
    setWorkspace(found)
    await touchWorkspace(id).catch(console.error)
  }

  function handlePathBlur() {
    if (!selectedPath.trim()) {
      setPathError("Directory is required")
    } else if (!selectedPath.startsWith("/")) {
      setPathError("Must be an absolute path (start with /)")
    } else {
      setPathError("")
    }
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
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) {
                setAddError("")
                setNewWorkspaceName("")
                setSelectedPath("")
                setPathError("")
              }
            }}
          >
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
                    onChange={(e) => {
                      setNewWorkspaceName(e.target.value)
                      setAddError("")
                    }}
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
                {addError && (
                  <span
                    className="text-xs text-[var(--fire-red)]"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}
                  >
                    {addError}
                  </span>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDialogOpen(false)
                      setAddError("")
                      setNewWorkspaceName("")
                      setSelectedPath("")
                      setPathError("")
                    }}
                  >
                    CANCEL
                  </Button>
                  <Button size="sm" onClick={handleAddWorkspace} disabled={isSubmitting}>
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
