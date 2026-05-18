# Roasting Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add URL validation + loading state on the landing page and a skeleton roast results page at `/r/[host]` with metadata card, roast content, metrics, and chat CTA.

**Architecture:** Extract a `<RoastForm>` client component for the landing page form interaction; keep `page.tsx` a server component. The `/r/[host]` page stays server-side, wraps `resolveUrl()` in try/catch, and renders either `<InvalidUrlDisplay>` or `<RoastPage>` (skeleton). No API routes needed.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS 4, `@roaster/ui` component library, `@tabler/icons-react`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `apps/web/app/components/roast-form.tsx` | Create | Client component: controlled input, validation, loading state, navigation |
| `apps/web/app/page.tsx` | Modify | Pass `chatEnabled` to `<RoastForm>`, remove inline form markup |
| `apps/web/app/r/[host]/components/invalid-url-display.tsx` | Create | Error UI shown when URL cannot be resolved |
| `apps/web/app/r/[host]/components/roast-page.tsx` | Create | Skeleton layout: metadata card, roast paragraphs, metrics, chat CTA |
| `apps/web/app/r/[host]/page.tsx` | Modify | Try/catch around `resolveUrl`, render error or skeleton |

---

## Task 1: Create `<RoastForm>` client component

**Files:**
- Create: `apps/web/app/components/roast-form.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { cn } from "@roaster/ui/lib/utils"
import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { IconFlame, IconWorld } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { isValidUrl, normalizeUrl } from "@/lib/url"

interface RoastFormProps {
  chatEnabled: boolean
}

export function RoastForm({ chatEnabled }: RoastFormProps) {
  const router = useRouter()
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit() {
    if (!value.trim()) {
      setError("Enter a URL to get roasted")
      return
    }
    if (!isValidUrl(value)) {
      setError("That doesn't look like a valid URL")
      return
    }
    setError("")
    setIsLoading(true)
    const normalized = normalizeUrl(value)
    const host = new URL(normalized).hostname
    router.push(`/r/${host}`)
  }

  return (
    <div className="z-10 w-full max-w-xl">
      <Input
        placeholder="https://your-sh*t.com"
        prefix={<IconWorld className="size-4 md:size-5" />}
        suffix={
          chatEnabled ? (
            <Button
              variant="danger"
              size="sm"
              className="text-[9px] text-white md:text-[10px]"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              <IconFlame
                className={cn("size-4 md:size-5", isLoading && "animate-pulse")}
              />
              {isLoading ? (
                <>
                  <span className="hidden sm:inline">Roasting...</span>
                  <span className="sm:hidden">Roasting</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Get Roasted</span>
                  <span className="sm:hidden">Roast</span>
                </>
              )}
            </Button>
          ) : undefined
        }
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          if (error) setError("")
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit()
        }}
        disabled={isLoading}
        error={!!error}
        errorText={error}
        className="text-sm md:text-base"
      />
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run from `apps/web/`:
```bash
pnpm typecheck
```
Expected: no errors related to `roast-form.tsx`

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/roast-form.tsx
git commit -m "feat(landing): add RoastForm client component with validation and loading state"
```

---

## Task 2: Update landing page to use `<RoastForm>`

**Files:**
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Replace inline form markup**

Replace the contents of `apps/web/app/page.tsx` with:

```tsx
import { RoasiAnimation } from "@roaster/sprite-animations/components/roasi/RoasiAnimation"
import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import { TypingAnimation } from "@roaster/ui/components/typing-animation"
import TopNav from "@/components/shared/topnav"
import { RoastForm } from "@/app/components/roast-form"
import { isChatEnabled } from "@/lib/features"

export default function Page() {
  const chatEnabled = isChatEnabled()

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <BackgroundRippleEffect rows={17} cellSize={32} cols={72} />
      <TopNav />

      <main className="mt-24 flex flex-1 flex-col items-center justify-start gap-4 px-3 md:mt-52 md:gap-6 md:px-4">
        <h1 className="z-10 mx-auto mb-6 max-w-4xl text-center font-bold text-2xl uppercase leading-[1.3] md:mb-8 md:text-4xl md:leading-[1.15] md:leading-[1.1] lg:text-5xl">
          Your{" "}
          <TypingAnimation
            loop
            words={["Startup", "Portfolio"]}
            pauseDelay={7000}
            className="h-12 text-fire-orange"
          />{" "}
          is probably <span className="text-fire-red">trash</span>. Let&apos;s{" "}
          <span className="text-fire-yellow">fix</span> it.
        </h1>
        <RoastForm chatEnabled={chatEnabled} />
        <p className="text-center font-mono text-[10px] text-slate md:text-xs">
          No signup needed. Just a URL.
        </p>
      </main>

      <RoasiAnimation className="fixed inset-0 -z-[9999]" />
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors

- [ ] **Step 3: Smoke-test in browser**

```bash
pnpm dev
```

Open `http://localhost:3000`. Verify:
- Input is focusable and accepts text
- Typing a bad URL (e.g. `not-a-url!`) and clicking "Get Roasted" shows `"That doesn't look like a valid URL"` below the input
- Typing a valid URL (e.g. `google.com`) and clicking shows the pulsing flame + "Roasting..." text and navigates to `/r/google.com`
- Pressing Enter also submits

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat(landing): use RoastForm component, remove inline form markup"
```

---

## Task 3: Create `<InvalidUrlDisplay>` component

**Files:**
- Create: `apps/web/app/r/[host]/components/invalid-url-display.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Link from "next/link"
import { buttonVariants } from "@roaster/ui/components/button"
import { IconFlame } from "@tabler/icons-react"

