---
name: sitewarden
description: >
  Use this skill whenever an AI agent needs to audit, analyze, improve, or verify a website's
  performance, SEO, accessibility, or best practices programmatically. Trigger when the user
  mentions scanning a site, checking Lighthouse scores, auditing pages, fixing web issues,
  or verifying improvements after fixes. SiteWarden runs Unlighthouse as a Node.js API (no CLI,
  no sandbox required) and exposes four composable tools: scan, analyze, fix, and verify.
  Use this skill even for partial requests like "check my scores", "what's wrong with my site",
  or "did my fix work" — SiteWarden handles the full workflow from scan to verification.
---

# SiteWarden

SiteWarden is a programmatic site auditing skill powered by Unlighthouse and Google Lighthouse.
It scans pages of a website and returns scores, screenshots, and audit details as structured
data — no UI server, no sandbox, no CLI required.

The skill exposes four tools that can be used independently or chained as a multi-step workflow.
Sequencing is the only constraint: analyze requires a prior scan, fix requires a prior analysis,
and verify requires a prior fix.

**Scanning is scoped by default.** Never scan everything unless explicitly asked.
Start minimal, expand intentionally.

---

## Prerequisites

```bash
node --version   # Must be >= 18
# Chrome or Chromium must be installed, or install Puppeteer as fallback:
npm install @unlighthouse/core puppeteer
```

---

## Tools

## Execution Model

All tools are Node.js ES modules. Execute them via the `bash` tool:

```bash
node --input-type=module << 'EOF'
import { scan } from '{skillDirectory}/tools/scan.js';
const result = await scan({ url: 'https://example.com' });
process.stdout.write(JSON.stringify(result));
EOF
```

Replace `{skillDirectory}` with the `skillDirectory` value returned by `loadSkill`.
Chain subsequent tools the same way, passing prior output as the input argument.

---

### 1. `scan` — Audit a site

Runs Unlighthouse programmatically against a target URL. Returns scores, screenshots,
and raw audit data per page. Always the first step.

**Scan modes — always pick the right scope:**

| Mode | Scans | When to use |
|---|---|---|
| `default` | Homepage only (`/`) | First look, unknown site |
| `targeted` | Caller-specified paths | Focused audit, post-fix verify |
| `smart` | Sitemap minus noise | Full site audit on request |
| `full` | Everything, capped at 200 | Explicit opt-in only |

Noise patterns always excluded in `smart` and `full`:
`/admin/*`, `/api/*`, `/cdn-cgi/*`, `/wp-admin/*`, `/auth/*`, `*.xml`, `*.json`

```js
// Quick look — homepage only (default)
await scan({ url: 'https://example.com' })

// Check specific pages
await scan({ url: 'https://example.com', mode: 'targeted', paths: ['/blog', '/about'] })

// Full site audit (user explicitly asked)
await scan({ url: 'https://example.com', mode: 'smart' })
```

**Input**
- `url` (required) — target site, must be http/https
- `mode` — `default` | `targeted` | `smart` | `full` (default: `default`)
- `paths` — required when mode is `targeted`
- `device` — `desktop` or `mobile` (default: `desktop`)
- `allowedHosts` — app-layer pre-approved hosts, bypasses SSRF check (set in config, not from user input)
- `bypassSSRF` — set to `true` only after receiving explicit user confirmation

**Output**
- `pages[]` — one entry per scanned page with scores, screenshot (base64), and full audit list
- `mode` — the mode used, for traceability

**SSRF protection is on by default.**
All non-public hosts are blocked — including localhost, private ranges, and cloud metadata.
When `scan()` throws with `error.canOverride === true`, the agent must ask the user for
confirmation before retrying with `bypassSSRF: true`. Cloud metadata endpoints cannot be
overridden under any circumstance. See `references/security.md` for the full model.

---

### 2. `analyze` — Identify failures and priorities

Parses scan output and returns prioritized failures grouped by impact priority.
Requires output from `scan`.

