# Roasting Page — Design Spec
**Date:** 2026-05-18

## Overview

Introduce the end-to-end flow from the landing page URL input to the roasting results page (`/r/[host]`). Includes client-side URL validation with a loading state on the landing page, server-side URL resolution on the destination page, and a skeleton roast page layout.

---

## 1. Landing Page Form (`/`)

### Component Split
- `app/page.tsx` remains a **server component** — calls `isChatEnabled()`, renders layout.
- Extract `<RoastForm>` as a **`"use client"` component** that owns all form interactivity.

### Behavior
1. Controlled input for the URL string.
2. On submit (button click or Enter):
   - Run `isValidUrl(value)` from `lib/url.ts`.
   - If invalid → show inline error below the input: `"That doesn't look like a valid URL"`. Do not navigate.
   - If valid → set `isLoading = true`, extract hostname via `new URL(normalizeUrl(value)).hostname`, call `router.push(/r/${host})`.
3. While `isLoading`:
   - `IconFlame` gets `animate-pulse` class.
   - Button text changes to `"Roasting..."` (desktop) / `"Roasting"` (mobile).
   - Input and button are disabled.

### Notes
- `isLoading` stays true until navigation completes (Next.js router transition).
- No API call is made from the landing page.

---

## 2. Roast Page — Server Resolution (`/r/[host]`)

### Flow
1. Page renders immediately with a **skeleton layout** (no Suspense needed — it's a server component, skeleton is static markup).
2. Server calls `resolveUrl(rawHost)`:
   - **Resolution fails** (unreachable host, invalid hostname) → render `<InvalidUrlDisplay>`.
   - **Resolved host differs from param** → `redirect(/r/${resolvedHost})` to canonical host.
   - **Success** → render `<RoastPage host={host} />` (with skeleton content for now).

### `<InvalidUrlDisplay>`
- Centered card with a flame/error icon.
- Message: `"We couldn't reach that URL."` + the raw host shown in muted text.
- Link back to `/` labeled `"Try another URL"`.

---

## 3. Roast Page Layout (`<RoastPage>`)

All content is skeleton/placeholder for now. Real data and AI roast content come in a future iteration.

### Structure (top to bottom)

#### Metadata Card
- Full-width ogImage placeholder (aspect-video skeleton block).
- Row with favicon circle placeholder + site name skeleton + URL in muted text.
- Description skeleton (2 lines).

#### Roast Content
- Section heading: `"The Roast"`.
- 3–4 paragraph-length skeleton text blocks (varying widths to look natural).

#### Metrics Strip
- Row of 3–4 score cards, each with a label skeleton and a large number placeholder.
- Labels will eventually be things like Performance, SEO, UX, Copy.

#### Chat CTA
- Full-width banner or card at the bottom.
- Heading: `"Want to go deeper?"`.
- Subtext: `"Chat with the roaster to get actionable fixes."`.
- Button: `"Start Chat"` → links to `/chat`.
- Only shown when `isChatEnabled()` is true.

---

## 4. File Changes

| File | Change |
|------|--------|
| `apps/web/app/page.tsx` | Extract `<RoastForm>`, pass `chatEnabled` prop |
| `apps/web/app/components/roast-form.tsx` | New client component (form + loading state) |
| `apps/web/app/r/[host]/page.tsx` | Add skeleton layout, `<InvalidUrlDisplay>`, `<RoastPage>` |
| `apps/web/app/r/[host]/components/invalid-url-display.tsx` | New component |
| `apps/web/app/r/[host]/components/roast-page.tsx` | New component (skeleton layout) |

---

## 5. Out of Scope

- Fetching real website metadata (og tags, favicon).
- AI roast generation.
- Real metrics scores.
- Chat session integration beyond the CTA link.
