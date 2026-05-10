# Roaster.ph Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Roaster.ph neo-brutal design system in `packages/ui` — tokens, fonts, and all core components — matching `design-system/tokens.css` and `design-system/ds-components.jsx` / `ds-patterns.jsx` exactly.

**Architecture:** Replace the generic shadcn theme in `globals.css` with DESIGN.md's token set, faithfully copying `design-system/tokens.css`. Components are installed via shadcn CLI then fully rewritten to match the reference JSX implementations in `ds-components.jsx` and `ds-patterns.jsx`. Dark mode uses both `.dark` (next-themes class strategy) and `[data-theme="dark"]` (design system convention) selectors.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, `@base-ui/react`, `class-variance-authority`, shadcn CLI, Google Fonts (`Press Start 2P`, `Space Mono`), TypeScript 5.

---

## Critical Token Notes (design-system/tokens.css)

| Issue | Design system | Our plan must use |
|-------|--------------|------------------|
| Black token name | `--black: #0A0A0A` | `--black` (NOT `--neo-black`) |
| Semantic surface vars | `--bg-base`, `--bg-card`, `--bg-sunken` | Both must exist |
| Semantic text vars | `--text-primary`, `--text-secondary`, `--text-muted` | Both must exist |
| `--border` value | `3px solid var(--black)` (full shorthand) | Rename to `--border-rule`; keep `--border` as color for shadcn |
| Pixel grid | `linear-gradient` crosshatch, not radial dots | See tokens.css |
| Dark mode selector | `[data-theme="dark"]` | Add BOTH `.dark` and `[data-theme="dark"]` |
| Soft color values | `--acid-soft: #F0FFC0`, `--blue-soft: #D6EEFF`, `--pink-soft: #FFD6EB` | From tokens.css |

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/ui/src/styles/globals.css` | Modify | All design tokens, dark mode, @theme inline |
| `apps/web/app/layout.tsx` | Modify | Press Start 2P + Space Mono via next/font |
| `packages/ui/src/components/button.tsx` | Modify | 7 variants × 4 sizes, neo-brutal press behavior |
| `packages/ui/src/components/input.tsx` | Create (shadcn + rewrite) | Base input + prefix variant |
| `packages/ui/src/components/badge.tsx` | Create (shadcn + rewrite) | Category tags, status badges, score badge |
| `packages/ui/src/components/card.tsx` | Create (shadcn + rewrite) | Base card, stat card, user card |
| `packages/ui/src/components/score-bar.tsx` | Create (manual) | FireBar + ScoreBreakdown |
| `packages/ui/src/components/roast-card.tsx` | Create (manual) | Full feed card |
| `apps/web/app/page.tsx` | Modify | Component showcase |

---

## Task 1: Design Tokens in globals.css

**Files:**
- Modify: `packages/ui/src/styles/globals.css`

- [ ] **Step 1: Replace `:root` block**

Replace the entire `:root { … }` block in `packages/ui/src/styles/globals.css` with:

```css
:root {
  /* ── Brand Fire Palette ───────────────────────────── */
  --fire-red:      #E8231B;
  --fire-orange:   #F47820;
  --fire-yellow:   #F5C518;
  --fire-red-soft: #FFE8E7;
  --fire-org-soft: #FFF0E0;
  --fire-yel-soft: #FFFBE0;

  /* ── Accent Pops ──────────────────────────────────── */
  --acid-lime:     #C8F135;
  --electric-blue: #4D9EFF;
  --hot-pink:      #FF3D8B;
  --acid-soft:     #F0FFC0;
  --blue-soft:     #D6EEFF;
  --pink-soft:     #FFD6EB;

  /* ── Neutrals (warm cream) ────────────────────────── */
  --cream:         #F0F0EC;
  --cream-100:     #E8E8E4;
  --smoke:         #E4E4DF;
  --ash:           #D8D8D2;
  --stone:         #C8C2B0;
  --slate:         #8A8478;
  --charcoal:      #2A2520;
  --black:         #0A0A0A;
  --white:         #FFFFFF;

  /* ── Score Scale ──────────────────────────────────── */
  --score-nuclear:      #E8231B;
  --score-roasted:      #F47820;
  --score-singed:       #F5C518;
  --score-decent:       #C8F135;
  --score-crispy:       #22C55E;
  --score-nuclear-soft: #FFE8E7;
  --score-roasted-soft: #FFF0E0;
  --score-singed-soft:  #FFFBE0;
  --score-decent-soft:  #F0FFC0;
  --score-crispy-soft:  #DCFCE7;

  /* ── Semantic surfaces & text ────────────────────── */
  --bg-base:        var(--cream);
  --bg-card:        var(--white);
  --bg-sunken:      var(--smoke);
  --text-primary:   var(--black);
  --text-secondary: var(--charcoal);
  --text-muted:     var(--slate);
  --brand:          var(--fire-red);
  --brand-2:        var(--fire-orange);
  --brand-3:        var(--fire-yellow);

  /* ── Typography ───────────────────────────────────── */
  --font-pixel: 'Press Start 2P', monospace;
  --font-mono:  'Space Mono', monospace;

  --text-2xs:  0.5rem;
  --text-xs:   0.625rem;
  --text-sm:   0.75rem;
  --text-base: 0.875rem;
  --text-md:   1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  2rem;
  --text-4xl:  2.5rem;
  --text-5xl:  3rem;

  --leading-tight:  1.2;
  --leading-normal: 1.6;
  --leading-loose:  2;
  --tracking-pixel: 0.04em;

  /* ── Spacing (8px grid) ───────────────────────────── */
  --sp-1:  4px;
  --sp-2:  8px;
  --sp-3:  12px;
  --sp-4:  16px;
  --sp-5:  20px;
  --sp-6:  24px;
  --sp-8:  32px;
  --sp-10: 40px;
  --sp-12: 48px;
  --sp-16: 64px;
  --sp-20: 80px;
  --sp-24: 96px;

  /* ── Borders ─────────────────────────────────────── */
  --bw:           3px;
  --bw-thick:     4px;
  --bw-xl:        5px;
  --border-rule:  3px solid var(--black);   /* full shorthand — use in inline styles */
  --border-thick-rule: 4px solid var(--black);

  /* ── Shadows (no blur, hard offset) ─────────────── */
  --shadow-xs:  2px 2px 0 var(--black);
  --shadow-sm:  3px 3px 0 var(--black);
  --shadow-md:  4px 4px 0 var(--black);
  --shadow-lg:  6px 6px 0 var(--black);
  --shadow-xl:  8px 8px 0 var(--black);
  --shadow-2xl: 12px 12px 0 var(--black);
  --shadow-fire:   4px 4px 0 var(--fire-red);
  --shadow-orange: 4px 4px 0 var(--fire-orange);
  --shadow-yellow: 4px 4px 0 var(--fire-yellow);
  --shadow-acid:   4px 4px 0 var(--acid-lime);
  --shadow-blue:   4px 4px 0 var(--electric-blue);

  /* ── Radii ────────────────────────────────────────── */
  --r-none:  0px;
  --r-pixel: 2px;
  --r-sm:    4px;
  --r-md:    6px;

  /* ── Z-index ──────────────────────────────────────── */
  --z-base:    1;
  --z-raised:  10;
  --z-overlay: 100;
  --z-modal:   1000;
  --z-toast:   2000;

  /* ── Pixel grid (crosshatch) ─────────────────────── */
  --pixel-grid:
    linear-gradient(rgba(10,10,10,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10,10,10,0.06) 1px, transparent 1px);
  --pixel-grid-size: 8px 8px;

  /* ── Transitions ──────────────────────────────────── */
  --t-fast:   80ms;
  --t-base:   150ms;
  --t-slow:   220ms;
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);

  /* ── shadcn semantic remaps ──────────────────────── */
  --background: var(--cream);
  --foreground: var(--black);
  --card: var(--white);
  --card-foreground: var(--black);
  --popover: var(--white);
  --popover-foreground: var(--black);
  --primary: var(--fire-red);
  --primary-foreground: var(--white);
  --secondary: var(--smoke);
  --secondary-foreground: var(--black);
  --muted: var(--smoke);
  --muted-foreground: var(--slate);
  --accent: var(--acid-lime);
  --accent-foreground: var(--black);
  --destructive: var(--fire-red);
  --border: var(--ash);       /* color-only for Tailwind border utilities */
  --input: var(--ash);
  --ring: var(--fire-orange);
  --radius: 0px;
  --sidebar: var(--smoke);
  --sidebar-foreground: var(--black);
  --sidebar-primary: var(--fire-red);
  --sidebar-primary-foreground: var(--white);
  --sidebar-accent: var(--acid-lime);
  --sidebar-accent-foreground: var(--black);
  --sidebar-border: var(--ash);
  --sidebar-ring: var(--fire-orange);
}
```

- [ ] **Step 2: Replace dark mode block — add both `.dark` and `[data-theme="dark"]`**

Replace the entire `.dark { … }` block with:

```css
.dark,
[data-theme="dark"] {
  /* ── Surfaces ─────────────────────────────────────── */
  --bg-base:   #111009;
  --bg-card:   #1E1C14;
  --bg-sunken: #0C0B08;
  --cream:     #111009;
  --cream-100: #1E1C14;
  --smoke:     #1A1812;
  --ash:       #28261C;
  --stone:     #3C3A2E;
  --slate:     #5A5648;
  --charcoal:  #C8C0A0;

  /* ── Text ─────────────────────────────────────────── */
  --text-primary:   #F0E8D0;
  --text-secondary: #C8C0A0;
  --text-muted:     #706858;

  /* ── Borders & shadows flip to warm cream ─────────── */
  --black: #E8E0C4;

  --shadow-xs:  2px 2px 0 #E8E0C4;
  --shadow-sm:  3px 3px 0 #E8E0C4;
  --shadow-md:  4px 4px 0 #E8E0C4;
  --shadow-lg:  6px 6px 0 #E8E0C4;
  --shadow-xl:  8px 8px 0 #E8E0C4;
  --shadow-2xl: 12px 12px 0 #E8E0C4;

  /* ── Soft tints ───────────────────────────────────── */
  --fire-red-soft:  #3D0E0C;
  --fire-org-soft:  #3A1806;
  --fire-yel-soft:  #2C2106;
  --acid-soft:      #182806;
  --blue-soft:      #0A1E3C;
  --pink-soft:      #340A1E;

  --score-nuclear-soft: #3D0E0C;
  --score-roasted-soft: #3A1806;
  --score-singed-soft:  #2C2106;
  --score-decent-soft:  #182806;
  --score-crispy-soft:  #0A2A16;

  /* ── Pixel grid ───────────────────────────────────── */
  --pixel-grid:
    linear-gradient(rgba(232,224,196,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(232,224,196,0.07) 1px, transparent 1px);

  /* ── shadcn semantic remaps ──────────────────────── */
  --background: #111009;
  --foreground: #F0E8D0;
  --card: #1E1C14;
  --card-foreground: #F0E8D0;
  --popover: #1E1C14;
  --popover-foreground: #F0E8D0;
  --secondary: #1A1812;
  --secondary-foreground: #F0E8D0;
  --muted: #1A1812;
  --muted-foreground: #706858;
  --border: #28261C;
  --input: #28261C;
}
```

- [ ] **Step 3: Extend `@theme inline` block with design system utilities**

After the existing `@theme inline { … }` block, add a new separate `@theme inline` block:

```css
@theme inline {
  /* ── Brand colors ─────────────────────────────────── */
  --color-fire-red:      var(--fire-red);
  --color-fire-orange:   var(--fire-orange);
  --color-fire-yellow:   var(--fire-yellow);
  --color-fire-red-soft: var(--fire-red-soft);
  --color-fire-org-soft: var(--fire-org-soft);
  --color-fire-yel-soft: var(--fire-yel-soft);
  --color-acid-lime:     var(--acid-lime);
  --color-electric-blue: var(--electric-blue);
  --color-hot-pink:      var(--hot-pink);
  --color-acid-soft:     var(--acid-soft);
  --color-blue-soft:     var(--blue-soft);
  --color-pink-soft:     var(--pink-soft);

  /* ── Neutrals ─────────────────────────────────────── */
  --color-cream:    var(--cream);
  --color-smoke:    var(--smoke);
  --color-ash:      var(--ash);
  --color-stone:    var(--stone);
  --color-slate:    var(--slate);
  --color-charcoal: var(--charcoal);
  --color-black:    var(--black);
  --color-white:    var(--white);

  /* ── Score colors ─────────────────────────────────── */
  --color-score-nuclear:      var(--score-nuclear);
  --color-score-roasted:      var(--score-roasted);
  --color-score-singed:       var(--score-singed);
  --color-score-decent:       var(--score-decent);
  --color-score-crispy:       var(--score-crispy);
  --color-score-nuclear-soft: var(--score-nuclear-soft);
  --color-score-roasted-soft: var(--score-roasted-soft);
  --color-score-singed-soft:  var(--score-singed-soft);
  --color-score-decent-soft:  var(--score-decent-soft);
  --color-score-crispy-soft:  var(--score-crispy-soft);

  /* ── Shadows ──────────────────────────────────────── */
  --shadow-neo-xs:     var(--shadow-xs);
  --shadow-neo-sm:     var(--shadow-sm);
  --shadow-neo-md:     var(--shadow-md);
  --shadow-neo-lg:     var(--shadow-lg);
  --shadow-neo-xl:     var(--shadow-xl);
  --shadow-neo-2xl:    var(--shadow-2xl);
  --shadow-neo-fire:   var(--shadow-fire);
  --shadow-neo-orange: var(--shadow-orange);
  --shadow-neo-acid:   var(--shadow-acid);
  --shadow-neo-blue:   var(--shadow-blue);

  /* ── Font families ────────────────────────────────── */
  --font-pixel: var(--font-pixel);
  --font-mono:  var(--font-mono);
}
```

- [ ] **Step 4: Update `@layer base` block**

Replace the existing `@layer base { … }` block with:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-mono);
    line-height: var(--leading-normal);
    -webkit-font-smoothing: antialiased;
  }
  button:not(:disabled), [role="button"]:not(:disabled) {
    cursor: pointer;
  }
  .pixel-grid-bg {
    background-color: var(--bg-base);
    background-image: var(--pixel-grid);
    background-size: var(--pixel-grid-size);
  }
  .pixel-img {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }
}
```

- [ ] **Step 5: Type-check**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter @roaster/ui typecheck
```
Expected: No errors.

- [ ] **Step 6: Commit**
```bash
git add packages/ui/src/styles/globals.css
git commit -m "feat: replace globals.css with Roaster.ph design tokens"
```

---

## Task 2: Load Fonts in Web App

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Replace font imports**

Replace entire `apps/web/app/layout.tsx`:

```tsx
import { Press_Start_2P, Space_Mono } from "next/font/google"

import "@roaster/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@roaster/ui/lib/utils"

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
})

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", pressStart2P.variable, spaceMono.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter @roaster/web typecheck
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add apps/web/app/layout.tsx
git commit -m "feat: load Press Start 2P and Space Mono via next/font"
```

---

## Task 3: Button Component

Reference: `design-system/ds-components.jsx` → `Btn` component (lines 23–76).

Key details from reference:
- Hover shadow: shadow value with `4px` bumped to `6px`, `3px` bumped to `5px`
- Press: `translate(4px, 4px)` + shadow `none`
- Hover: `translate(-1px, -1px)`
- Transition: `all 80ms`
- Disabled: `bg: var(--smoke)`, `color: var(--stone)`, `border: 3px solid var(--stone)`, no shadow

**Files:**
- Modify: `packages/ui/src/components/button.tsx`

- [ ] **Step 1: Rewrite button.tsx**

Replace entire `packages/ui/src/components/button.tsx`:

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@roaster/ui/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1.5",
    "font-[family-name:var(--font-pixel)] uppercase tracking-[0.06em] leading-none",
    "border-[3px] border-black rounded-none",
    "cursor-pointer select-none whitespace-nowrap",
    "transition-all duration-[80ms]",
    "disabled:pointer-events-none disabled:opacity-100",
    /* press */
    "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    /* hover */
    "hover:-translate-x-px hover:-translate-y-px",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-r from-fire-red via-fire-orange to-fire-yellow",
          "text-white shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:bg-smoke disabled:bg-none disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        secondary: [
          "bg-card text-black shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        accent: [
          "bg-acid-lime text-black shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        orange: [
          "bg-fire-orange text-white shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        ghost: [
          "bg-transparent text-black shadow-none",
          "hover:shadow-neo-md",
          "disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        danger: [
          "bg-fire-red-soft text-fire-red border-fire-red",
          "shadow-[4px_4px_0_var(--fire-red)]",
          "hover:shadow-[6px_6px_0_var(--fire-red)]",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
        dark: [
          "bg-black text-white shadow-neo-md",
          "hover:shadow-neo-lg",
          "disabled:bg-smoke disabled:text-stone disabled:border-stone disabled:shadow-none",
        ].join(" "),
      },
      size: {
        sm: "text-[8px] px-3 py-1.5",
        md: "text-[9px] px-5 py-[10px]",
        lg: "text-[10px] px-7 py-3.5",
        xl: "text-[11px] px-9 py-[18px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

- [ ] **Step 2: Type-check**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter @roaster/ui typecheck
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add packages/ui/src/components/button.tsx
git commit -m "feat: rewrite Button with DESIGN.md variants matching ds-components reference"
```

