# Dashboard Layout — Design Spec
**Date:** 2026-05-11  
**Package:** `@roaster/studio`

---

## Overview

A 3-pane dashboard shell for Roaster Studio. Default state is 2-pane (sidebar + chat). A third preview panel is toggled open/closed by the user, shrinking the chat panel to accommodate it.

---

## Shell Layout

Full-viewport flex row (`display: flex`, `height: 100vh`, `overflow: hidden`). Three direct children rendered left-to-right:

1. Sidebar
2. Chat panel
3. Preview panel

All width transitions use `200ms ease` — consistent with the design system's restrained animation principle. No spring, no bounce.

---

## Pane 1 — Left Sidebar

- `height: 100vh`, `overflow: hidden`, `background: var(--bg-card)`, `border-right: var(--border)`
- Transitions between `56px` (collapsed/icon-only) and `220px` (expanded) via `transition: width 200ms ease`

**Collapsed (56px):**
- Each nav item is a 56×56 square button with a centered icon
- Active item: `background: var(--fire-red)`, white icon
- Hover: lifts with `var(--shadow-xs)`, `translate(-1px, -1px)`

**Expanded (220px):**
- Each nav item shows icon + label in `var(--font-pixel)` at 8px, uppercase
- Same active/hover states as collapsed

**Nav items (top to bottom):**
| Icon | Label | Route |
|------|-------|-------|
| 📁 | PROJECTS | `/projects` |
| 📊 | METRICS | `/metrics` |
| ⚙️ | SETTINGS | `/settings` |

**Bottom-pinned:** User avatar — 32×32px square, `border: var(--border)`.

**Toggle control:** A fixed header row at the very top of the sidebar (not a nav item). Height 56px, `border-bottom: var(--border)`. Collapsed state: centered hamburger icon + pixel rooster logo hidden. Expanded state: pixel rooster logo (32px tall, `image-rendering: pixelated`) on the left, chevron-left icon on the right.

---

## Pane 2 — Chat Panel

`flex: 1`, `min-width: 0`, `display: flex`, `flex-direction: column`, `height: 100vh`.

### Header bar
- Height: 56px, `border-bottom: var(--border)`, `background: var(--bg-card)`
- Left: current project name in `var(--font-pixel)` 8px
- Right: "PREVIEW" toggle button — opens/closes the preview panel. Active state uses `var(--electric-blue)` fill.

### Message thread
- `flex: 1`, `overflow-y: auto`, `padding: 16px`
- **User messages:** right-aligned bubble, `background: var(--fire-red)`, white text, `var(--border)`, `var(--shadow-xs)`
- **AI messages:** left-aligned bubble, `background: var(--bg-card)`, `var(--border)`, `var(--shadow-xs)`. Can contain inline score badges and metric callouts using `<ScoreBar>` and `<Badge>` from `@roaster/ui`.
- Font: `var(--font-mono)` 13px for message body

### Input bar
- Fixed at bottom, `border-top: var(--border)`, `padding: 12px`
- Textarea: grows up to 4 lines, `var(--font-mono)`, `var(--border)`, `resize: none`
- Send button: `background: var(--acid-lime)`, `var(--font-pixel)` 8px, label "SEND", `var(--border)`, `var(--shadow-sm)`. Press collapses shadow + `translate(2px, 2px)`.

---

## Pane 3 — Preview Panel

- Default: `width: 0`, `overflow: hidden` (hidden)
- Open: `width: 420px`
- `transition: width 200ms ease`, `border-left: var(--border)`, `background: var(--bg-card)`
- `display: flex`, `flex-direction: column`, `height: 100vh`

### Header bar
- Height: 56px, `border-bottom: var(--border)`
- Left: label "PREVIEW" in `var(--font-pixel)` 8px
- Center: mode switcher — two toggle buttons "LIVE" / "REPORT" in `var(--font-pixel)` 8px. Active mode gets `background: var(--black)`, white text.
- Right: × close button — closes panel (sets width back to 0)

### Content area
`flex: 1`, `overflow: hidden`

**Live mode:**
- `<iframe>` filling the area, `border: none`, `width: 100%`, `height: 100%`
- Loaded URL comes from the currently active project

**Report mode:**
- Scrollable (`overflow-y: auto`, `padding: 16px`)
- Overall score badge at top — tier color, tier label, score number in `var(--font-pixel)`
- Five sub-score rows using `<ScoreBar>` component from `@roaster/ui`:
  - Design · Copy · UX/Flow · Performance · Mobile

---

## State

| State variable | Type | Default | Effect |
|---|---|---|---|
| `sidebarExpanded` | boolean | `false` | Toggles sidebar width 56px ↔ 220px |
| `previewOpen` | boolean | `false` | Toggles preview panel width 0 ↔ 420px |
| `previewMode` | `'live' \| 'report'` | `'live'` | Switches preview panel content |
| `activeNav` | `'projects' \| 'metrics' \| 'settings'` | `'projects'` | Highlights active sidebar item |

---

## Component File Structure

```
src/
  components/
    layout/
      AppShell.tsx         — flex row shell, owns sidebarExpanded + previewOpen state
      Sidebar.tsx          — left nav pane
      ChatPanel.tsx        — center chat pane
      PreviewPanel.tsx     — right preview pane
    chat/
      MessageThread.tsx    — scrollable message list
      MessageBubble.tsx    — single message (user or AI)
      ChatInput.tsx        — textarea + send button
    preview/
      LiveViewer.tsx       — iframe wrapper
      ReportViewer.tsx     — score breakdown
```

---

## Design System Tokens Used

- `var(--border)` — all hard borders
- `var(--shadow-xs)`, `var(--shadow-sm)` — hover and press effects
- `var(--bg-card)` — panel backgrounds
- `var(--fire-red)` — active nav, user message bubbles
- `var(--acid-lime)` — send button
- `var(--electric-blue)` — preview toggle active state
- `var(--font-pixel)` — all labels, buttons, headings
- `var(--font-mono)` — message body text
