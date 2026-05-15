---
title: Workspace Dialog UI Improvement
date: 2026-05-15
status: approved
---

## Overview

Improve the "Add Workspace" dialog in `ChatHeader.tsx` to remove the broken BROWSE button and replace it with a clean text input flow that validates the directory path in two stages.

## Problem

The current BROWSE button calls `window.showDirectoryPicker()` which, due to browser security restrictions, cannot return an absolute filesystem path — it only exposes the folder name. The path input field is therefore disconnected from the BROWSE action, leaving the user confused about what to type.

## Solution

Remove the BROWSE button entirely. The DIRECTORY field becomes a single full-width text input. Validation happens in two stages:

### Stage 1 — Frontend (on blur)

- Empty path → show inline error: "Directory is required"
- Path does not start with `/` → show inline error: "Must be an absolute path"
- Border turns `--fire-red` on error; resets on focus

### Stage 2 — Server (on submit)

- `POST /api/workspaces` validates the path with `fs.stat` before persisting
- Path does not exist or is not a directory → return `400 { error: "Directory does not exist" }`
- Frontend already handles non-ok responses and surfaces them via `addError`

## Files Changed

| File | Change |
|------|--------|
| `packages/studio/src/features/chat-panel/ChatHeader.tsx` | Remove BROWSE button, add blur validation state, full-width path input |
| `packages/local-server/src/routes/workspaces.ts` | Add `fs.stat` check in `POST /` before creating workspace |

## UI Details

- Path input: full-width, same neo-brutal border style as name input
- Per-field inline error below the input (not the shared `addError` banner)
- `addError` banner remains for server errors (path not found, duplicate, server down)
- No new dependencies required
