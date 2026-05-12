---
name: roaster-insights
description: >
  Use this skill whenever the agent needs to scan, analyze, or report on a website's
  performance, SEO, accessibility, or best practices inside Roaster Studio. Trigger when
  the user says things like: "roast my site", "analyze my website", "check my performance",
  "scan this URL", "how bad is my site", "give me insights", "what's wrong with my site",
  or any variation of wanting feedback on their website quality. Also trigger for specific
  metrics like LCP, CLS, INP, Core Web Vitals, SEO score, accessibility issues. Always use
  this skill when a URL is provided and the user wants any kind of site quality feedback —
  never wing it without running a real scan first.
---

# Roaster Insights

The scanning and analysis engine for Roaster Studio. Powered by Google Lighthouse under
the hood, this skill scans every page of a website in parallel and returns structured data —
scores, failing audits, Core Web Vitals — ready for whatever personality layer sits on top.

This skill is **personality-agnostic**. It surfaces facts and prioritized recommendations.
How those facts are delivered (savage roast, friendly coach, corporate report) is entirely
up to the agent persona defined outside this skill.

Requires Node >= 18 and a local Chrome/Chromium installation (or Puppeteer as a fallback).

---

## Quick Reference

```bash
# One-time scan (no install needed)
npx unlighthouse --site https://example.com

# Global install (for repeated use)
npm install -g @unlighthouse/cli
unlighthouse --site https://example.com

# CI mode (exits with code 1 if scores fall below budget)
npx unlighthouse-ci --site https://example.com --budget 80
```

---

## Workflow

### Step 1 — Gather Requirements

Ask the user (or infer from context):
- **Target URL** — which site to scan (required)
- **Device** — desktop or mobile (default: mobile)
- **Goals** — performance, SEO, accessibility, all?
- **Scope** — whole site, specific paths, or a URL list?
- **Output** — interactive local UI, CI score check, or saved report?

### Step 2 — Check Prerequisites

```bash
node --version          # Must be >= 18
google-chrome --version # or chromium-browser --version
npx unlighthouse --version
```

If Chrome is missing, install Puppeteer alongside the CLI:
```bash
npm install -g @unlighthouse/cli puppeteer
```

### Step 3 — Build the Command

Start with the minimal command and layer in flags based on the user's needs.
See the **CLI Flags** section below for all options.

**Basic scan:**
```bash
npx unlighthouse --site https://example.com
```

**Thorough scan (accurate scores, slower):**
```bash
npx unlighthouse --site https://example.com --samples 3 --throttle --no-cache
```

**Desktop only:**
```bash
npx unlighthouse --site https://example.com --desktop
```

**Scan specific paths only:**
```bash
npx unlighthouse --site https://example.com --urls /,/about,/blog,/contact
```

**Exclude admin/API paths:**
```bash
npx unlighthouse --site https://example.com --exclude-urls /admin/*,/api/*
```

**Behind basic auth:**
```bash
npx unlighthouse --site https://example.com --auth username:password
```

**With cookies (e.g., logged-in state):**
```bash
npx unlighthouse --site https://example.com --cookies session=abc123
```

**CI with score budget:**
```bash
npx unlighthouse-ci --site https://example.com --budget 75
```

### Step 4 — Config File (optional, for complex setups)

Create `unlighthouse.config.ts` in the project root:

```typescript
import { defineUnlighthouseConfig } from 'unlighthouse/config'

export default defineUnlighthouseConfig({
  site: 'https://example.com',
  scanner: {
    device: 'desktop',
    samples: 3,
    throttle: true,
    exclude: ['/admin/*', '/api/*', '/cdn-cgi/*'],
    // include: ['/blog/*', '/products/*'], // Only scan these
    dynamicSampling: 10, // Max pages per route template (large sites)
  },
  lighthouseOptions: {
    onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
  },
  outputPath: './roaster-report',
  debug: false,
})
```

Then just run: `unlighthouse` (reads config automatically)

### Step 5 — Interpret Results

Once the scan completes, the interactive Vite UI opens at `http://localhost:3000` (default).
Each page shows scores for:
- **Performance** — Core Web Vitals (LCP, CLS, INP), TTFB, FCP
- **Accessibility** — contrast ratios, ARIA, keyboard nav
- **SEO** — meta tags, titles, descriptions, canonical, robots
- **Best Practices** — HTTPS, deprecated APIs, console errors

### Step 6 — Analyze with the Script

Run the bundled analyzer to get structured data the agent can reason over:

```bash
node scripts/analyzeResults.js .unlighthouse
```

Or import directly in an AI SDK tool (recommended):

