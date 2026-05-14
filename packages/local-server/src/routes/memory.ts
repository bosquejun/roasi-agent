import { Hono } from "hono"
import { generateId } from "ai"
import { memoryService } from "../services/memory.js"

export function createMemoryRouter() {
  const memory = new Hono()

  memory.get("/", (c) => {
    return c.json({ memories: memoryService.list() })
  })

  memory.post("/", async (c) => {
    const { content, metadata } = await c.req.json()
    const entry = {
      id: generateId(),
      content,
      createdAt: Date.now(),
      metadata,
    }
    memoryService.set(entry)
    return c.json({ success: true, entry })
  })

  memory.get("/:id", (c) => {
    const id = c.req.param("id")
    const entry = memoryService.get(id)
    if (!entry) {
      return c.json({ error: "Not found" }, 404)
    }
    return c.json({ entry })
  })

  memory.delete("/:id", (c) => {
    const id = c.req.param("id")
    const deleted = memoryService.delete(id)
    return c.json({ success: deleted })
  })

  return memory
}