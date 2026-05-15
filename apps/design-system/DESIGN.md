# Roasi — Design System

> **Roast hard. Build better.**
> Community platform for roasting startup landing pages, portfolios, and SaaS sites — with scores, metrics, and zero mercy.

---

## Index

```
/
├── DESIGN.md                    ← you are here
├── tokens.css                   ← all CSS custom properties
├── ds-foundations.jsx           ← Colors, Typography, Spacing, Effects
├── ds-components.jsx            ← Buttons, Inputs, Badges, Cards
├── ds-patterns.jsx              ← Navigation, Feed, Dashboard, Toasts
├── tweaks-panel.jsx             ← Tweaks shell (host protocol)
└── Roasi Design System.html  ← living design system viewer
```

---

## Brand

**Roasi** is blunt, funny, and useful. It tears apart bad websites with community-powered honesty — and helps makers build better ones.

The aesthetic is **neo-brutal × pixel-native**: thick black borders, hard offset shadows, zero border-radius, warm cream backgrounds, and a fire palette pulled straight from the pixel rooster logo.

### Logo

- File: `assets/roaster-logo.png`
- Always render with `image-rendering: pixelated`
- Minimum display size: 32px tall
- Never recolor or add effects — the pixel art is sacred

---

## Color System

Import `tokens.css` to get all variables.

### Brand Fire Palette

| Token | Hex | Use |
|---|---|---|
| `--fire-red` | `#E8231B` | Primary CTAs, score accents, danger |
| `--fire-orange` | `#F47820` | Secondary brand, hover states |
| `--fire-yellow` | `#F5C518` | Tertiary warmth, `.PH` logo accent |
| `--fire-red-soft` | `#FFE8E7` / dark: `#3D0E0C` | Badge backgrounds |
| `--fire-org-soft` | `#FFF0E0` / dark: `#3A1806` | Badge backgrounds |
| `--fire-yel-soft` | `#FFFBE0` / dark: `#2C2106` | Badge backgrounds |

### Accent Pops (neo-brutal)

| Token | Hex | Use |
|---|---|---|
| `--acid-lime` | `#C8F135` | Success, Patterns section, "Submit" CTA |
| `--electric-blue` | `#4D9EFF` | Metrics, Components section, info states |
| `--hot-pink` | `#FF3D8B` | Portfolio tag, community/social moments |

### Neutral Scale (warm grey)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--cream` | `#F0F0EC` | `#111009` | Page background |
| `--smoke` | `#E4E4DF` | `#1A1812` | Sunken areas, score bars bg |
| `--ash` | `#D8D8D2` | `#28261C` | Dividers, thin borders |
| `--stone` | `#C8C2B0` | `#3C3A2E` | Placeholder fills |
| `--slate` | `#8A8478` | `#5A5648` | Muted text |
| `--charcoal` | `#2A2520` | `#C8C0A0` | Secondary text |
| `--black` | `#0A0A0A` | `#E8E0C4` | Borders, shadows, primary text |
| `--white` | `#FFFFFF` | — | Card fills |

### Score Scale — The Core Brand Element

The score is the most important number in the product. Every score maps to a tier with its own color, label, and personality.

| Score | Tier | Label | Color | Soft bg |
|---|---|---|---|---|
| 0–20 | 💀 | Nuclear | `#E8231B` | `--score-nuclear-soft` |
| 21–40 | 🔥 | Roasted | `#F47820` | `--score-roasted-soft` |
| 41–60 | 😬 | Singed | `#F5C518` | `--score-singed-soft` |
| 61–80 | 👍 | Decent | `#C8F135` | `--score-decent-soft` |
| 81–100 | ⭐ | Crispy | `#22C55E` | `--score-crispy-soft` |

Sub-scores: **Design · Copy · UX/Flow · Performance · Mobile** — each shown as a 0–100 fire bar.

---

## Typography

Two fonts only. No exceptions.

### Press Start 2P — Display / Pixel
```css
font-family: var(--font-pixel);
```
- Used for: headings, score numbers, button labels, nav items, section titles, badges
- Never for long body text (max 1–2 lines)
- Google Fonts: `Press Start 2P`
- Always `letter-spacing: 0.04em` or more

