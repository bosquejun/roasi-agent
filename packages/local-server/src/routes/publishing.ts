import { Hono } from "hono"
import { publish, getPublishStatus } from "../services/publishing.js"

export function createPublishingRouter() {
  const publishRouter = new Hono()

  publishRouter.post("/", async (c) => {
    const request = await c.req.json()
    const result = await publish(request)
    return c.json(result)
  })

  publishRouter.get("/status/:id", async (c) => {
    const id = c.req.param("id")
    const status = await getPublishStatus(id)
    if (!status) {
      return c.json({ error: "Not found" }, 404)
    }
    return c.json({ status })
  })

  return publishRouter
}