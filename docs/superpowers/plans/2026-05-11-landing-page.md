# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the design-system preview page at `apps/web/app/page.tsx` with a real landing page — borderless topnav + full-viewport hero with a URL input CTA.

**Architecture:** Single file replacement. The topnav and hero are co-located in `page.tsx` as inline sections — no new components needed since everything already exists in `@roaster/ui`. The page fills 100vh with no scroll.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, `@roaster/ui` component library, `@tabler/icons-react`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `apps/web/app/page.tsx` | Full replacement — topnav + hero layout |

---

### Task 1: Replace page.tsx with topnav + hero

**Files:**
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { IconWorld } from "@tabler/icons-react"

export default function Page() {
  return (
    <div className="flex h-svh flex-col overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Topnav */}
      <header
        className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between px-4"
        style={{ background: "var(--bg-card)" }}
      >
        <span
          className="font-[family-name:var(--font-pixel)] text-[11px] tracking-widest uppercase"
          style={{ color: "var(--fire-red)" }}
        >
          Roaster<span style={{ color: "var(--fire-yellow)" }}>.PH</span>
        </span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button variant="accent" size="sm">Join Roasters</Button>
        </div>
      </header>

      {/* Hero */}
      <main className="pixel-grid-bg flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <h1
          className="font-[family-name:var(--font-pixel)] text-center text-[28px] leading-tight tracking-wider uppercase"
          style={{ color: "var(--fire-red)" }}
        >
          Your Startup is<br />Probably Trash.
        </h1>
        <p
          className="font-[family-name:var(--font-mono)] text-center text-[14px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Let&apos;s roast it.
        </p>
        <div className="w-full max-w-xl">
          <Input
            placeholder="https://yourstartup.com"
            prefix={<IconWorld className="size-5" />}
            suffix={<Button variant="primary" size="sm">Roast It</Button>}
          />
        </div>
        <p
          className="font-[family-name:var(--font-mono)] text-center text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          No signup needed. Just a URL.
        </p>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Start dev server and verify visually**

```bash
pnpm dev
```

Open `http://localhost:3000` and verify:
- Page fills full viewport with no scrollbar
- Topnav is 56px tall, no bottom border, logo left / auth buttons right
- Hero is centered, pixel headline in fire-red, mono subline, URL input below, micro-copy at bottom
- Pixel-grid texture visible on hero background

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat: add landing page with topnav and hero"
```
