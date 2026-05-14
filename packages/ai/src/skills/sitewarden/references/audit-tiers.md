# Audit Tiers

Audit IDs are classified into three tiers. Lower tier = fix first.

## Tier 1 — Fix First (Highest SEO/UX Impact)

| Audit ID | What it means | Top fix |
|---|---|---|
| `is-crawlable` | Page blocked from Google | Remove noindex or robots.txt block |
| `meta-description` | Missing meta description | Add `<meta name="description">` |
| `document-title` | Missing `<title>` tag | Add `<title>` to `<head>` |
| `largest-contentful-paint` | LCP > 4s | Preload hero image, reduce TTFB |
| `cumulative-layout-shift` | CLS > 0.25 | Reserve space for dynamic content |
| `interactive` | TTI too high | Defer non-critical JS |

## Tier 2 — Fix Next (Broad Coverage, Quick Wins)

| Audit ID | What it means | Top fix |
|---|---|---|
| `color-contrast` | Text contrast below 4.5:1 | Update CSS color variables |
| `image-alt` | Images missing alt text | Add `alt` attributes to `<img>` tags |
| `uses-webp-images` | Serving JPEG/PNG instead of WebP | Add CDN transform or build step |
| `render-blocking-resources` | CSS/JS blocking render | Add `defer`/`async`, inline critical CSS |
| `unused-javascript` | JS loaded but not used | Code split, lazy load routes |
| `unused-css-rules` | CSS loaded but not used | PurgeCSS or CSS modules |

## Tier 3 — Nice to Have

| Audit ID | What it means | Top fix |
|---|---|---|
| `font-display` | Font causes FOIT/FOUT | Add `font-display: swap` to `@font-face` |
| `uses-long-cache-ttl` | Assets not cached | Set `Cache-Control: max-age=31536000` on CDN |
| `deprecations` | Using deprecated browser APIs | Update to modern equivalents |
| `bootup-time` | JS parse/compile time high | Reduce bundle size |
| `uses-text-compression` | Assets not gzipped/brotli | Enable compression on server/CDN |
