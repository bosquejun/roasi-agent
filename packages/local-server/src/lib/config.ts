import type { AppConfig } from "../types/index.js"

export function getConfig(): AppConfig {
  const allowedOrigins = process.env["ALLOWED_ORIGINS"]?.split(",")
  const port = parseInt(process.env["PORT"] || "5002", 10)

  return {
    allowedOrigins,
    port,
  }
}

export const config = getConfig()