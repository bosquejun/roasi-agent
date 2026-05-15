import { Hono } from "hono"
import { stat } from "node:fs/promises"
import { resolve } from "node:path"
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
    if (!body.id || !body.name || !body.path || typeof body.path !== "string") {
      return c.json({ error: "id, name, and path are required" }, 400)
    }

    const resolvedPath = resolve(body.path)

    try {
      const info = await stat(resolvedPath)
      if (!info.isDirectory()) {
        return c.json({ error: "Path is not a directory" }, 400)
      }
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code
      if (code === "ENOENT") {
        return c.json({ error: "Directory does not exist" }, 400)
      }
      if (code === "EACCES") {
        return c.json({ error: "Permission denied reading path" }, 403)
      }
      return c.json({ error: "Could not access path" }, 500)
    }

    const workspace: Workspace = {
      id: body.id,
      name: body.name,
      path: resolvedPath,
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