---

## Task 4: Input Component

Reference: `design-system/ds-components.jsx` → `InputField` component (lines 111–133).

Key details from reference:
- Border AND shadow live on the wrapper `div`, not the `<input>` element
- Focus: `border: 3px solid var(--fire-orange)`, `boxShadow: 4px 4px 0 var(--fire-orange)`
- Error: `border: 3px solid var(--fire-red)`, `boxShadow: 4px 4px 0 var(--fire-red)`
- Default: `border: var(--border-rule)`, `boxShadow: var(--shadow-md)`
- Prefix panel: `background: var(--smoke)`, `borderRight: var(--border-rule)`
- Input itself: `padding: 10px 14px`, `font-mono`, `fontSize: 13`, no border, no outline
- Label: pixel font, 8px, `--text-primary`
- Helper: mono 11px, `--text-muted`
- Error text: mono 11px, `--fire-red`

**Files:**
- Create: `packages/ui/src/components/input.tsx` (install then rewrite)

- [ ] **Step 1: Install shadcn input**

```bash
cd /home/junbosque/roaster-ph/packages/ui && pnpm dlx shadcn@latest add input
```

Expected: `packages/ui/src/components/input.tsx` created.

- [ ] **Step 2: Replace input.tsx**

Replace entire `packages/ui/src/components/input.tsx`:

