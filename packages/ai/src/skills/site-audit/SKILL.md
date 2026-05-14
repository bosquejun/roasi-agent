---
name: site-audit
description: >
  Use this skill to run a full site audit on any website URL using Unlighthouse
  (powered by Google Lighthouse). Trigger when the user wants to scan, audit, or
  analyze a website — portfolio, landing page, marketing site, or any public URL.
  Trigger phrases include: "audit my site", "scan this URL", "check my website",
  "how is my site performing", "run a lighthouse audit", "analyze my portfolio",
  "what's wrong with my site", "check my Core Web Vitals". Always use this skill
  before giving any performance, SEO, or accessibility feedback — never guess
  without real scan data.
---

# site-audit

Runs a full Unlighthouse scan on a target URL and produces a structured report
ready to pass to `audit-interpret` for analysis and recommendations.

This skill owns everything up to and including the report object. What the report
*means* and what to *fix* are handled by downstream skills.

---

## Prerequisites

Unlighthouse requires a **real OS process** with Chrome available.

> ⚠️ This skill cannot run inside sandboxed or in-memory environments
> (e.g. just-bash, WASM shells). It must be invoked via a real shell:
> Claude Code bash tool, `child_process` in Node.js, or a terminal directly.

**Check the environment first:**

```bash
node --version          # must be >= 18
google-chrome --version # or: chromium-browser --version
```

If Chrome is missing, install Puppeteer as a fallback:

```bash
npm install -g @unlighthouse/cli puppeteer
```

**Concurrency warning:** Unlighthouse spawns a Chrome instance per scan.
Avoid running multiple scans simultaneously on the same machine — it degrades
score accuracy and can exhaust memory. Run scans sequentially. If integrating
into a server or agent pipeline handling concurrent requests, implement
concurrency control at the caller level before invoking the scan.

---

## Workflow

### Step 1 — Gather inputs

Required:
- **URL** — the site to scan (must be publicly reachable, or localhost for dev)

Infer from context, or ask if unclear:
- **Device** — mobile (default) or desktop
- **Scope** — whole site, specific paths, or exclude certain paths
- **Site type** — static, SPA/React/Vue/Angular, authenticated, large (100+ pages)

### Step 2 — Choose the right command

Start from the minimal command and layer flags based on inputs.
See **CLI Flags** in `references/cli-flags.md` for the full reference.

**Minimal scan:**
```bash
npx unlighthouse-ci --site https://example.com \
  --reporter json \
  --output-path ./.unlighthouse-output
```

**Always use these flags for agent/programmatic use:**
- `--reporter json` — writes `results.json` for the analyzer script to parse
- `--output-path` — set an explicit, predictable path

**SPA (React, Vue, Angular, Next.js client-side routing):**
```bash
npx unlighthouse-ci --site https://example.com \
  --enable-javascript --disable-sitemap \
  --reporter json --output-path ./.unlighthouse-output
```

**Desktop scan:**
```bash
npx unlighthouse-ci --site https://example.com \
  --desktop \
  --reporter json --output-path ./.unlighthouse-output
```

**Scoped scan (specific paths only):**
```bash
npx unlighthouse-ci --site https://example.com \
  --urls /,/about,/work,/contact \
  --reporter json --output-path ./.unlighthouse-output
```

**Exclude paths (admin, API, etc.):**
```bash
npx unlighthouse-ci --site https://example.com \
  --exclude-urls /admin/*,/api/*,/cdn-cgi/* \
  --reporter json --output-path ./.unlighthouse-output
```

**Accurate scores (slower — use when reliability matters):**
```bash
npx unlighthouse-ci --site https://example.com \
  --samples 3 --throttle --no-cache \
  --reporter json --output-path ./.unlighthouse-output
```

**Large site (100+ pages):**
```bash
npx unlighthouse-ci --site https://example.com \
  --max-routes 50 \
  --reporter json --output-path ./.unlighthouse-output
```

**Local / dev server:**
```bash
npx unlighthouse-ci --site http://localhost:3000 \
  --reporter json --output-path ./.unlighthouse-output
```

**Behind basic auth:**
```bash
npx unlighthouse-ci --site https://example.com \
  --auth username:password \
  --reporter json --output-path ./.unlighthouse-output
```

For more scenarios see `references/cli-flags.md`.

### Step 3 — Run the scan

Execute the command. The scan takes 1–5 minutes depending on site size.
Do not run other scans concurrently on the same machine.

If the scan fails, check `references/troubleshooting.md`.

### Step 4 — Parse the output

Once complete, run the analyzer to produce the structured report:

```bash
# CLI usage
node scripts/analyzeResults.js ./.unlighthouse-output

# Module usage (Node.js / AI SDK tool)
import { analyzeResults } from './scripts/analyzeResults.js';
const { report, markdown } = await analyzeResults('./.unlighthouse-output');
```

The `analyzeResults` function supports both output modes:
- **CI mode** — reads `results.json` (produced by `--reporter json`)
- **Interactive mode** — reads individual `*.lhr.json` files per page

**Always pass `report` (structured object) to downstream skills — not `markdown`.**
`markdown` is for logging or displaying raw results to developers.

### Step 5 — Hand off

Pass `report` to `audit-interpret` for prioritized analysis and recommendations.

The `report` object shape is documented in `references/report-schema.md`.

---

## Important limitations

- **Lab data only** — scores reflect a simulated environment, not real users.
  Lighthouse cannot measure real INP (Interaction to Next Paint); it uses TBT
  as a proxy. A page can score well in lab conditions and still underperform
  for real users on slow connections.
- **Score variance** — a single run can vary ±5 points. Use `--samples 3` when
  accuracy matters.
- **No login support by default** — authenticated pages require `--cookies` or
  `--auth`. Pages behind login will return empty or redirected results.

---

## Reference files

- `references/cli-flags.md` — full CLI flags table and scenario recipes
- `references/troubleshooting.md` — common failures and fixes
- `references/report-schema.md` — full shape of the `report` object
