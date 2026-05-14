import type { UIMessage } from "ai"

export type AppConfig = {
  allowedOrigins: string[] | undefined
  port: number
}

export type ChatRequest = {
  messages: UIMessage[]
}

export type AnalyticsEvent = {
  type: string
  timestamp: number
  data: Record<string, unknown>
}

export type MemoryEntry = {
  id: string
  content: string
  createdAt: number
  metadata?: Record<string, unknown>
}

export type PublishRequest = {
  target: string
  content: string
  options?: Record<string, unknown>
}