```tsx
import * as React from "react"

import { cn } from "@roaster/ui/lib/utils"

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "prefix"> {
  label?: string
  prefix?: React.ReactNode
  helperText?: string
  error?: boolean
  errorText?: string
}

function Input({
  className,
  type,
  label,
  prefix,
  helperText,
  error,
  errorText,
  id,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false)
  const inputId = id ?? React.useId()

  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    border: error
      ? "3px solid var(--fire-red)"
      : focused
      ? "3px solid var(--fire-orange)"
      : "var(--border-rule)",
    boxShadow: error
      ? "4px 4px 0 var(--fire-red)"
      : focused
      ? "4px 4px 0 var(--fire-orange)"
      : "var(--shadow-md)",
    background: "var(--bg-card)",
    transition: "all 120ms",
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="font-[family-name:var(--font-pixel)] text-[8px] tracking-[0.08em] text-black uppercase"
        >
          {label}
        </label>
      )}
      <div style={wrapperStyle}>
        {prefix && (
          <div
            className="flex items-center px-3 font-[family-name:var(--font-mono)] text-[12px] text-slate whitespace-nowrap select-none"
            style={{ background: "var(--smoke)", borderRight: "var(--border-rule)" }}
          >
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          data-slot="input"
          className={cn(
            "flex-1 bg-transparent font-[family-name:var(--font-mono)] text-[13px] text-black",
            "px-[14px] py-[10px] outline-none border-none",
            "placeholder:text-stone",
            "disabled:pointer-events-none disabled:opacity-50",
            className
          )}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {errorText && (
        <p className="font-[family-name:var(--font-mono)] text-[11px] text-fire-red">
          ⚠ {errorText}
        </p>
      )}
      {helperText && !errorText && (
        <p className="font-[family-name:var(--font-mono)] text-[11px] text-slate">
          {helperText}
        </p>
      )}
    </div>
  )
}

export { Input }
```

