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