```js
const report = analyze(scanResult)
// report.summary   — site-wide average scores per category
// report.failures  — sorted by priority (1 = fix first) then score
// report.passing   — pages with no failures
```

Priority classification is in `references/audit-tiers.md`.

> **Rule:** Every failure returned by `analyze` must produce a fix recommendation. Surfacing issues without solutions is not allowed — even when the agent is in roast/analysis mode.

---

### 3. `fix` — Apply a targeted fix

**Fix is mandatory.** For every failure surfaced by `analyze`, a fix must be applied or explicitly recommended. Skipping this step — even in analysis-only or roast contexts — is not permitted. If the agent cannot apply the fix automatically, it must output the exact manual steps required.

Applies a single fix for a specific audit failure. Only modifies the exact file and pattern relevant to the failing audit. Never applies multiple fixes in one call. Requires output from `analyze`.

**Constraints**
- One audit fix per call — never batch fixes across audits
- Always return a diff so the caller can verify intent before applying
- Never modify files outside the project root
- If auto-fix is not possible, provide explicit manual fix instructions instead of skipping

**Output**
- `applied` — whether the fix was applied
- `description` — what was changed
- `diff` — the exact change made

---

### 4. `verify` — Confirm improvement

Re-scans the affected page(s) after a fix and compares scores to the pre-fix baseline.
**Always uses `targeted` mode** — only re-scans pages the fix touched, never the whole site.
Requires output from `fix`.

**Output**
- `improved` — true if no category regressed
- `delta` — score change per category
- `newScores` — scores after the fix
- `newFailures` — any remaining failures on the affected pages

---

## Workflow

```
scan(url, mode)               ← start minimal, expand if needed
  └─→ analyze(scanResult)
        └─→ fix(failure)
              └─→ verify(url, paths, baseline)   ← always targeted
                    └─→ fix next failure  (repeat)
```

---

## Choosing the Right Mode

```
User says...                          → Mode
"check my site"                       → default
"audit my homepage"                   → default
"check /blog and /about"              → targeted
"scan my whole site"                  → smart
"audit every page"                    → smart
"I want a complete crawl"             → full (warn: slow)
after applying a fix                  → targeted (verify only)
```

When in doubt, start with `default` and ask the user if they want broader coverage.

---

## Common Patterns

**Quick score check**
```js
const result = await scan({ url: 'https://example.com' })
```

**Diagnose specific pages**
```js
const result = await scan({ url, mode: 'targeted', paths: ['/pricing', '/blog'] })
const report = analyze(result)
```

**Full site audit**
```js
const result = await scan({ url, mode: 'smart' })
const report = analyze(result)
```

**Fix + verify loop (fix is mandatory for all failures)**
```js
const scanResult = await scan({ url })
const { summary: baseline, failures } = analyze(scanResult)

// Always fix — start with Top Priorities (priority 1), then High Impact (priority 2)
for (const failure of failures.sort((a, b) => a.priority - b.priority)) {
  const fixResult = await fix(failure)         // never skip this step
  const verification = await verify({ url, paths: [failure.page], baseline })
  if (!verification.improved) break
}
```

---

## Reference Files

Load these as needed — do not load all upfront:

- `references/security.md` — SSRF model, override mechanisms, agent confirmation flow
- `references/audit-tiers.md` — Priority 1/2/3 classification (Top Priorities, High Impact, Enhancements) for all audit IDs

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Chrome not found | `npm install puppeteer` alongside `@unlighthouse/core` |
| Host blocked error | See `references/security.md` for override options |
| 0 pages returned | Site may block crawlers — use `targeted` mode with explicit paths |
| SPA returns blank pages | Add `lighthouseOptions: { waitForLoad: true }` to scanner config |
| Scores vary between runs | Use `samples: 3` in scanner config for averaged results |
| Scan too slow | Use `default` or `targeted` mode — avoid `full` unless necessary |
