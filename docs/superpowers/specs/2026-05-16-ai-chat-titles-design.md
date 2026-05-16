# AI-Generated Chat Titles Design

**Date:** 2026-05-16  
**Status:** Approved

## Overview

When a user starts a new chat, generate a short 3–6 word title using the AI model and surface it in both the chat header and the sidebar history list.

## Trigger

Title generation fires on the **first user message** of a new chat (i.e., `history` is empty when the route handler runs). It runs inside `createUIMessageStream`'s `execute` function, before `ToolLoopAgent` is instantiated.

## Title Generation

In `apps/web/app/api/chat/service.ts`:

- `createChatStream` receives two new parameters: `chatId: string` and `isNewChat: boolean`
- When `isNewChat` is true, call `generateText({ model, prompt })` with the first user message to produce a 3–6 word title
- Fallback: if `generateText` throws, truncate the first user message to 40 characters
- Write the title to the UI stream immediately via:
  ```ts
  writer.write({
    type: 'start',
    messageMetadata: { title: text.trim() }
  })
  ```
- Persist the title to the conversation's JSONL file via `writeChatTitle(chatId, title)`

## Storage

In `packages/ai/src/tools/memory/memory-tool.ts`, two new exported functions:

- **`writeChatTitle(chatId, title)`** — appends `{ type: 'chat-meta', title, createdAt }` as a JSONL line. `readConversations` already skips non-`role+parts` entries so no change needed there.
- **`readChatTitle(chatId)`** — reads the JSONL file and returns the title from the `chat-meta` entry, or `null` if not found.

## Chat List API

New route: `GET /api/chats`

- Reads all files in `.memory/conversations/`
- For each file, extracts `chatId` from the filename, calls `readChatTitle(chatId)`, uses file `mtime` as `updatedAt`
- Returns `{ id: string, title: string, updatedAt: string }[]` sorted newest-first
- If no title exists, falls back to the chatId as display label

## Sidebar

File: `apps/web/app/chat/_components/Sidebar.tsx`

- Replaces hardcoded mock data with a `fetch('/api/chats')` call on mount
- Re-fetches when `chatId` in the URL changes (via `useEffect` watching the router's current `chatId` param)

## Chat Header

File: `apps/web/app/chat/_components/chat-panel/ChatHeader.tsx`

- For **new chats**: reads `metadata.title` from the current streaming message object in `useChat`'s `messages` array (set by `messageMetadata` in the stream) and displays it once available
- For **existing chats** (page reload): fetches from `/api/chats` and finds the matching entry by `chatId`

## Error Handling

- `generateText` failure → fall back to truncated first user message (40 chars)
- `/api/chats` read failure → sidebar shows empty state gracefully
- Missing title in header → header remains static ("ROASTER STUDIO") until title resolves

## Out of Scope

- Editing titles manually
- Re-generating titles after the first message
- Streaming the title character-by-character (short titles make this unnecessary)
