# CLI Flags Reference

## Core flags

| Flag | Description |
|------|-------------|
| `--site <url>` | Target URL to scan (required) |
| `--reporter json` | Write `results.json` — use this for programmatic/agent use |
| `--output-path <path>` | Directory for scan output (default: `.unlighthouse`) |
| `--budget <score>` | Exit code 1 if average score falls below this (0–100) |

## Device & throttling

| Flag | Description |
|------|-------------|
| `--mobile` | Simulate mobile device (default) |
| `--desktop` | Simulate desktop device |
| `--samples <n>` | Run each page N times and average — more stable scores |
| `--throttle` | Simulate real network/CPU conditions (slower, more realistic) |
| `--no-cache` | Ignore cached results from previous runs |

## Scope

| Flag | Description |
|------|-------------|
| `--urls <paths>` | Comma-separated explicit paths to scan |
| `--exclude-urls <patterns>` | Comma-separated paths/glob patterns to skip |
| `--include-urls <patterns>` | Only scan these paths |
| `--max-routes <n>` | Hard cap on total pages scanned (large sites) |
| `--disable-sitemap` | Skip sitemap.xml discovery |
| `--disable-robots-txt` | Skip robots.txt crawling |
| `--disable-dynamic-sampling` | Scan every URL, no sampling |

## Auth & headers

| Flag | Description |
|------|-------------|
| `--auth <user:pass>` | HTTP Basic Auth credentials |
| `--cookies <k=v;k=v>` | Cookies sent with every request |
| `--extra-headers <k=v,k=v>` | Extra HTTP headers on every request |

## SPA / JavaScript

| Flag | Description |
|------|-------------|
| `--enable-javascript` | Wait for JS execution before auditing (SPAs) |

## Other

| Flag | Description |
|------|-------------|
| `--config-file <path>` | Use a custom config file location |
| `--debug` | Verbose logging |

---

## Config file (for complex or repeated setups)

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
    dynamicSampling: 10,
    maxRoutes: 100,
  },
  lighthouseOptions: {
    onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
  },
  outputPath: './.unlighthouse-output',
})
```

Run with: `npx unlighthouse-ci` (reads config automatically)

---

## Common scenario recipes

### Portfolio / personal site
```bash
npx unlighthouse-ci --site https://yourname.com \
  --reporter json --output-path ./.unlighthouse-output
```

### SPA (React, Vue, Angular, Next.js CSR)
```bash
npx unlighthouse-ci --site https://yourapp.com \
  --enable-javascript --disable-sitemap \
  --reporter json --output-path ./.unlighthouse-output
```

### Large marketing site (cap pages)
```bash
npx unlighthouse-ci --site https://yoursite.com \
  --max-routes 50 --exclude-urls /blog/tag/*,/admin/* \
  --reporter json --output-path ./.unlighthouse-output
```

### Accurate scores (CI / before/after comparison)
```bash
npx unlighthouse-ci --site https://yoursite.com \
  --samples 3 --throttle --no-cache \
  --reporter json --output-path ./.unlighthouse-output
```

### Authenticated pages
```bash
npx unlighthouse-ci --site https://app.example.com \
  --cookies "session=abc123" \
  --include-urls /dashboard/*,/profile/* \
  --reporter json --output-path ./.unlighthouse-output
```

### Local dev server
```bash
npx unlighthouse-ci --site http://localhost:3000 \
  --reporter json --output-path ./.unlighthouse-output
```
