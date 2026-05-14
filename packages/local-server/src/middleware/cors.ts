import { cors } from "hono/cors"
import type { AppConfig } from "../types/index.js"

export function createCorsMiddleware(config: AppConfig) {
  return cors({
    origin: config.allowedOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
}