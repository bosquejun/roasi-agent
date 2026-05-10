# Landing Page Design — Roaster.ph

**Date:** 2026-05-11  
**Route:** `apps/web/app/page.tsx`  
**Scope:** Topnav + Hero only. Single viewport, no scroll.

---

## Overview

Replace the current design-system preview page with a real landing page. The page consists of two sections: a borderless topnav and a full-bleed hero. The entire page fits within one viewport — no scroll.

---

## Topnav

- **Height:** 56px, sticky
- **Background:** `var(--bg-card)`
- **Border:** none (explicitly no bottom border — departs from standard nav pattern)
- **Left:** Roaster.ph pixel logo, 32px tall, `image-rendering: pixelated`, 16px from edge
- **Right (16px from edge):** Two actions in a row
  - `Sign In` — ghost button variant
  - `Join Roasters` — accent button variant (acid lime)

---

## Hero Section

- **Height:** `calc(100vh - 56px)`
- **Background:** `pixel-grid-bg` utility class (8×8 dot pattern on `--cream`)
- **Layout:** Flex column, centered vertically and horizontally

### Content (top to bottom)

1. **Headline**
   - Text: `"YOUR STARTUP IS PROBABLY TRASH."`
   - Font: `--font-pixel`, `--text-3xl` (32px)
   - Color: `--fire-red`
   - Max 2 lines, centered, uppercase

2. **Subline**
   - Text: `"Let's roast it."`
   - Font: `--font-mono`, 14px
   - Color: `--text-secondary`
   - Centered, one line

3. **URL Input**
   - Component: existing `Input` from `@roaster/ui`
   - Prefix: `🌐` globe icon (`IconWorld` from `@tabler/icons-react`)
   - Suffix: `Roast It` primary button
   - Placeholder: `https://yourstartup.com`
   - Max width: `max-w-xl` (~576px), centered

4. **Micro-copy**
   - Text: `"No signup needed. Just a URL."`
   - Font: `--font-mono`, 11px
   - Color: `--text-muted`
   - Centered, below input

---

## Components Used

All from existing `@roaster/ui` package — no new components needed.

- `Button` (ghost, accent, primary variants)
- `Input` (with prefix + suffix)
- `IconWorld` from `@tabler/icons-react`

---

## What This Is Not

- No nav links (topnav is logo + auth actions only)
- No scroll — hero is the only content section
- No social proof, testimonials, or secondary CTAs
- No RoastCard feed on this page

---

## Files Affected

- `apps/web/app/page.tsx` — full replacement
