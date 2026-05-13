# Roaster Insights Tool Integration Design

**Date:** 2026-05-13  
**Status:** Approved  
**Scope:** `packages/ai` + `packages/local-server`

---

## Overview

Integrate the existing `roaster-insights-skill` as two typed AI SDK tools (`scanSite`, `analyzeResults`) in `packages/ai`, and wire them into the `packages/local-server` AI agent alongside a proper system prompt. The existing `createSkillTool` (bash-tool) mechanism stays untouched as a flexible fallback for ad-hoc skill use.

---

## Architecture

```
packages/ai/src/
  tools/
    create-skill-tool.ts          ← unchanged
    load-skill-tool.ts            ← unchanged
    scan-site.ts                  ← NEW
    analyze-results.ts            ← NEW
  skills/
    roaster-insights-skill/
      SKILL.md                    ← unchanged
      scripts/analyzeResults.js   ← unchanged
      references/                 ← unchanged
  index.ts                        ← add named exports for new tools

packages/local-server/src/
  index.ts                        ← register new tools + updated agent instructions
```

Two layers coexist in the agent:
- **bash-tool skills** (`createSkillTool`) — ad-hoc skill loading and bash execution
- **typed tools** (`scanSite`, `analyzeResults`) — precise, schema-validated roaster-insights workflow

---

## Tool: `scan-site`

**File:** `packages/ai/src/tools/scan-site.ts`

**Input schema (Zod):**
```ts
{ url: string }
```

**Execution:**
1. Run prerequisite checks (see below) — return `{ error }` immediately if any fail
2. Derive a deterministic output path: `/tmp/roaster-<hash-of-url>`
3. Spawn `npx unlighthouse-ci --site <url> --output-path <outputPath> --reporter jsonExpanded` via Node's `execSync` (blocking)
4. Return `{ outputPath }` on success, `{ error: string }` on failure

**Prerequisite checks** (run before scan, in order):
| Check | Command | Failure message |
|-------|---------|-----------------|
| Node >= 18 | `node --version` | `"Node >= 18 is required. Current version: X"` |
| npx available | `npx --version` | `"npx not found. Ensure Node.js is installed correctly."` |
| Chrome/Chromium | `google-chrome --version` or `chromium-browser --version` | `"Chrome/Chromium not found. Install Puppeteer: npm install -g @unlighthouse/cli puppeteer"` |

Each check uses `execSync`. If it throws, return the corresponding error string — no auto-install, no retry.

**Output path strategy:** Hash-derived path (e.g., `crypto.createHash('md5').update(url).digest('hex').slice(0,8)`) means repeated scans for the same URL overwrite the previous output rather than accumulate.

---

## Tool: `analyze-results`

**File:** `packages/ai/src/tools/analyze-results.ts`

**Input schema (Zod):**
```ts
{ outputPath: string }
```

**Execution:**
1. Call `analyzeResults(outputPath)` directly — imported from `../skills/roaster-insights-skill/scripts/analyzeResults.js` (relative to the tool file)
2. Return the structured `report` object on success, `{ error: string }` on failure

The agent receives `report` (not `markdown`) and reasons over the structured data in its own persona/voice. This is consistent with the guidance in `SKILL.md`.

**Structured report shape:**
```ts
{
  totalPages: number,
  categoryAverages: {
    performance, accessibility, 'best-practices', seo  // { label, score, raw, rating }
  },
  cwvAverages: { [auditId]: { value, display, rating, good, poor } },
  worstPages: [{ url, score, rating }],        // top 10, worst-first
  failingAudits: [{ id, title, description, affectedPages, affectedPercent, worstScore, urls }],  // top 20
  perfectPages: string[],
}
```

---

## Exports

**`packages/ai/src/index.ts`** — add:
```ts
export { scanSite } from "./tools/scan-site.js"
export { analyzeResults } from "./tools/analyze-results.js"
```

`packages/ai/package.json` already has `"./tools/*": "./src/tools/*.ts"` — no changes needed.

---

## Local-Server Integration

**File:** `packages/local-server/src/index.ts`

**Tool registration:**
```ts
import { scanSite, analyzeResults } from "@roaster/ai"
// ...
const tools = { ...skillTools, getWeather, scanSite, analyzeResults }
```

**Agent instructions** — replace `"you are the best"` with a composed system prompt:

```ts
import { buildSkillsPrompt } from "@roaster/ai/skills/skills-prompt"
import { discoverSkills } from "@roaster/ai"

const skills = await discoverSkills()
const instructions = `
You are Roaster, a website quality analyst.

When a user asks to analyze, roast, audit, or get feedback on a website:
1. Call scan-site with the URL — wait for the outputPath
2. Call analyze-results with that outputPath — get the structured report
3. Reason over the report and deliver findings in your persona

If scan-site returns an error, explain the issue to the user and suggest the fix.

${buildSkillsPrompt(skills)}
`.trim()
```

The `buildSkillsPrompt` call injects the available skill list so the agent knows when to call `loadSkill` for anything outside the typed tools.

---

## Error Handling

- All errors are caught and returned as `{ error: string }` — never throw from a tool
- Error messages are actionable (include fix instructions where applicable)
- The agent handles errors conversationally — no retries, no fallbacks inside the tools

---

## Out of Scope

- Non-blocking / async scan execution
- Configurable scan options (device, samples, throttle, paths)
- Auto-installing missing prerequisites
- Persistent scan history or job tracking
