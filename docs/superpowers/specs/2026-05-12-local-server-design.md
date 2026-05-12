# Local Server Package Design

## Overview

Create `@roaster/local-server` — a TypeScript + Fastify package providing a local API server for studio integration with AI interaction (AI SDK).

## Architecture

```
packages/local-server/
├── src/
│   ├── index.ts        # Fastify app entry point
│   ├── routes/
│   │   ├── chat.ts     # POST /chat (REST + SSE)
│   │   └── tools.ts    # POST /tools/execute
│   └── lib/
│       └── types.ts    # shared types
├── package.json
├── tsconfig.json
└── README.md
```

## Package Config

- **Name:** `@roaster/local-server`
- **Type:** `module`
- **Runtime:** Node.js
- **Dependencies:** `fastify`, `@ai-sdk/provider`
- **DevDependencies:** `@roaster/typescript-config`, `typescript`

## Routes

### POST /chat
- **Request:** `{ messages: Message[], model?: string }`
- **Response:** Streamed AI response via SSE or JSON
- **Content-Type:** `text/event-stream` or `application/json`

### POST /tools/execute
- **Request:** `{ toolName: string, args: Record<string, unknown> }`
- **Response:** `{ result: unknown }` or error

## Implementation Notes

- Use Fastify with `@fastify/cors` for dev
- Share `@roaster/typescript-config`
- Follow workspace protocol for monorepo deps
- Minimal boilerplate — user will add AI SDK logic