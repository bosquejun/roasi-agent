import { mkdir, readFile, writeFile, appendFile } from "fs/promises"
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
    await appendFile(WORKSPACES_FILE, JSON.stringify(workspace) + "\n", "utf-8")
    return workspace
  },

  async update(id: string, patch: Partial<Omit<Workspace, "id">>): Promise<Workspace | undefined> {
    const all = await readAll()
    const idx = all.findIndex((w) => w.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...patch } as Workspace
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
