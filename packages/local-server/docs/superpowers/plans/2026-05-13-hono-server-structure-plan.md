# Hono Server Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Hono server from a single flat file into a feature-based architecture with separated routes, middleware, services, lib, and types.

**Architecture:** Feature-based structure with clear separation - routes handle HTTP, services contain business logic, lib for shared utilities, types for definitions.

**Tech Stack:** Hono, TypeScript, node-server

---

## File Structure Overview

```
src/
├── index.ts              # Entry point (keep minimal)
├── routes/
│   ├── index.ts          # Route registrations (create)
│   ├── chat.ts           # /api/chat (migrate)
│   ├── analytics.ts      # /api/analytics (create placeholder)
│   ├── publishing.ts     # /api/publish (create placeholder)
│   └── memory.ts         # /api/memory (create placeholder)
├── middleware/
│   ├── cors.ts           # CORS config (create)
│   └── logger.ts         # Request logger (create placeholder)
├── services/
│   ├── ai-stream.ts      # AI streaming (create)
│   ├── memory.ts         # Memory service (create placeholder)
│   ├── analytics.ts      # Analytics service (create placeholder)
│   └── publishing.ts     # Publishing service (create placeholder)
├── lib/
│   ├── config.ts         # Env config (create)
│   └── skills.ts         # Skills discovery (create)
└── types/
    └── index.ts          # Shared types (create)
```

---

### Task 1: Create Directory Structure

**Files:**
- Create: `packages/local-server/src/routes/`
- Create: `packages/local-server/src/middleware/`
- Create: `packages/local-server/src/services/`
- Create: `packages/local-server/src/lib/`
- Create: `packages/local-server/src/types/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p src/routes src/middleware src/services src/lib src/types
```

---

### Task 2: Create types/index.ts

**Files:**
- Create: `packages/local-server/src/types/index.ts`

- [ ] **Step 1: Create types file**

```typescript
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
```

---

### Task 3: Create lib/config.ts

**Files:**
- Create: `packages/local-server/src/lib/config.ts`

- [ ] **Step 1: Create config file**

```typescript
import { getEnv } from "@roaster/ai/lib/env"
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
```

---

### Task 4: Create lib/skills.ts

**Files:**
- Create: `packages/local-server/src/lib/skills.ts`

- [ ] **Step 1: Create skills discovery file**

```typescript
import { discoverSkills } from "@roaster/ai"
import { buildSkillsPrompt } from "@roaster/ai/skills/skills-prompt"
import type { Skill } from "@roaster/ai/skills/types"

export async function loadSkills(): Promise<Skill[]> {
  const skills = await discoverSkills()
  return skills
}

export function buildInstructions(skills: Skill[]): string {
  return `
You are Roaster, a website quality analyst.

When a user asks to analyze, roast, audit, or get feedback on a website:
1. Call scanSite with the URL — wait for the outputPath
2. Call analyzeResults with that outputPath — get the structured report
3. Reason over the report and deliver findings in your persona

If scanSite returns an error, explain the issue to the user with the exact error message and suggest the fix.

${buildSkillsPrompt(skills)}
`.trim()
}
```

---

### Task 5: Create middleware/cors.ts

**Files:**
- Create: `packages/local-server/src/middleware/cors.ts`

- [ ] **Step 1: Create CORS middleware**

```typescript
import { cors } from "hono/cors"
import type { AppConfig } from "../types/index.js"

export function createCorsMiddleware(config: AppConfig) {
  return cors({
    origin: config.allowedOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
}
```

---

### Task 6: Create middleware/logger.ts

**Files:**
- Create: `packages/local-server/src/middleware/logger.ts`

- [ ] **Step 1: Create logger middleware**

```typescript
import type { MiddlewareHandler } from "hono"

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  console.log(`${c.req.method} ${c.req.path} - ${c.res.status} - ${duration}ms`)
}
```

---

### Task 7: Create services/ai-stream.ts

**Files:**
- Create: `packages/local-server/src/services/ai-stream.ts`

