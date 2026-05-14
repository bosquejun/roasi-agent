import { Hono } from "hono"
import { trackEvent, getEvents } from "../services/analytics.js"

export function createAnalyticsRouter() {
  const analytics = new Hono()

  analytics.post("/", async (c) => {
    const event = await c.req.json()
    trackEvent({
      ...event,
      timestamp: Date.now(),
    })
    return c.json({ success: true })
  })

  analytics.get("/", (c) => {
    const type = c.req.query("type")
    return c.json({ events: getEvents(type) })
  })

  return analytics
}