- [ ] **Step 3: Type-check**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter @roaster/ui typecheck
```
Expected: No errors.

- [ ] **Step 4: Commit**
```bash
git add packages/ui/src/components/input.tsx
git commit -m "feat: add Input component matching ds-components InputField reference"
```

---

## Task 5: Badge Component

Reference: `design-system/ds-components.jsx` → `Badge`, `ScoreBadge`, `FireBar` (lines 152–244).

Key details from reference:
- `Badge`: pixel font 8px, `padding: 4px 8px`, no border-radius, explicit border
- `ScoreBadge`: inline layout — score (fontSize 20) + vertical stack (tier label 7px, "/ 100" mono 10px), side by side
  - Tier-specific text colors: singed `#A07800`, decent `#5A7A00`, crispy `#166534`
  - `boxShadow: var(--shadow-sm)` (not md)
- `FireBar`: height 12px standalone; bar label 11px mono `--text-muted`, width 80px; score label pixel 8px tier-color, width 32px right-aligned

**Files:**
- Create: `packages/ui/src/components/badge.tsx` (install then rewrite)

- [ ] **Step 1: Install shadcn badge**

```bash
cd /home/junbosque/roaster-ph/packages/ui && pnpm dlx shadcn@latest add badge
```

Expected: `packages/ui/src/components/badge.tsx` created.

- [ ] **Step 2: Replace badge.tsx**