- [ ] **Step 1: Create AI stream service**

```typescript
import { mistral } from "@ai-sdk/mistral"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  stepCountIs,
  ToolLoopAgent,
  tool,
} from "ai"
import {
  bashTool,
  callOptionsSchema,
  createSandbox,
  readFileTool,
} from "@roaster/ai/tools/basic-tools"
import { loadSkillTool } from "@roaster/ai/tools/load-skill-tool"
import type { Skill } from "@roaster/ai/skills/types"
import type { UIMessage } from "ai"
import { buildSkillsPrompt } from "@roaster/ai/skills/prompts/skills-prompt"
import type { Sandbox } from "@roaster/ai"

const model = mistral("mistral-large-2512")

export const tools = {
  loadSkill: loadSkillTool,
  readFile: readFileTool,
  bash: bashTool,
}

export function createAgentStream(skills: Skill[], instructions: string) {
  return createUIMessageStream({
    execute: async ({ writer }) => {
      const sandbox = createSandbox({ workingDirectory: process.cwd() })

      const agent = new ToolLoopAgent({
        model,
        tools,
        callOptionsSchema,
        instructions,
        stopWhen: stepCountIs(5),
        prepareCall: ({ options, ...settings }) => ({
          ...settings,
          instructions: `${settings.instructions}\n\n${buildSkillsPrompt(options.skills)}`,
          experimental_context: {
            sandbox: options.sandbox,
            skills: options.skills,
          },
        }),
        onStepFinish({ usage }) {
          console.log({ usage })
        },
      })

      const result = await agent.stream({
        messages: [],
        options: {
          sandbox,
          skills,
        },
      })

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
          onError: (error) => {
            return error instanceof Error ? error.message : String(error)
          },
          originalMessages: [],
          generateMessageId: generateId,
        })
      )
    },
  })
}

export async function processChatStream(
  messages: UIMessage[],
  skills: Skill[],
  instructions: string
) {
  const modelMessages = await convertToModelMessages(messages)
  const sandbox = createSandbox({ workingDirectory: process.cwd() })

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const agent = new ToolLoopAgent({
        model,
        tools,
        callOptionsSchema,
        instructions,
        stopWhen: stepCountIs(5),
        prepareCall: ({ options, ...settings }) => ({
          ...settings,
          instructions: `${settings.instructions}\n\n${buildSkillsPrompt(options.skills)}`,
          experimental_context: {
            sandbox: options.sandbox,
            skills: options.skills,
          },
        }),
        onStepFinish({ usage }) {
          console.log({ usage })
        },
      })

      const result = await agent.stream({
        messages: modelMessages,
        options: {
          sandbox,
          skills,
        },
      })

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
          onError: (error) => {
            return error instanceof Error ? error.message : String(error)
          },
          originalMessages: messages,
          generateMessageId: generateId,
        })
      )
    },
  })

  return createUIMessageStreamResponse({ stream })
}
```

---

### Task 8: Create services/memory.ts

**Files:**
- Create: `packages/local-server/src/services/memory.ts`

- [ ] **Step 1: Create memory service**

```typescript
import type { MemoryEntry } from "../types/index.js"

const memoryStore: Map<string, MemoryEntry> = new Map()

export function createMemoryStore() {
  return {
    get: (id: string): MemoryEntry | undefined => memoryStore.get(id),
    set: (entry: MemoryEntry): void => {
      memoryStore.set(entry.id, entry)
    },
    delete: (id: string): boolean => memoryStore.delete(id),
    list: (): MemoryEntry[] => Array.from(memoryStore.values()),
    clear: (): void => memoryStore.clear(),
  }
}

export const memoryService = createMemoryStore()
```

---

### Task 9: Create services/analytics.ts

**Files:**
- Create: `packages/local-server/src/services/analytics.ts`

- [ ] **Step 1: Create analytics service**