### Space Mono — Body / UI
```css
font-family: var(--font-mono);
```
- Used for: body copy, metadata, helper text, code, URLs, input values
- Weights: 400 (body), 700 (bold/emphasis)
- Google Fonts: `Space Mono`

### Type Scale

| Token | Size | Family | Use |
|---|---|---|---|
| `--text-5xl` | 48px | pixel | — |
| `--text-4xl` | 40px | pixel | — |
| `--text-3xl` | 32px | pixel | Cover / hero display |
| `--text-2xl` | 24px | pixel | Score numbers, H1 |
| `--text-xl` | 20px | pixel | — |
| `--text-md` | 16px | pixel | H2 section headings |
| `--text-sm` | 12px | pixel | H3, badge text |
| `--text-xs` | 10px | pixel | Tags, nav labels |
| `--text-2xs` | 8px | pixel | Micro labels (SUBMITTED 2H AGO) |
| `--text-base` | 14px | mono | Body copy |
| `--text-sm` | 12px | mono | Captions, metadata |

---

## Spacing

**8px base grid.** All spacing values are multiples of 4px.

| Token | Value |
|---|---|
| `--sp-1` | 4px |
| `--sp-2` | 8px |
| `--sp-3` | 12px |
| `--sp-4` | 16px |
| `--sp-5` | 20px |
| `--sp-6` | 24px |
| `--sp-8` | 32px |
| `--sp-10` | 40px |
| `--sp-12` | 48px |
| `--sp-16` | 64px |
| `--sp-20` | 80px |
| `--sp-24` | 96px |

---

## Borders & Shadows

The signature of the design. Hard offset shadows with zero blur radius.

### Border Scale

| Token | Value | Use |
|---|---|---|
| `--border` | `3px solid var(--black)` | Default — everything |
| `--border-thick` | `4px solid var(--black)` | Cover card, hero elements |
| `--border-xl` | `5px solid var(--black)` | — |

### Shadow Scale

| Token | Light Value | Dark Value |
|---|---|---|
| `--shadow-xs` | `2px 2px 0 #0A0A0A` | `2px 2px 0 #E8E0C4` |
| `--shadow-sm` | `3px 3px 0 #0A0A0A` | `3px 3px 0 #E8E0C4` |
| `--shadow-md` | `4px 4px 0 #0A0A0A` | `4px 4px 0 #E8E0C4` |
| `--shadow-lg` | `6px 6px 0 #0A0A0A` | `6px 6px 0 #E8E0C4` |
| `--shadow-xl` | `8px 8px 0 #0A0A0A` | `8px 8px 0 #E8E0C4` |
| `--shadow-2xl` | `12px 12px 0 #0A0A0A` | `12px 12px 0 #E8E0C4` |

### Colored Shadows

| Token | Value | Use |
|---|---|---|
| `--shadow-fire` | `4px 4px 0 #E8231B` | Primary CTA hover, featured roast |
| `--shadow-orange` | `4px 4px 0 #F47820` | Secondary hover |
| `--shadow-acid` | `4px 4px 0 #C8F135` | Success states |
| `--shadow-blue` | `4px 4px 0 #4D9EFF` | Info / metric states |

### Border Radius

```css
--r-none:  0px    /* default for all UI elements */
--r-pixel: 2px    /* subtle pixel rounding if needed */
--r-sm:    4px
--r-md:    6px    /* chips and tags only */
```

**Rule:** default to `0px`. Only round chips/tags at `--r-md`.

### Background Texture

```css
background-image: var(--pixel-grid);    /* 8×8 dot pattern */
background-size: var(--pixel-grid-size);
```

Use on: page canvas, roast card screenshot areas, hero sections.

---

## Components

### Buttons

All buttons: `font-family: var(--font-pixel)`, uppercase, `letter-spacing: 0.06em`, zero border-radius.

Press interaction: `transform: translate(4px, 4px)` + shadow collapses to none.

