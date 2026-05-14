import type { Hono } from "hono"
import type { SkillMetadata } from "@roaster/ai/skills/discover-skills"
import { createChatRouter } from "./chat.js"
import { createAnalyticsRouter } from "./analytics.js"
import { createMemoryRouter } from "./memory.js"
import { createPublishingRouter } from "./publishing.js"

export function registerRoutes(app: Hono, skills: SkillMetadata[]): void {
  app.route("/api/chat", createChatRouter(skills))
  app.route("/api/analytics", createAnalyticsRouter())
  app.route("/api/memory", createMemoryRouter())
  app.route("/api/publish", createPublishingRouter())
}