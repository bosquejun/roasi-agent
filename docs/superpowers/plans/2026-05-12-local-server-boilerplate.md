# Local Server Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `@roaster/local-server` package with Fastify + TypeScript boilerplate for studio AI integration

**Architecture:** Fastify HTTP server with REST + SSE endpoints, organized in routes/

**Tech Stack:** TypeScript, Fastify, Node.js

---

### Task 1: Create package directory and package.json

**Files:**
- Create: `packages/local-server/package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@roaster/local-server",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -b",
    "start": "node dist/index.js",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/cors": "^10.0.0"
  },
  "devDependencies": {
    "@roaster/typescript-config": "workspace:*",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/local-server/package.json
git commit -m "feat(local-server): add package.json"
```

---

### Task 2: Create tsconfig.json

**Files:**
- Create: `packages/local-server/tsconfig.json`

- [ ] **Step 1: Create tsconfig.json**

```json
{
  "extends": "@roaster/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/local-server/tsconfig.json
git commit -m "feat(local-server): add tsconfig.json"
```

---

### Task 3: Create types

**Files:**
- Create: `packages/local-server/src/lib/types.ts`

- [ ] **Step 1: Create types.ts**

```ts
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
}

export interface ChatResponse {
  content: string;
  finishReason: "stop" | "length" | "content-filter" | "tool-calls";
}

export interface ToolCall {
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolExecuteRequest {
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolExecuteResponse {
  result: unknown;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/local-server/src/lib/types.ts
git commit -m "feat(local-server): add types"
```

---

### Task 4: Create chat route

**Files:**
- Create: `packages/local-server/src/routes/chat.ts`

- [ ] **Step 1: Create chat.ts**

```ts
import type { FastifyInstance } from "fastify";
import type { ChatRequest, ChatResponse } from "../lib/types.js";

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: ChatRequest }>(
    "/chat",
    {
      schema: {
        body: {
          type: "object",
          required: ["messages"],
          properties: {
            messages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string", enum: ["user", "assistant", "system"] },
                  content: { type: "string" },
                },
              },
            },
            model: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { messages, model } = request.body;

      // TODO: Integrate AI SDK for chat completion
      const response: ChatResponse = {
        content: "AI response placeholder",
        finishReason: "stop",
      };

      return reply.send(response);
    }
  );

  // SSE endpoint for streaming chat
  fastify.post<{ Body: ChatRequest }>(
    "/chat/stream",
    {
      schema: {
        body: { $ref: "chatRequest" },
      },
    },
    async (request, reply) => {
      const { messages, model } = request.body;

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // TODO: Integrate AI SDK for streaming
      reply.raw.write(`data: ${JSON.stringify({ content: "Stream response placeholder" })}\n\n`);

      reply.raw.write("data: [DONE]\n\n");
      reply.raw.end();
    }
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/local-server/src/routes/chat.ts
git commit -m "feat(local-server): add chat routes"
```

---

### Task 5: Create tools route

**Files:**
- Create: `packages/local-server/src/routes/tools.ts`

- [ ] **Step 1: Create tools.ts**

```ts
import type { FastifyInstance } from "fastify";
import type { ToolExecuteRequest, ToolExecuteResponse } from "../lib/types.js";

const registeredTools: Record<string, (args: Record<string, unknown>) => unknown> = {
  // TODO: Register tools
};

export async function toolRoutes(fastify: FastifyInstance) {
  fastify.get("/tools", async () => {
    return { tools: Object.keys(registeredTools) };
  });

  fastify.post<{ Body: ToolExecuteRequest }>(
    "/tools/execute",
    {
      schema: {
        body: {
          type: "object",
          required: ["toolName"],
          properties: {
            toolName: { type: "string" },
            args: { type: "object" },
          },
        },
      },
    },
    async (request): Promise<ToolExecuteResponse> => {
      const { toolName, args } = request.body;

      const tool = registeredTools[toolName];
      if (!tool) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      const result = await tool(args);
      return { result };
    }
  );
}

export function registerTool(name: string, handler: (args: Record<string, unknown>) => unknown) {
  registeredTools[name] = handler;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/local-server/src/routes/tools.ts
git commit -m "feat(local-server): add tools routes"
```

---

### Task 6: Create main entry point

**Files:**
- Create: `packages/local-server/src/index.ts`

- [ ] **Step 1: Create index.ts**

```ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { chatRoutes } from "./routes/chat.js";
import { toolRoutes } from "./routes/tools.js";

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: true,
});

await fastify.register(chatRoutes);
await fastify.register(toolRoutes);

fastify.get("/health", async () => {
  return { status: "ok" };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("Server running at http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

- [ ] **Step 2: Commit**

```bash
git add packages/local-server/src/index.ts
git commit -m "feat(local-server): add main entry point"
```

---

### Task 7: Verify build and typecheck

**Files:**
- Verify: `packages/local-server/`

- [ ] **Step 1: Install dependencies**

```bash
pnpm install
```

- [ ] **Step 2: Run typecheck**

```bash
cd packages/local-server && pnpm typecheck
```

- [ ] **Step 3: Run build**

```bash
cd packages/local-server && pnpm build
```

- [ ] **Step 4: Verify server starts**

```bash
cd packages/local-server && timeout 5 pnpm dev || true
```

- [ ] **Step 5: Commit**

```bash
git add packages/local-server/
git commit -m "feat(local-server): complete boilerplate"
```

---

**Plan complete.** Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?