| Variant | Background | Use |
|---|---|---|
| `primary` | gradient: fire red → orange → yellow | Main CTAs: "Roast It", "Submit" |
| `secondary` | `var(--bg-card)` white | Secondary actions: "View Roast" |
| `accent` | `var(--acid-lime)` | Positive actions: "Submit Site" |
| `orange` | `var(--fire-orange)` | Launch / publish actions |
| `ghost` | transparent | Tertiary: "Share", "Cancel" |
| `danger` | `var(--fire-red-soft)` + red border | Destructive: "Delete" |
| `dark` | `var(--black)` | Dark CTAs: "Dashboard" |

Sizes: `sm` (8px font, 6/12px padding) · `md` (9px, 10/20px) · `lg` (10px, 14/28px) · `xl` (11px, 18/36px)

### Inputs

- Border: `var(--border)` at rest
- Focus: border + shadow flip to `var(--fire-orange)`
- Error: border + shadow flip to `var(--fire-red)`
- Helper text: `var(--font-mono)` 11px, `--text-muted`
- Error text: 11px, `--fire-red`, prefixed with `⚠`
- URL input gets a `🌐` prefix panel (`var(--smoke)` bg, bordered right)

### Badges & Tags

All badges: `var(--font-pixel)`, 7–8px, zero border-radius, explicit border.

**Category tags:** Each type has its own color pair (bg + border):
- Landing Page → `--blue-soft` / `--electric-blue`
- Portfolio → `--pink-soft` / `--hot-pink`
- SaaS → `--acid-soft` / `--acid-lime`
- Startup → `--fire-red-soft` / `--fire-red`
- Agency → `--fire-org-soft` / `--fire-orange`
- E-commerce → `--fire-yel-soft` / `--fire-yellow`

**Status badges:**
- `🔥 LIVE ROAST` — `--fire-red` fill, white text
- `⏳ PENDING` — `--smoke` fill, muted text
- `✅ REVIEWED` — `--acid-soft` fill, lime border
- `💬 TRENDING` — `--electric-blue` fill, white text
- `🚀 LAUNCHED` — `--acid-lime` fill, black text

**Score badge:** The most prominent UI element. Shows score number in `--font-pixel` at 22px, tier label at 7px, all inside a colored bordered pill.

**Score bars:** 8px tall, `var(--ash)` background, 2px black border, colored fill (score-determined). Labels in `var(--font-mono)` 10px.

### Cards

All cards: `var(--bg-card)`, `var(--border)`, `var(--shadow-md)`. Hover lifts to `var(--shadow-xl)` + `translate(-2px, -2px)`.

**Stat Card** — dashboard metric. Value in `var(--font-pixel)` 28px, label 7px muted, delta indicator (↑ green / ↓ red) in 10px mono.

**User Card** — avatar square (`var(--fire-red)` fill, letter initial), handle + optional badge + roast count + avg score.

---

## Patterns

### Navigation (Topbar)

- Height: **56px**, sticky, `var(--bg-card)` fill, `var(--border)` bottom
- Logo: left-aligned, 32px tall, pixel-rendered
- Nav items: `var(--font-pixel)` 8px, uppercase — active state: `var(--fire-red)` fill, white text, `2px outline`
- Actions (right): `+ SUBMIT` in acid lime + `var(--shadow-xs)`, avatar square
- Sub-breadcrumb: 40px, `var(--smoke)` bg, mono 11px, `1px var(--ash)` border-bottom

### Roast Card (Feed Item)

The primary content unit. Anatomy top to bottom:

1. **Featured banner** (optional) — `var(--fire-red)` strip, "🔥 FEATURED ROAST" in pixel 7px white
2. **Screenshot preview** — 160px tall, `var(--smoke)` + pixel grid bg, contains:
   - Mock browser chrome (traffic lights, address bar) as placeholder
   - Score badge overlay (top-right): tier color, number + tier label
