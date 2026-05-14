# Hono Server Structure Design

## Overview

Restructure the Hono server in `packages/local-server` to support growth into a production API with AI streaming, memory storage, analytics, and publishing features.

## Current State

- Single `src/index.ts` file (~145 lines)
- All routes, middleware, and logic in one file
- Basic chat endpoint at `/api/chat`

## Target Architecture

```
src/
├── index.ts              # Entry point, app creation, server startup
├── routes/
│   ├── index.ts          # Route registrations
│   ├── chat.ts           # /api/chat endpoint
│   ├── analytics.ts     # /api/analytics
│   ├── publishing.ts    # /api/publish
│   └── memory.ts        # /api/memory
├── middleware/
│   ├── cors.ts          # CORS configuration
│   └── logger.ts        # Request logging (future)
├── services/
│   ├── ai-stream.ts     # AI streaming logic & ToolLoopAgent
│   ├── memory.ts        # Memory storage operations
│   ├── analytics.ts     # Analytics tracking
│   └── publishing.ts    # Publishing service
├── lib/
│   ├── config.ts        # Environment variables & config
│   └── skills.ts        # Skills discovery & prompts
└── types/
    └── index.ts         # Shared type definitions
```

## Structure Details

### routes/
- **index.ts**: Register all routes, export app
- **chat.ts**: `/api/chat` - AI chat streaming endpoint, agent setup
- **analytics.ts**: `/api/analytics` - Analytics tracking endpoints
- **publishing.ts**: `/api/publish` - Publishing workflow endpoints
- **memory.ts**: `/api/memory` - Memory CRUD operations

### middleware/
- **cors.ts**: Reusable CORS configuration, extracted from current inline
- **logger.ts**: Request/response logging middleware (for observability)

### services/
- **ai-stream.ts**: `createUIMessageStream`, `ToolLoopAgent` config, streaming logic
- **memory.ts**: Memory read/write/delete operations
- **analytics.ts**: Analytics event tracking
- **publishing.ts**: Publishing workflows

### lib/
- **config.ts**: Centralized env var access, typed config
- **skills.ts**: Skills discovery and `buildSkillsPrompt` logic

### types/
- **index.ts**: Shared types like `UIMessage`, request/response types

## Design Principles

1. **Separation of Concerns**: Route handlers focus on HTTP, services contain business logic
2. **Dependency Direction**: Routes import services, services import lib/types
3. **Testability**: Services can be unit tested without HTTP layer
4. **Scalability**: Each feature in its own file, easy to locate and modify

## Migration Plan

1. Create `routes/`, `middleware/`, `services/`, `lib/`, `types/` directories
2. Move CORS config → `middleware/cors.ts`
3. Move env/config → `lib/config.ts`
4. Move skills logic → `lib/skills.ts`
5. Move AI streaming logic → `services/ai-stream.ts`
6. Move chat route → `routes/chat.ts`
7. Create `routes/index.ts` to register all routes
8. Update `index.ts` to use new structure

## Out of Scope

- Database integration (future)
- Authentication (future)
- WebSocket support (future)
- Testing setup (future)