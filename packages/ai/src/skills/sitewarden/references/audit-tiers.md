# Audit Priority Reference

Audit IDs are grouped into three priority levels. Address **Top Priorities first** — they have the most direct impact on SEO rankings, Core Web Vitals, and user experience.

> **Fix is non-negotiable.** Every identified failure must include a concrete fix recommendation — even during analysis-only or roast phases. Never surface an issue without a solution.

---

## Priority 1 — Top Priorities

Highest SEO and UX impact. Fix these before anything else. Failures here directly affect search visibility and Core Web Vitals pass/fail status.

| Audit ID | What it Means | Impact Area | Required Fix |
|---|---|---|---|
| `is-crawlable` | Page blocked from Google | SEO — invisible to search engines | Remove `noindex` directive or `Disallow` in `robots.txt` |
| `meta-description` | Missing meta description | SEO — reduces SERP click-through rate | Add `<meta name="description" content="…">` to `<head>` |
| `document-title` | Missing `<title>` tag | SEO/UX — no page title in browser tabs or SERPs | Add a descriptive `<title>` inside `<head>` |
| `largest-contentful-paint` | LCP > 4s | CWV — Core Web Vitals failure, direct ranking signal | Preload hero image (`<link rel="preload">`), reduce TTFB, eliminate render-blocking resources |
| `cumulative-layout-shift` | CLS > 0.25 | CWV — jarring layout jumps, ranking signal | Reserve explicit dimensions for images/embeds; avoid injecting content above the fold |
| `interactive` | TTI too high | Perf — page feels unresponsive on load | Defer non-critical JS (`defer`/`async`); code-split heavy bundles |

---

## Priority 2 — High Impact

Broad coverage with quick wins. These are often template-level fixes that improve every page simultaneously.

| Audit ID | What it Means | Impact Area | Required Fix |
|---|---|---|---|
| `color-contrast` | Text contrast below 4.5:1 | A11y — fails WCAG AA for sighted users | Update CSS color tokens to meet a 4.5:1 contrast ratio |
| `image-alt` | Images missing `alt` text | A11y + SEO — screen readers and crawlers miss content | Add descriptive `alt` attributes to all `<img>` tags |
| `uses-webp-images` | Serving JPEG/PNG instead of WebP | Perf — larger file sizes slow loads | Add CDN image transform or build-time conversion (`sharp`, `next/image`) |
| `render-blocking-resources` | CSS/JS blocking render | Perf — delays FCP and LCP | Add `defer`/`async` to scripts; inline critical CSS |
| `unused-javascript` | JS loaded but not executed | Perf — bloated bundles increase TTI | Code-split routes; lazy-load non-critical modules |
| `unused-css-rules` | CSS loaded but not applied | Perf — bloated stylesheets | Enable PurgeCSS; switch to CSS Modules or Tailwind with content purging |

---

## Priority 3 — Enhancements

Polish and optimization. Low effort, incremental gains. Address these after Priorities 1 and 2 are resolved.

| Audit ID | What it Means | Impact Area | Required Fix |
|---|---|---|---|
| `font-display` | Font causes FOIT/FOUT | UX — invisible or shifting text during load | Add `font-display: swap` to all `@font-face` declarations |
| `uses-long-cache-ttl` | Static assets not cached aggressively | Perf — repeat visitors re-download unchanged assets | Set `Cache-Control: max-age=31536000, immutable` on CDN |
| `deprecations` | Using deprecated browser APIs | Compat — future breakage risk | Update to modern equivalents (check MDN for each deprecation) |
| `bootup-time` | JS parse/compile time too high | Perf — slow on low-end devices | Reduce bundle size; use `performance.mark` to profile hot paths |
| `uses-text-compression` | Assets not gzip/brotli compressed | Perf — larger transfers, slower loads | Enable Brotli or gzip compression at the server or CDN level |

---

## Priority Summary

| Priority | Label | When to Fix | Primary Impact |
|---|---|---|---|
| **1** | Top Priorities | Fix first — these are blocking | SEO, Core Web Vitals |
| **2** | High Impact | Fix before shipping | Accessibility, Performance |
| **3** | Enhancements | Fix when polish matters | UX, Caching, Compatibility |
