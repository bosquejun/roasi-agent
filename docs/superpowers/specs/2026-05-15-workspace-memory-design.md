# Workspace Memory & API Design

**Date:** 2026-05-15  
**Status:** Approved

## Summary

Add persistent workspace storage using a `.jsonl` file and Hono API endpoints, then wire up the existing Studio UI (`ChatHeader.tsx`) to read and write from the API instead of ephemeral component state.

## Data Shape

File: `/packages/local-server/.memory/workspaces.jsonl`  
Format: One JSON object per line (newline-delimited JSON).

```json
{"id": "my-project", "name": "My Project", "path": "/home/user/my-project", "lastOpenedAt": "2026-05-15T10:00:00.000Z"}
```

**Fields:**
- `id` — kebab-case slug derived from name (matches existing UI generation logic)
- `name` — display name
- `path` — absolute directory path (from File System Access API picker)
- `lastOpenedAt` — ISO 8601 timestamp; updated every time the workspace is selected

No workspace limit for now.

## API Endpoints

New file: `/packages/local-server/src/routes/workspaces.ts`  
Registered in: `/packages/local-server/src/routes/index.ts`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/workspaces` | List all workspaces |
| `POST` | `/api/workspaces` | Create a new workspace |
| `GET` | `/api/workspaces/:id` | Get a single workspace by id |
| `PATCH` | `/api/workspaces/:id` | Update fields (name, path, or lastOpenedAt) |
| `DELETE` | `/api/workspaces/:id` | Delete a workspace |

**Request/Response shapes:**

`POST /api/workspaces` body:
```json
{ "id": "my-project", "name": "My Project", "path": "/home/user/my-project" }
```

`PATCH /api/workspaces/:id` body (partial update):
```json
{ "lastOpenedAt": "2026-05-15T10:00:00.000Z" }
```

All endpoints return JSON. Errors return `{ "error": "message" }` with appropriate HTTP status codes (400 for bad input, 404 for not found, 409 for duplicate id on create).

## File Storage Implementation

Follow the existing pattern in `packages/ai/src/tools/memory/memory-tool.ts`:

- Read: parse all lines from `workspaces.jsonl`, filter blank lines
- Write (create): append a new line
- Write (update/delete): rewrite the full file with the modified array
- File path resolved relative to `local-server` package root, under `.memory/`

## Frontend Integration

File: `/packages/studio/src/features/chat-panel/ChatHeader.tsx`

Replace ephemeral React state with API-backed state:

- **On mount:** `GET /api/workspaces` → populate `workspaces` state
- **On "ADD WORKSPACE" submit:** `POST /api/workspaces` → refresh list
- **On workspace select:** `PATCH /api/workspaces/:id` with `{ lastOpenedAt: new Date().toISOString() }` → update selected state locally
- **Local state:** Keep `workspaces` as a `useState` array — seed from API, sync writes back to API

## Error Handling

- If `.memory/workspaces.jsonl` does not exist, treat as empty list (create on first write)
- Duplicate `id` on `POST` returns 409
- Unknown `id` on `GET`/`PATCH`/`DELETE` returns 404
- Network errors in the UI are caught and surfaced as toast/console errors (non-blocking)

## Out of Scope

- Workspace limits
- Workspace-level config or associated skills
- Description field
- Authentication/authorization
