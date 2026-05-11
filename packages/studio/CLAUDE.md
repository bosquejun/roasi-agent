# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# From packages/studio
pnpm dev          # Start Vite dev server
pnpm build        # tsc type-check + Vite build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit only

# From monorepo root (runs across all packages via Turbo)
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

## Architecture

**`@roaster/studio`** is a React 19 + Vite SPA inside the `roaster-ph` pnpm/Turbo monorepo. It is currently a greenfield application — `src/App.tsx` is a placeholder.

### Monorepo packages

- `packages/studio` — this app
- `packages/ui` — shared component library (`@roaster/ui`); exports components, hooks, lib utilities, and global CSS
- `packages/eslint-config` — shared ESLint config
- `packages/typescript-config` — shared TypeScript config
- `apps/web` — Next.js web app
- `apps/design-system` — design system showcase

### `@roaster/ui` exports

Import paths follow the package's `exports` map:

```ts
import { Button } from "@roaster/ui/components/button"
import { cn } from "@roaster/ui/lib/utils"
import "@roaster/ui/globals.css"
```

Components use **Tailwind CSS v4**, **shadcn/ui** patterns, **Base UI React** for unstyled primitives, and **Motion** (`motion` package) for animations. Use `cn()` from `@roaster/ui/lib/utils` for class merging.

## UI/UX Design

Always consult `apps/design-system/DESIGN.md` before building any UI. Key rules:

**Aesthetic:** Neo-brutal × pixel-native — thick black borders (`var(--border)`), hard offset shadows (zero blur), zero border-radius by default, warm cream backgrounds.

**Fonts:** Two only — `var(--font-pixel)` (Press Start 2P) for headings/labels/scores, `var(--font-mono)` (Space Mono) for body/metadata. Never use pixel font for long text.

**Colors:** Use CSS tokens from `tokens.css`. Primary brand = fire palette (`--fire-red`, `--fire-orange`, `--fire-yellow`). Neutral base = cream/smoke/ash scale. Accent pops: `--acid-lime` (success), `--electric-blue` (info), `--hot-pink` (social).

**Shadows:** Hard offset, no blur — `var(--shadow-sm)` through `var(--shadow-2xl)`. Hover lifts shadow one step + `translate(-2px, -2px)`. Press collapses shadow + `translate(4px, 4px)`.

**Animation:** Restrained — hover `150ms`, press `80ms`, focus `120ms`. No spring, no shimmer, no bounce.

**Dark mode:** `data-theme="dark"` on `<html>`. Shadows flip to `#E8E0C4`, three dark surface layers, text goes warm cream.

**Copy/voice:** Direct, verb-first, no hedging. Uppercase tags, Title Case headers. Emoji only for score tier icons.

## Code Style

Formatting is enforced by **Biome** (root `biome.json`):
- Double quotes, no semicolons (as-needed), trailing commas (ES5)
- 2-space indent, 80-char line width, LF
- Unused imports/variables are errors (auto-fixable)
- Tailwind classes must be sorted — use `cn()` or `cva()` helpers

TypeScript is strict (`strict: true`), targeting ES2020, module resolution `bundler`.
