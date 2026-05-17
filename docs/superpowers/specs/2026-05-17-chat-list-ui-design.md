# Chat List History Sidebar UI Improvements

**Date:** 2026-05-17  
**File:** `apps/web/app/chat/_components/Sidebar.tsx`

## Goal

Improve the chat list history in the `/chat` sidebar with active state indication, date group labels, hover feedback, and minor polish — all aligned with the existing neo-brutal design system.

## Design Decisions

### Active State (Section 1)

- **Active item:** `bg-[var(--black)] text-[var(--white)]` with `border-[3px] border-[var(--black)]`  
  — matches the PreviewPanel tab active state pattern exactly
- **Inactive hover:** `hover:bg-[var(--cream-100)]` — subtle cream tint
- **Text color:** active items use `--white`; inactive use `--text-muted` (as today)
- **Delete button:** retains `group-hover:block` behavior; icon color stays `hover:text-[var(--fire-red)]` — visible against black bg when active
- **Transitions:** `transition-colors duration-150` on each item for smoothness
- **Active detection:** `currentChatId === chat.id` (prop already passed to Sidebar, just unused for styling)

### Date Group Labels (Section 2)

Chats are bucketed into three groups based on `updatedAt`:

| Group | Condition |
|-------|-----------|
| Today | `updatedAt` is today's date |
| Yesterday | `updatedAt` is yesterday |
| Older | everything else |

- Groups with zero chats are omitted
- Grouping computed via `useMemo` inside `Sidebar.tsx` — no new component needed
- Label styling: uppercase mono, `--text-2xs` (8px), `--text-muted` color, `px-2 pt-3 pb-1` spacing
- No border or background on the label — text only

### Misc Polish (Section 3)

- **New Chat button separator:** `border-b-[3px] border-[var(--black)]` between the button area and the chat list (currently `flex flex-col gap-2 p-3` wraps the button — add border to that container)
- **Empty state:** when `chats.length === 0`, show `NO CHATS YET` in `--text-2xs` mono, `--text-muted`, centered in the list area
- **Scrollable list:** confirm `overflow-y-auto` on the list container (already present at line 90) — no change needed
- **Compact spacing:** keep `py-2` on items (no change from current)

## Design System Alignment

| Token | Usage |
|-------|-------|
| `--black` | Active bg, active border |
| `--white` | Active text |
| `--cream-100` | Hover bg |
| `--text-muted` | Inactive text, group labels |
| `--text-2xs` | Group label font size (8px) |
| `--font-mono` | All sidebar text (unchanged) |
| `--fire-red` | Delete icon hover color (unchanged) |
| `border-[3px]` | Border width (unchanged) |
| `transition-colors duration-150` | State transition (matches button component) |

## Implementation Scope

Single file change: `apps/web/app/chat/_components/Sidebar.tsx`

- Add `useMemo` import
- Add date-bucketing helper (inline or small pure function in same file)
- Replace `chats.map()` with grouped render
- Apply active/hover classes conditionally
- Add border-bottom to New Chat button container
- Add empty state