```js
import { analyzeResults } from './scripts/analyzeResults.js';

const { report, markdown } = await analyzeResults('./.unlighthouse');
// report   → structured object (scores, failingAudits, cwvAverages, worstPages)
// markdown → neutral plain-English summary
```

**Important:** pass `report` to the agent — not `markdown`. The agent should reason
over the structured data and express findings in its own persona/voice. `markdown` is
useful for logging or displaying raw results to developers.

---

## CLI Flags Reference

| Flag | Description |
|------|-------------|
| `--site <url>` | Target URL to scan (required) |
| `--desktop` | Simulate desktop device |
| `--mobile` | Simulate mobile device (default) |
| `--samples <n>` | Run each page N times and average (more accurate) |
| `--throttle` | Simulate real network/CPU conditions |
| `--no-cache` | Ignore cached results |
| `--urls <paths>` | Comma-separated explicit paths to scan |
| `--exclude-urls <patterns>` | Comma-separated paths/regex to skip |
| `--include-urls <patterns>` | Only scan these paths |
| `--output-path <path>` | Save report to this directory |
| `--config-file <path>` | Use a custom config file location |
| `--auth <user:pass>` | HTTP Basic Auth credentials |
| `--cookies <k=v;k=v>` | Cookies to send with every request |
| `--extra-headers <k=v,k=v>` | Extra HTTP headers |
| `--enable-javascript` | Wait for JS execution (for SPAs) |
| `--disable-sitemap` | Skip sitemap.xml discovery |
| `--disable-robots-txt` | Skip robots.txt crawling |
| `--disable-dynamic-sampling` | Scan every URL, no sampling |
| `--debug` | Enable verbose logging |
| `--budget <score>` | (CI only) Fail if avg score < this |

---

## Common Scenarios

### SPA / React / Vue / Angular
```bash
npx unlighthouse --site https://myapp.com --enable-javascript --disable-sitemap
```

### Large Site (1000+ pages)
```typescript
scanner: {
  dynamicSampling: 5, // 5 pages per route template
  maxRoutes: 200,     // Hard cap
}
```

### Local / Dev Server
```bash
npx unlighthouse --site http://localhost:3000
```

### Authenticated Pages
```bash
npx unlighthouse --site https://app.example.com \
  --cookies "auth_token=eyJ..." \
  --include-urls /dashboard/*,/profile/*
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Chrome not found` | Install puppeteer: `npm i -g @unlighthouse/cli puppeteer` |
| Very slow scan | Reduce `--samples`, remove `--throttle`, lower `maxConcurrency` |
| 0 pages found | Site may block bots; try `--disable-robots-txt` |
| SPA shows blank pages | Add `--enable-javascript` |
| Scores vary widely | Add `--samples 3 --throttle` for consistency |
| Port 3000 in use | Set `server: { port: 3001 }` in config |

---

## Analysis Output Structure

The `report` object returned by `analyzeResults()` — feed this directly to the agent:

```js
{
  totalPages: 12,
  categoryAverages: {
    performance:      { label, score, raw, rating },  // rating: 'GOOD'|'NEEDS_WORK'|'POOR'
    accessibility:    { label, score, raw, rating },
    'best-practices': { label, score, raw, rating },
    seo:              { label, score, raw, rating },
  },
  cwvAverages: {
    'largest-contentful-paint': { value, display, rating, good, poor },
    'cumulative-layout-shift':  { value, display, rating, good, poor },
    'total-blocking-time':      { value, display, rating, good, poor },
    // + first-contentful-paint, speed-index, interactive
  },
  worstPages: [
    { url, score, rating },  // sorted worst-first, top 10
  ],
  failingAudits: [
    {
      id, title, description,
      affectedPages, affectedPercent,
      worstScore, urls,
    },  // sorted by affectedPages desc, top 20
  ],
  perfectPages: [ url, ... ],
}
```

For audit ID definitions, meanings, and fixes — load:
**`references/lighthouse-audits.md`**

---

## Prioritization Framework

Surfaced to every agent persona as the factual basis for recommendations:

**Tier 1 — Highest impact (address first):**
- LCP > 4s → SEO ranking and bounce rate directly affected
- CLS > 0.25 → jarring UX, Core Web Vitals failure
- `is-crawlable` failing → pages invisible to search engines
- `meta-description` missing → hurts click-through rates

**Tier 2 — Quick wins with broad coverage:**
- `color-contrast` → usually a CSS variable change, fixes all pages at once
- `image-alt` → template-level fix, improves both SEO and accessibility
- `uses-webp-images` → CDN transform or build step, meaningful performance gain
- `render-blocking-resources` → add `defer`/`async`, immediate FCP improvement

**Tier 3 — Polish:**
- `font-display` → single `@font-face` line
- `uses-long-cache-ttl` → CDN/server config
- `deprecations` → minor code cleanup
