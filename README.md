# Roaster PH

An AI-powered website auditing tool with a personality. Roasi — an exhausted Filipino senior developer — delivers brutally honest, data-driven Lighthouse critiques with code-switching flair.

## Meet Roasi

Roasi is the AI agent at the heart of this product. She is a Filipino senior developer, four beers deep at 2am, voluntold to review yet another website at a hackathon. Exhausted, brutally honest, and completely out of patience for people who think buying a domain is the same as building a product.

**Her voice never changes.** Whether she's roasting or teaching, she stays Roasi — tired, exasperated, code-switching. She explains LCP like she cannot believe she has to. She walks through render-blocking resources while muttering under her breath. The teaching is real. The warmth is not.

**Every line she writes is data-driven.** Scores, audit failures, exact metrics — if a number isn't in the report, she doesn't invent it. Vague roasts are for people who are also bad at their jobs.

**Her code-switching is structural.** Every paragraph contains exactly one Filipino sentence or phrase — not a dropped word, but a full expression that lands like punctuation on the worst thing she just said. The expressions escalate: mild in paragraph one, nuclear by paragraph four.

**The roast is four paragraphs, no headers:**
1. React to what the site is trying to be — start mid-thought
2. Specifics — exact audit failures, exact scores, exact metrics
3. Pull back — who built this and what do they think they built
4. Find the one thing that almost worked, name it sincerely, then dismantle it

Roasi does not modify code, write files, or touch the user's codebase. She scans, analyzes, teaches, and guides.

---

## What it does

1. User submits a URL on the homepage
2. Roasi runs a multi-step audit workflow:
   - **Scan** — runs Unlighthouse (Lighthouse wrapper) against the target site
   - **Analyze** — categorizes failures by priority tier (critical → high → enhancements)
   - **Roast** — delivers a brutal but structured critique in character
   - **Guide** — provides actionable improvement recommendations per tier
3. Results stream in real time with a live report panel alongside the chat

---

## Tech Stack

### Monorepo

| Tool | Purpose |
|------|---------|
| **Turborepo** | Task orchestration, build caching |
| **pnpm** workspaces | Package management |
| **Biome** | Formatting + linting (replaces ESLint/Prettier for most tasks) |
| **TypeScript 5.9** | Shared configs via `packages/typescript-config` |

### Apps & Packages

```
roaster-ph/
├── apps/
│   ├── web/              # Next.js 16 main application
│   └── design-system/    # Vite-based component explorer
├── packages/
│   ├── ai/               # LLM agent, tools, prompts
│   ├── ui/               # Shared React components (shadcn/ui)
│   ├── sprite-animations/ # Pixi.js Roasi mascot animations
│   ├── eslint-config/    # Shared ESLint rules
│   └── typescript-config/ # Shared tsconfig presets
```

### Frontend

| Library | Version | Role |
|---------|---------|------|
| **Next.js** (App Router) | 16.1.6 | Web framework with Turbopack |
| **React** | 19.2 | UI runtime |
| **Tailwind CSS** | 4.1 | Styling |
| **shadcn/ui** (base-lyra) | — | Component primitives |
| **Pixi.js** | 8.13 | 2D sprite animations (Roasi mascot) |
| **Motion** | 12.38 | UI animations |
| **next-themes** | 0.4 | Dark/light mode |
| **Tabler Icons** | 3.44 | Icon set |

### AI / Agent

| Library | Role |
|---------|------|
| **Vercel AI SDK** (`ai` 6.x) | Agent loop, streaming, tool use |
| **@ai-sdk/mistral** | Mistral provider |
| **mistral-small-latest** | LLM model |
| **Unlighthouse** | Headless Lighthouse auditing engine |
| **Puppeteer** | Browser automation for scans |
| **bash-tool** | Sandboxed script execution for skills |
| **Zod** | Tool input schema validation |

### Rendering & Markdown

| Library | Role |
|---------|------|
| **streamdown** | Streaming markdown renderer |
| **shiki** | Syntax highlighting in code blocks |
| **ansi-to-react** | Terminal/ANSI output rendering |

---

## Architecture

### Agent Tool Loop

```
POST /api/chat
  └─ ToolLoopAgent (Vercel AI SDK)
      ├─ planTool / updateStep    — declare & track workflow steps
      ├─ scanSite                 — Unlighthouse audit (4 modes)
      ├─ analyzeScanReport        — priority-tier categorization
      ├─ memoryTool               — persistent core/notes/conversation storage
      └─ loadSkill / bash         — dynamic skill execution
```

### Roasi's Prompts

Roasi's behavior is defined in two prompt files under `packages/ai/src/agents/roasi/prompts/`:

| File | Purpose |
|------|---------|
| `PERSONALITY.md` | Voice, tone, code-switching rules, roast structure, profanity guidelines |
| `AGENT.md` | Workflow, tools, audience calibration, output format, content guard |
| `ROAST.md` | Extended roast delivery examples |

### Streaming

Responses stream via SSE (Server-Sent Events). The client uses the Vercel AI SDK `useChat` hook, and tool results render with custom per-type components as they arrive — no batching.

### Filesystem Storage

No database. All state lives on the filesystem:

```
.memory/
├── core.md                     # Facts injected into every agent turn
├── notes.md                    # Archival notes
└── conversations/
    ├── {chatId}.jsonl          # Message history (JSONL per chat)
    └── titles/{chatId}.txt     # Chat titles for sidebar

.reports/{timestamp}/           # Lighthouse HTML reports (served via /api/reports)
```

### Scan Modes

| Mode | Pages | Description |
|------|-------|-------------|
| `default` | 1 | Homepage only |
| `targeted` | Custom | Specific paths |
| `smart` | ~20 | Sitemap-guided |
| `full` | 200 | Full crawl |

SSRF protection blocks all private/local hosts and cloud metadata endpoints.

### Priority Tiers

| Tier | Examples |
|------|---------|
| 1 — Critical | is-crawlable, meta-description, LCP, CLS, TTI |
| 2 — High impact | color-contrast, image-alt, WebP images, render-blocking, unused JS/CSS |
| 3 — Enhancements | Everything else |

---

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm 9.x
- Mistral API key

### Setup

```bash
pnpm install
```

Create `apps/web/.env.local`:

```env
MISTRAL_API_KEY=your_key_here
CHAT_ENABLED=true
```

### Dev

```bash
pnpm dev
```

Opens at `http://localhost:3000`.

### Build

```bash
pnpm build
```

---

## UI Components

shadcn components are added to `packages/ui`:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Import from the shared package:

```tsx
import { Button } from "@roaster/ui/components/button";
```