Replace entire `packages/ui/src/components/badge.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@roaster/ui/lib/utils"

/* ── Base Badge ────────────────────────────────────────────── */

const badgeVariants = cva(
  "inline-flex items-center font-[family-name:var(--font-pixel)] text-[8px] tracking-[0.06em] px-2 py-1 leading-none whitespace-nowrap border-[3px] rounded-none",
  {
    variants: {
      variant: {
        default: "bg-card text-black border-black",
        /* Category */
        landing:   "bg-blue-soft   text-electric-blue  border-electric-blue",
        portfolio: "bg-pink-soft   text-hot-pink        border-hot-pink",
        saas:      "bg-acid-soft   text-[#5A7A00]       border-acid-lime",
        startup:   "bg-fire-red-soft text-fire-red       border-fire-red",
        agency:    "bg-fire-org-soft text-fire-orange    border-fire-orange",
        ecommerce: "bg-fire-yel-soft text-[#A07800]      border-fire-yellow",
        /* Status */
        live:      "bg-fire-red    text-white            border-fire-red",
        pending:   "bg-smoke       text-slate            border-ash",
        reviewed:  "bg-acid-soft   text-[#5A7A00]        border-acid-lime",
        trending:  "bg-electric-blue text-white          border-electric-blue",
        launched:  "bg-acid-lime   text-black            border-acid-lime",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}

/* ── Score Badge ───────────────────────────────────────────── */

export type ScoreTier = "nuclear" | "roasted" | "singed" | "decent" | "crispy"

const SCORE_TIERS: Record<
  ScoreTier,
  { label: string; bg: string; color: string; border: string }
> = {
  nuclear: { label: "💀 NUCLEAR", bg: "#FFE8E7", color: "#E8231B",  border: "#E8231B" },
  roasted: { label: "🔥 ROASTED", bg: "#FFF0E0", color: "#F47820",  border: "#F47820" },
  singed:  { label: "😬 SINGED",  bg: "#FFFBE0", color: "#A07800",  border: "#F5C518" },
  decent:  { label: "👍 DECENT",  bg: "#F0FFC0", color: "#5A7A00",  border: "#C8F135" },
  crispy:  { label: "⭐ CRISPY",  bg: "#DCFCE7", color: "#166534",  border: "#22C55E" },
}

export function getScoreTier(score: number): ScoreTier {
  if (score <= 20) return "nuclear"
  if (score <= 40) return "roasted"
  if (score <= 60) return "singed"
  if (score <= 80) return "decent"
  return "crispy"
}

interface ScoreBadgeProps {
  score: number
  className?: string
}

function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const tier = getScoreTier(score)
  const { label, bg, color, border } = SCORE_TIERS[tier]

  return (
    <div
      className={cn("inline-flex items-center gap-2.5", className)}
      style={{
        background: bg,
        border: `3px solid ${border}`,
        padding: "8px 14px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <span
        className="font-[family-name:var(--font-pixel)] leading-none"
        style={{ fontSize: 20, color }}
      >
        {score}
      </span>
      <div className="flex flex-col">
        <span
          className="font-[family-name:var(--font-pixel)] leading-none"
          style={{ fontSize: 7, color }}
        >
          {label}
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-slate mt-0.5">
          / 100
        </span>
      </div>
    </div>
  )
}

/* ── Exports ───────────────────────────────────────────────── */

export { Badge, ScoreBadge, badgeVariants }
```

- [ ] **Step 3: Type-check**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter @roaster/ui typecheck
```
Expected: No errors.

- [ ] **Step 4: Commit**
```bash
git add packages/ui/src/components/badge.tsx
git commit -m "feat: add Badge, ScoreBadge components matching ds-components reference"
```

---

## Task 6: Card Components

Reference: `design-system/ds-components.jsx` → `StatCard`, `UserCard` (lines 248–277).

Key details from reference:
- `StatCard`: padding `20px 24px`, label on top (7px pixel muted), value big (28px pixel), delta (11px mono, green/red)
- `UserCard`: avatar 48×48, pixel-9 handle, badge inline, roast count mono 11px muted
- Base card hover: `translate(-2px, -2px)` + shadow-xl (from `ds-patterns.jsx` RoastCard hover)

**Files:**
- Create: `packages/ui/src/components/card.tsx` (install then rewrite)

- [ ] **Step 1: Install shadcn card**

```bash
cd /home/junbosque/roaster-ph/packages/ui && pnpm dlx shadcn@latest add card
```

Expected: `packages/ui/src/components/card.tsx` created.

- [ ] **Step 2: Replace card.tsx**

Replace entire `packages/ui/src/components/card.tsx`:

```tsx
import * as React from "react"

import { cn } from "@roaster/ui/lib/utils"

/* ── Base Card ─────────────────────────────────────────────── */

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card border-[3px] border-black rounded-none",
        "shadow-neo-md",
        "transition-all duration-[150ms]",
        "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── Stat Card ─────────────────────────────────────────────── */

interface StatCardProps {
  value: string | number
  label: string
  delta?: number
  accent?: string
  className?: string
}

function StatCard({ value, label, delta, accent, className }: StatCardProps) {
  const isPositive = delta !== undefined ? delta >= 0 : true

  return (
    <div
      className={cn(
        "bg-card border-[3px] border-black rounded-none shadow-neo-md",
        "p-5 flex flex-col",
        className
      )}
    >
      <div className="font-[family-name:var(--font-pixel)] text-[7px] text-slate tracking-[0.1em] uppercase mb-3">
        {label}
      </div>
      <div
        className="font-[family-name:var(--font-pixel)] leading-none mb-2"
        style={{ fontSize: 28, color: accent ?? "var(--text-primary)" }}
      >
        {value}
      </div>
      {delta !== undefined && (
        <div
          className="font-[family-name:var(--font-mono)] text-[11px]"
          style={{ color: isPositive ? "#22C55E" : "var(--fire-red)" }}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(delta)}% vs last week
        </div>
      )}
    </div>
  )
}

/* ── User Card ─────────────────────────────────────────────── */

interface UserCardProps {
  handle: string
  roasts?: number
  avgScore?: number
  badge?: string
  className?: string
}

