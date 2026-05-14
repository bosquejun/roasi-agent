import "dotenv/config"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { config } from "./lib/config.js"
import { loadSkills } from "./lib/skills.js"
import { createCorsMiddleware } from "./middleware/cors.js"
import { logger } from "./middleware/logger.js"
import { registerRoutes } from "./routes/index.js"

async function main() {
  const app = new Hono()

  app.use("*", createCorsMiddleware(config))
  app.use(logger)

  const skills = await loadSkills()

  registerRoutes(app, skills)

  app.get("/", (c) => {
    return c.text("Hello Hono!")
  })

  serve(
    {
      fetch: app.fetch,
      port: config.port,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`)
    }
  )
}

main()