```typescript
import type { AnalyticsEvent } from "../types/index.js"

const analyticsEvents: AnalyticsEvent[] = []

export function trackEvent(event: AnalyticsEvent): void {
  analyticsEvents.push(event)
}

export function getEvents(type?: string): AnalyticsEvent[] {
  if (type) {
    return analyticsEvents.filter((e) => e.type === type)
  }
  return analyticsEvents
}

export function clearEvents(): void {
  analyticsEvents.length = 0
}
```

---

### Task 10: Create services/publishing.ts

**Files:**
- Create: `packages/local-server/src/services/publishing.ts`

- [ ] **Step 1: Create publishing service**

```typescript
import type { PublishRequest } from "../types/index.js"

export type PublishResult = {
  success: boolean
  target: string
  publishedAt: number
  url?: string
  error?: string
}

export async function publish(request: PublishRequest): Promise<PublishResult> {
  console.log(`Publishing to ${request.target}...`)

  return {
    success: true,
    target: request.target,
    publishedAt: Date.now(),
    url: `https://${request.target}/published`,
  }
}

export async function getPublishStatus(id: string): Promise<PublishResult | null> {
  return null
}
```

---

### Task 11: Create routes/chat.ts

**Files:**
- Create: `packages/local-server/src/routes/chat.ts`

- [ ] **Step 1: Create chat route**

```typescript
import { Hono } from "hono"
import type { UIMessage } from "ai"
import type { ChatRequest } from "../types/index.js"
import type { Skill } from "@roaster/ai/skills/types"
import { processChatStream } from "../services/ai-stream.js"
import { buildInstructions } from "../lib/skills.js"

export function createChatRouter(skills: Skill[]) {
  const chat = new Hono()

  const instructions = buildInstructions(skills)

  chat.post("/", async (c) => {
    const { messages } = await c.req.json<ChatRequest>()

    const stream = await processChatStream(messages, skills, instructions)

    return stream
  })

  return chat
}
```

---

### Task 12: Create routes/analytics.ts

**Files:**
- Create: `packages/local-server/src/routes/analytics.ts`

- [ ] **Step 1: Create analytics route**

```typescript
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
```

---

### Task 13: Create routes/memory.ts

**Files:**
- Create: `packages/local-server/src/routes/memory.ts`

- [ ] **Step 1: Create memory route**

```typescript
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
```

---

### Task 14: Create routes/publishing.ts

**Files:**
- Create: `packages/local-server/src/routes/publishing.ts`

- [ ] **Step 1: Create publishing route**

```typescript
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
```

---

### Task 15: Create routes/index.ts

**Files:**
- Create: `packages/local-server/src/routes/index.ts`

- [ ] **Step 1: Create routes index**

```typescript
import type { Hono } from "hono"
import type { Skill } from "@roaster/ai/skills/types"
import { createChatRouter } from "./chat.js"
import { createAnalyticsRouter } from "./analytics.js"
import { createMemoryRouter } from "./memory.js"
import { createPublishingRouter } from "./publishing.js"

export function registerRoutes(app: Hono, skills: Skill[]): void {
  app.route("/api/chat", createChatRouter(skills))
  app.route("/api/analytics", createAnalyticsRouter())
  app.route("/api/memory", createMemoryRouter())
  app.route("/api/publish", createPublishingRouter())
}
```

---

### Task 16: Refactor index.ts

**Files:**
- Modify: `packages/local-server/src/index.ts`

- [ ] **Step 1: Rewrite index.ts to use new structure**

```typescript
import "dotenv/config"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { loadSkills } from "./lib/skills.js"
import { config } from "./lib/config.js"
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
```

---

### Task 17: Verify Build

**Files:**
- Test: `packages/local-server/`

- [ ] **Step 1: Run build to verify compilation**

```bash
cd packages/local-server && pnpm build
```

Expected: Successful compilation

- [ ] **Step 2: Run dev server to verify startup**

```bash
cd packages/local-server && pnpm dev
```

Expected: Server starts on port 5002

---

## Execution Choice

**Plan complete and saved to `packages/local-server/docs/superpowers/plans/2026-05-13-hono-server-structure-plan.md`. Two execution options:**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?