function UserCard({ handle, roasts, avgScore, badge, className }: UserCardProps) {
  return (
    <div
      className={cn(
        "bg-card border-[3px] border-black rounded-none shadow-neo-md",
        "p-5 flex items-start gap-4",
        className
      )}
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 flex-shrink-0 border-[3px] border-black flex items-center justify-center bg-fire-red"
      >
        <span className="font-[family-name:var(--font-pixel)] text-[14px] text-white">
          {handle[0].toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="font-[family-name:var(--font-pixel)] text-[9px] text-black">
          @{handle}
        </div>
        {badge && (
          <span
            className="font-[family-name:var(--font-pixel)] text-[7px] px-1.5 py-0.5 bg-fire-red text-white border-[3px] border-black inline-block"
          >
            {badge}
          </span>
        )}
        {(roasts !== undefined || avgScore !== undefined) && (
          <div className="font-[family-name:var(--font-mono)] text-[11px] text-slate mt-2">
            {roasts !== undefined && `${roasts} roasts`}
            {roasts !== undefined && avgScore !== undefined && " · "}
            {avgScore !== undefined && `avg score ${avgScore}`}
          </div>
        )}
      </div>
    </div>
  )
}

export { Card, StatCard, UserCard }
```

- [ ] **Step 3: Type-check**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter @roaster/ui typecheck
```
Expected: No errors.

- [ ] **Step 4: Commit**
```bash
git add packages/ui/src/components/card.tsx
git commit -m "feat: add Card, StatCard, UserCard components matching ds-components reference"
```

---

## Task 7: Score Bar Component

Reference: `design-system/ds-components.jsx` → `FireBar` (lines 183–201), and `ds-patterns.jsx` score bars inside `RoastCard` (lines 160–173).

Key details from reference:
- Standalone `FireBar`: height 12px, label 80px wide (mono 11px muted), score value pixel 8px tier-color
- In-card bars: height 8px, label 80px (mono 10px muted), score pixel 7px tier-color

**Files:**
- Create: `packages/ui/src/components/score-bar.tsx`

- [ ] **Step 1: Create score-bar.tsx**

Create `packages/ui/src/components/score-bar.tsx`:

```tsx
import * as React from "react"

import { cn } from "@roaster/ui/lib/utils"
import { getScoreTier } from "@roaster/ui/components/badge"

const TIER_FILL: Record<string, string> = {
  nuclear: "#E8231B",
  roasted: "#F47820",
  singed:  "#F5C518",
  decent:  "#C8F135",
  crispy:  "#22C55E",
}

interface ScoreBarProps {
  score: number
  label: string
  compact?: boolean
  className?: string
}

function ScoreBar({ score, label, compact = false, className }: ScoreBarProps) {
  const tier = getScoreTier(score)
  const fill = TIER_FILL[tier]
  const pct = `${Math.min(100, Math.max(0, score))}%`

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex-shrink-0 font-[family-name:var(--font-mono)] text-slate",
          compact ? "text-[10px] w-20" : "text-[11px] w-20"
        )}
      >
        {label}
      </div>
      <div
        className="flex-1 bg-ash border-[2px] border-black relative"
        style={{ height: compact ? 8 : 12 }}
      >
        <div
          className="absolute top-0 left-0 h-full transition-[width] duration-[600ms]"
          style={{ width: pct, background: fill }}
        />
      </div>
      <div
        className="font-[family-name:var(--font-pixel)] text-right"
        style={{
          fontSize: compact ? 7 : 8,
          color: fill,
          width: compact ? 24 : 32,
        }}
      >
        {score}
      </div>
    </div>
  )
}

interface ScoreBreakdownProps {
  design: number
  copy: number
  ux: number
  performance: number
  mobile: number
  compact?: boolean
  className?: string
}

function ScoreBreakdown({
  design,
  copy,
  ux,
  performance,
  mobile,
  compact = false,
  className,
}: ScoreBreakdownProps) {
  return (
    <div
      className={cn("border-[3px] border-black p-3 flex flex-col gap-2", className)}
      style={{ background: "var(--smoke)" }}
    >
      {!compact && (
        <div className="font-[family-name:var(--font-pixel)] text-[9px] text-slate tracking-[0.1em] uppercase mb-1">
          Score Breakdown
        </div>
      )}
      <ScoreBar score={design}     label="Design"      compact={compact} />
      <ScoreBar score={copy}       label="Copy"        compact={compact} />
      <ScoreBar score={ux}         label="UX/Flow"     compact={compact} />
      <ScoreBar score={performance} label="Performance" compact={compact} />
      <ScoreBar score={mobile}     label="Mobile"      compact={compact} />
    </div>
  )
}

export { ScoreBar, ScoreBreakdown }
```

- [ ] **Step 2: Type-check**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter @roaster/ui typecheck
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add packages/ui/src/components/score-bar.tsx
git commit -m "feat: add ScoreBar and ScoreBreakdown components"
```

---

## Task 8: Roast Card Component

Reference: `design-system/ds-patterns.jsx` → `RoastCard` (lines 76–199).

Key details from reference:
- Featured card: `border: 3px solid var(--fire-red)` (whole card border changes, not just banner)
- Featured card: shadow is `var(--shadow-fire)` at rest, `var(--shadow-xl)` on hover
- Normal card: border `var(--border-rule)`, shadow `var(--shadow-md)` at rest
- Score overlay: inline (score + tier label side by side)
- Screenshot: full mock with browser chrome + content blocks skeleton
- Score bars: `compact={true}` (8px height)
- Upvote: pixel 8px, `6px 10px` padding

**Files:**
- Create: `packages/ui/src/components/roast-card.tsx`

- [ ] **Step 1: Create roast-card.tsx**

Create `packages/ui/src/components/roast-card.tsx`:

```tsx
"use client"

import * as React from "react"

import { cn } from "@roaster/ui/lib/utils"
import { Badge, ScoreBadge } from "@roaster/ui/components/badge"
import { ScoreBreakdown } from "@roaster/ui/components/score-bar"
import { Button } from "@roaster/ui/components/button"

type Category = "landing" | "portfolio" | "saas" | "startup" | "agency" | "ecommerce"

const CATEGORY_LABELS: Record<Category, string> = {
  landing:   "LANDING PAGE",
  portfolio: "PORTFOLIO",
  saas:      "SAAS",
  startup:   "STARTUP",
  agency:    "AGENCY",
  ecommerce: "E-COMMERCE",
}

interface RoastCardProps {
  url: string
  title: string
  tags: Category[]
  scores: {
    design: number
    copy: number
    ux: number
    performance: number
    mobile: number
  }
  overall: number
  votes?: number
  comments?: number
  author: string
  timeAgo: string
  featured?: boolean
  className?: string
}

function RoastCard({
  url,
  title,
  tags,
  scores,
  overall,
  votes = 0,
  comments = 0,
  author,
  timeAgo,
  featured = false,
  className,
}: RoastCardProps) {
  const [upvoted, setUpvoted] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)

  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    border: featured ? "3px solid var(--fire-red)" : "var(--border-rule)",
    boxShadow: hovered
      ? "var(--shadow-xl)"
      : featured
      ? "var(--shadow-fire)"
      : "var(--shadow-md)",
    transform: hovered ? "translate(-2px, -2px)" : "none",
    transition: "all 150ms",
    overflow: "hidden",
  }

  return (
    <article
      className={cn("flex flex-col", className)}
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Featured banner */}
      {featured && (
        <div className="bg-fire-red px-4 py-1">
          <span className="font-[family-name:var(--font-pixel)] text-[7px] text-white tracking-[0.1em] uppercase">
            🔥 FEATURED ROAST
          </span>
        </div>
      )}

      {/* Screenshot preview */}
      <div
        className="relative h-40 border-b-[3px] border-black flex items-center justify-center overflow-hidden"
        style={{
          background: "var(--smoke)",
          backgroundImage: "var(--pixel-grid)",
          backgroundSize: "8px 8px",
        }}
      >
        {/* Mock website thumbnail */}
        <div
          className="flex flex-col overflow-hidden border-[3px] border-black"
          style={{ width: 220, height: 120, background: "var(--ash)" }}
        >
          {/* Browser chrome */}
          <div
            className="flex items-center gap-1 px-1.5 border-b-[2px] border-black"
            style={{ height: 16, background: "var(--stone)" }}
          >
            {(["#E8231B", "#F5C518", "#22C55E"] as const).map((c, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 border border-black"
                style={{ background: c, borderRadius: "50%" }}
              />
            ))}
            <div className="flex-1 h-1 bg-ash ml-1 border border-black" />
          </div>
          {/* Content skeleton */}
          <div className="flex-1 p-2 flex flex-col gap-1">
            <div className="h-1.5 bg-stone" style={{ width: "70%" }} />
            <div className="h-1 bg-ash"    style={{ width: "90%" }} />
            <div className="h-1 bg-ash"    style={{ width: "60%" }} />
            <div
              className="mt-1.5 h-4 bg-fire-red border-[2px] border-black"
              style={{ width: "40%" }}
            />
          </div>
        </div>

        {/* Score overlay */}
        <div className="absolute top-3 right-3">
          <ScoreBadge score={overall} />
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-3 p-5">
        {/* URL + tags */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="font-[family-name:var(--font-mono)] text-[13px] font-bold text-black truncate">
              {title}
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[11px] text-slate truncate">
              {url}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end flex-shrink-0">
            {tags.map((t) => (
              <Badge key={t} variant={t}>
                {CATEGORY_LABELS[t]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Score breakdown */}
        <ScoreBreakdown {...scores} compact />

        {/* Footer */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUpvoted((v) => !v)}
              className={cn(
                "font-[family-name:var(--font-pixel)] text-[8px]",
                "border-[3px] border-black px-2.5 py-1.5",
                "shadow-neo-xs transition-all duration-[100ms]",
                upvoted
                  ? "bg-fire-red text-white border-fire-red"
                  : "bg-card text-black hover:bg-fire-red-soft"
              )}
            >
              🔥 {votes + (upvoted ? 1 : 0)}
            </button>
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-slate">
              💬 {comments}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-slate">
              @{author} · {timeAgo}
            </span>
            <Button variant="dark" size="sm">
              VIEW ROAST →
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export { RoastCard }
```

- [ ] **Step 2: Type-check**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter @roaster/ui typecheck
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add packages/ui/src/components/roast-card.tsx
git commit -m "feat: add RoastCard component matching ds-patterns reference"
```

---

## Task 9: Update Web Preview Page

Reference: `design-system/ds-components.jsx` and `ds-patterns.jsx` sample data.

**Files:**
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Replace page.tsx with showcase**

Replace entire `apps/web/app/page.tsx`:

```tsx
import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { Badge, ScoreBadge } from "@roaster/ui/components/badge"
import { Card, StatCard, UserCard } from "@roaster/ui/components/card"
import { ScoreBar, ScoreBreakdown } from "@roaster/ui/components/score-bar"
import { RoastCard } from "@roaster/ui/components/roast-card"

export default function Page() {
  return (
    <div className="min-h-svh pixel-grid-bg p-8 flex flex-col gap-16">

      {/* Buttons */}
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase text-black">
          Buttons
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Roast It</Button>
          <Button variant="secondary">View Roast</Button>
          <Button variant="accent">Submit Site</Button>
          <Button variant="orange">🔥 Launch</Button>
          <Button variant="ghost">Share</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="dark">Dashboard</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" size="xl">X-Large</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" disabled>Default</Button>
          <Button variant="secondary" disabled>Disabled</Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="flex flex-col gap-4 max-w-md">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase text-black">
          Inputs
        </h2>
        <Input label="SITE URL" placeholder="https://yourstartup.com" prefix="🌐" helperText="Must be a public URL — we'll screenshot and roast it." />
        <Input label="SITE URL — ERROR STATE" placeholder="https://yourstartup.com" prefix="🌐" error errorText="URL is not reachable. Check the address." />
        <Input label="SEARCH ROASTS" placeholder="Search by URL, tag, or @user..." />
        <Input label="YOUR HANDLE" placeholder="@pixel_dev" prefix="@" helperText="Used as your roaster identity." />
      </section>

      {/* Badges */}
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase text-black">
          Badges
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="landing">LANDING PAGE</Badge>
          <Badge variant="portfolio">PORTFOLIO</Badge>
          <Badge variant="saas">SAAS</Badge>
          <Badge variant="startup">STARTUP</Badge>
          <Badge variant="agency">AGENCY</Badge>
          <Badge variant="ecommerce">E-COMMERCE</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="live">🔥 LIVE ROAST</Badge>
          <Badge variant="pending">⏳ PENDING</Badge>
          <Badge variant="reviewed">✅ REVIEWED</Badge>
          <Badge variant="trending">💬 TRENDING</Badge>
          <Badge variant="launched">🚀 LAUNCHED</Badge>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <ScoreBadge score={12} />
          <ScoreBadge score={34} />
          <ScoreBadge score={55} />
          <ScoreBadge score={73} />
          <ScoreBadge score={91} />
        </div>
      </section>

      {/* Score Bars */}
      <section className="flex flex-col gap-4 max-w-md">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase text-black">
          Score Breakdown
        </h2>
        <ScoreBreakdown design={23} copy={41} ux={15} performance={67} mobile={30} />
      </section>

      {/* Cards */}
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase text-black">
          Stat Cards
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 max-w-2xl">
          <StatCard value="1,247" label="Total Roasts"     delta={12}  accent="var(--fire-red)" />
          <StatCard value="38.4"  label="Avg Score Given"  delta={-4}  accent="var(--fire-orange)" />
          <StatCard value="94"    label="Sites Today"      delta={8}   accent="var(--electric-blue)" />
          <StatCard value="3.2k"  label="Community Votes"  delta={22}  accent="var(--acid-lime)" />
        </div>
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase text-black mt-4">
          User Cards
        </h2>
        <div className="flex flex-wrap gap-4 max-w-2xl">
          <UserCard handle="pixel_dev"  roasts={47} avgScore={34} badge="TOP ROASTER" />
          <UserCard handle="jess_builds" roasts={12} avgScore={61} />
          <UserCard handle="startupkid" roasts={3}  avgScore={78} />
        </div>
      </section>

      {/* Roast Cards */}
      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] uppercase text-black">
          Feed — Roast Cards
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6 max-w-4xl">
          <RoastCard
            url="techflow.io"
            title="TechFlow — Workflow Automation"
            tags={["saas", "startup"]}
            scores={{ design: 18, copy: 31, ux: 22, performance: 24, mobile: 14 }}
            overall={21}
            votes={47}
            comments={18}
            author="pixel_dev"
            timeAgo="2h ago"
            featured
          />
          <RoastCard
            url="janedoe.design"
            title="Jane Doe — UX Portfolio"
            tags={["portfolio"]}
            scores={{ design: 72, copy: 55, ux: 68, performance: 60, mobile: 60 }}
            overall={64}
            votes={23}
            comments={9}
            author="roaster_ph"
            timeAgo="5h ago"
          />
        </div>
      </section>

    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter @roaster/web typecheck
```
Expected: No errors.

- [ ] **Step 3: Start dev server and verify visually**

```bash
cd /home/junbosque/roaster-ph && pnpm --filter @roaster/web dev
```

Open `http://localhost:3000` and verify against `design-system/Roaster.ph Design System.html`:
- Press Start 2P renders for all labels, button text, badge text
- Space Mono renders for body text and input values
- Buttons: fire gradient on primary, hard black shadows, translate on hover/press
- Score badges: inline layout (score number + label + /100), tier-appropriate colors
- Score bars: tier-colored fill, pixel font score label
- Roast cards: featured shows red border + red shadow at rest, mock browser screenshot, upvote toggle
- Dark mode (press `d`): shadows flip to warm cream `#E8E0C4`, surfaces darken

- [ ] **Step 4: Commit**
```bash
git add apps/web/app/page.tsx
git commit -m "feat: add design system component showcase to web preview"
```

---

## Self-Review Against design-system/ Files

- ✅ `tokens.css` → Task 1: all tokens copied faithfully, including `--border-rule` alias, crosshatch pixel grid, both dark selectors
- ✅ `ds-components.jsx` Btn → Task 3 Button: 7 variants, 4 sizes, 80ms transition, hover shadow bumped up one step, press translate
- ✅ `ds-components.jsx` InputField → Task 4 Input: wrapper div owns border/shadow, prefix panel, focus orange, error red
- ✅ `ds-components.jsx` Badge/ScoreBadge → Task 5: inline ScoreBadge layout, tier-specific text colors, `shadow-sm` on ScoreBadge
- ✅ `ds-components.jsx` FireBar → Task 7 ScoreBar: dual height (12px standalone / 8px compact), label 80px, score pixel font tier-color
- ✅ `ds-components.jsx` StatCard/UserCard → Task 6: exact padding, label-first layout, 48×48 avatar, badge inline
- ✅ `ds-patterns.jsx` RoastCard → Task 8: featured border + shadow change, inline score overlay, mock browser chrome skeleton
- ✅ Sample data in Task 9 page matches `SAMPLE_ROASTS` from `ds-patterns.jsx`

**Not covered (out of scope per DESIGN.md caveats):**
- Navigation topbar (`PatternNavigation`)
- Dashboard layout (`PatternDashboard`)
- Toasts (`PatternToasts`)
- Login/signup, roast detail, user profile, leaderboard