3. **Card body** (`padding: 16px 20px`):
   - Site URL + title — mono 13px bold + 11px muted
   - Category tags — right-aligned
   - Score breakdown bars — `var(--smoke)` panel, 5 sub-scores
   - Footer: upvote button (🔥 toggles red on press), comment count, author + time, "VIEW ROAST →" dark button

### Dashboard

Tab-based. Tabs: `overview` / `my roasts` / `community`.
Active tab: `var(--black)` fill, white text. Tabs have `1px var(--ash)` right divider.

Header: `var(--smoke)` bg, welcome greeting + pixel handle, `+ SUBMIT SITE` CTA.

Stats grid: `repeat(auto-fill, minmax(160px, 1fr))`, each card in `var(--smoke)` + `var(--border)`.

Activity list: score (colored by tier) + site + time + status badge. `1px var(--ash)` dividers.

### Toasts / Notifications

Hard-bordered, full-color banners. Appear top-right, 4s auto-dismiss.

| Type | Background | Text |
|---|---|---|
| Roast alert | `var(--fire-red)` | White |
| Success | `var(--acid-lime)` | Black |
| Info | `var(--electric-blue)` | White |
| Warning | `var(--fire-yellow)` | Black |

All: `var(--border)` + `var(--shadow-md)`, mono 12px bold, `✕` dismiss button.

---

## Dark Mode

Set `data-theme="dark"` on `<html>`.

Key differences from light:
- **Shadows flip to `#E8E0C4`** (warm cream) — hard offsets stay visible on dark surfaces
- **Soft color tints darken** (`--fire-red-soft` → `#3D0E0C`, etc.)
- **Three dark surface layers**: base `#111009` → card `#1E1C14` → sunken `#0C0B08`
- **Text**: primary `#F0E8D0` → secondary `#C8C0A0` → muted `#706858`
- **Pixel grid**: warm cream dots at 7% opacity

---

## Voice & Tone

Roasi speaks like a brilliant, blunt friend who's seen too many bad landing pages.

**Do:**
- Be direct and specific: *"Your headline is too vague. Users can't tell what you do."*
- Use score tier names as verdicts: *"This is a 🔥 Roasted — 31/100."*
- Verb-first labels: **Roast It**, **Submit Site**, **View Roast**, **Launch**
- Uppercase for category/status tags. Title Case for section headers.

**Don't:**
- Hedge: no *"might," "could," "seems like"*
- Pad: no fluff copy, no lorem ipsum, no filler sections
- Use emoji as decoration — only as score tier icons
- Use gradients on full-bleed backgrounds (brand gradient = buttons + logo only)

---

## Layout Rules

- **Feed page:** 2-col card grid at `minmax(360px, 1fr)`, 24px gap, full-width mobile
- **Dashboard:** 3-panel — sidebar (220px) / main / optional detail. Below 768px: sidebar collapses
- **Top bar:** 56px sticky. Logo left at 16px, nav centered, account cluster right at 16px
- **Section spacing:** 80px bottom margin between major sections
- **Card padding:** 16–24px; stat cards 16px; roast cards 20px
- **Pixel grid bg:** use on canvas areas and hero sections

---

## Animation

**Restrained.** Nothing bounces.

- Hover: `translate(-1px, -1px)` + shadow lifts one step — `150ms`
- Press: `translate(4px, 4px)` + shadow collapses — `80ms`
- Focus: border + shadow color swap — `120ms`
- Card hover: `translate(-2px, -2px)` + `shadow-md` → `shadow-xl` — `150ms`
- Panel open: `220ms cubic-bezier(0.2, 0.8, 0.2, 1)`

No spring overshoot. No skeleton shimmer. No diagonal sheen.

---

## Caveats & Next Steps

- No codebase or Figma attached — all components are built from the brand brief + logo
- Icon set: placeholder emoji used in docs; production should use a consistent outlined icon library (Lucide or similar, 1.5px stroke, no fill)
- Mobile responsive: feed cards stack at `< 640px`; topbar nav collapses to hamburger
- Missing surfaces: login/signup, site submission flow, individual roast detail page, user profile, leaderboard
- Accessibility: focus states use colored border + shadow — no additional `outline` needed