interface InvalidUrlDisplayProps {
  host: string
}

export function InvalidUrlDisplay({ host }: InvalidUrlDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center px-4">
      <IconFlame className="size-16 text-fire-red" />
      <div className="flex flex-col gap-2">
        <h2 className="font-pixel text-xl uppercase text-fire-red">URL Not Found</h2>
        <p className="font-mono text-sm text-slate">
          We couldn&apos;t reach that URL.
        </p>
        <p className="font-mono text-xs text-stone">{host}</p>
      </div>
      <Link href="/" className={buttonVariants({ variant: "danger", size: "md" })}>
        Try another URL
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/r/[host]/components/invalid-url-display.tsx
git commit -m "feat(roast): add InvalidUrlDisplay component"
```

---

## Task 4: Create `<RoastPage>` skeleton component

**Files:**
- Create: `apps/web/app/r/[host]/components/roast-page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Link from "next/link"
import { buttonVariants } from "@roaster/ui/components/button"
import { isChatEnabled } from "@/lib/features"

interface RoastPageProps {
  host: string
}

export function RoastPage({ host }: RoastPageProps) {
  const chatEnabled = isChatEnabled()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 flex flex-col gap-10">
      {/* Metadata Card */}
      <div className="border-[3px] border-foreground shadow-neo-md bg-card p-6 flex flex-col gap-4">
        {/* ogImage placeholder */}
        <div className="aspect-video w-full bg-smoke animate-pulse rounded-sm" />
        {/* Favicon + name + URL row */}
        <div className="flex items-center gap-3">
          <div className="size-8 shrink-0 rounded-full bg-smoke animate-pulse" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-4 w-32 bg-smoke animate-pulse rounded-sm" />
            <div className="h-3 w-48 bg-smoke animate-pulse rounded-sm" />
          </div>
        </div>
        {/* Description */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full bg-smoke animate-pulse rounded-sm" />
          <div className="h-3 w-4/5 bg-smoke animate-pulse rounded-sm" />
        </div>
      </div>

      {/* Roast Content */}
      <div className="flex flex-col gap-6">
        <h2 className="font-pixel text-lg uppercase text-fire-red">The Roast</h2>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-3 w-full bg-smoke animate-pulse rounded-sm" />
            <div className="h-3 w-full bg-smoke animate-pulse rounded-sm" />
            <div className="h-3 w-3/4 bg-smoke animate-pulse rounded-sm" />
          </div>
        ))}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {["Performance", "SEO", "UX", "Copy"].map((label) => (
          <div
            key={label}
            className="border-[3px] border-foreground shadow-neo-md bg-card p-4 flex flex-col gap-2"
          >
            <div className="h-8 w-12 bg-smoke animate-pulse rounded-sm" />
            <p className="font-mono text-xs text-stone uppercase">{label}</p>
          </div>
        ))}
      </div>

      {/* Chat CTA */}
      {chatEnabled && (
        <div className="border-[3px] border-foreground shadow-neo-md bg-card p-6 flex flex-col gap-4 items-center text-center">
          <h3 className="font-pixel text-base uppercase">Want to go deeper?</h3>
          <p className="font-mono text-sm text-slate">
            Chat with the roaster to get actionable fixes.
          </p>
          <Link
            href="/chat"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            Start Chat
          </Link>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/r/[host]/components/roast-page.tsx
git commit -m "feat(roast): add RoastPage skeleton layout component"
```

---

## Task 5: Update `/r/[host]/page.tsx` with error handling and new components

**Files:**
- Modify: `apps/web/app/r/[host]/page.tsx`

- [ ] **Step 1: Replace page content**

```tsx
import { redirect } from "next/navigation"
import { normalizeUrl, resolveUrl } from "@/lib/url"
import { InvalidUrlDisplay } from "./components/invalid-url-display"
import { RoastPage } from "./components/roast-page"
import TopNav from "@/components/shared/topnav"

interface PageProps {
  params: Promise<{ host: string }>
}

export default async function Page({ params }: PageProps) {
  const { host: rawHost } = await params

  let resolvedHost: string
  try {
    const { host } = await resolveUrl(rawHost)
    resolvedHost = host
  } catch {
    return (
      <div className="flex h-svh flex-col">
        <TopNav />
        <InvalidUrlDisplay host={rawHost} />
      </div>
    )
  }

  const normalizedRaw = normalizeUrl(rawHost)
  const normalizedResolved = normalizeUrl(resolvedHost)
  if (normalizedResolved !== normalizedRaw) {
    redirect(`/r/${resolvedHost}`)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <TopNav />
      <main>
        <RoastPage host={resolvedHost} />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors

- [ ] **Step 3: Smoke-test in browser**

With `pnpm dev` running:

1. Navigate to `http://localhost:3000`, enter `google.com`, click "Get Roasted" — should navigate to `/r/google.com` and show skeleton layout.
2. Navigate directly to `http://localhost:3000/r/thisdomaindoesnotexist12345.xyz` — should show `<InvalidUrlDisplay>` with the host and a "Try another URL" link.
3. Verify "Try another URL" link returns to `/`.
4. Verify Chat CTA appears at the bottom (when `CHAT_ENABLED` is not `"false"`).

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/r/[host]/page.tsx
git commit -m "feat(roast): wire up skeleton layout and invalid URL error display"
```
