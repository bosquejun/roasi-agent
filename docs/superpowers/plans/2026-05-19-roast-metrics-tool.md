# Roast Metrics Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `roastMetricsTool` that the roast agent calls after writing its roast to emit four savage numeric scores (0–100) as structured output.

**Architecture:** A new tool file defines `roastMetricsTool` using `tool()` from the AI SDK with a zod schema for the four metrics. The ROAST.md prompt gains a STEP 5 instructing the agent to call this tool after the roast text. The agent wires the new tool in alongside the existing `scrapeSiteTool`.

**Tech Stack:** TypeScript, Vercel AI SDK (`ai`), Zod

---

### Task 1: Create `roastMetricsTool`

**Files:**
- Create: `packages/ai/src/tools/roast-metrics.ts`

- [ ] **Step 1: Create the tool file**

```ts
import { tool } from "ai"
import { z } from "zod"

export const roastMetricsTool = tool({
  description:
    "Emit structured roast metrics after writing the roast. Call this once with scores derived from the scraped site content.",
  inputSchema: z.object({
    cringeScore: z
      .number()
      .min(0)
      .max(100)
      .describe("Overall embarrassment level of the site (0 = fine, 100 = unwatchable)"),
    delusionIndex: z
      .number()
      .min(0)
      .max(100)
      .describe("Gap between what the site claims to be and what was actually shipped"),
    audacityLevel: z
      .number()
      .min(0)
      .max(100)
      .describe("The sheer nerve of shipping this publicly"),
    embarrassmentRadius: z
      .number()
      .min(0)
      .max(100)
      .describe("How far the cringe spreads — does it affect the builder's reputation, their team, their industry"),
  }),
  execute: async (metrics) => metrics,
})

export type RoastMetrics = {
  cringeScore: number
  delusionIndex: number
  audacityLevel: number
  embarrassmentRadius: number
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ai/src/tools/roast-metrics.ts
git commit -m "feat: add roastMetricsTool with 4 savage structured metrics"
```

---

### Task 2: Update ROAST.md with STEP 5

**Files:**
- Modify: `packages/ai/src/agents/roasi/prompts/ROAST.md`

- [ ] **Step 1: Append STEP 5 to the end of ROAST.md**

Add the following after the existing STEP 4 block:

```markdown
---
STEP 5 — METRICS

After the roast text is complete, call the roastMetricsTool once. Score each metric 0–100 based strictly on what you scraped. Higher is worse. Do not soften scores out of politeness. A site with a broken nav, no working demo, and a tagline ripped from a LinkedIn carousel is not a 60. Score what you saw.

- cringeScore: How embarrassing is this, taken as a whole? Factor in copy, visuals, the gap between tone and execution.
- delusionIndex: How wide is the gap between the pitch and the product? A landing page that promises AI-powered everything and ships a contact form is a 95.
- audacityLevel: Did they publish this with confidence? Did they put their name on it? Did they send it to investors? Score the nerve.
- embarrassmentRadius: Does the cringe stay on the page, or does it radiate outward — into their GitHub, their LinkedIn, their industry? Wider blast radius = higher score.

Call roastMetricsTool exactly once. Do not narrate the scores. Do not explain them in text. Just call the tool.
```

- [ ] **Step 2: Commit**

```bash
git add packages/ai/src/agents/roasi/prompts/ROAST.md
git commit -m "feat: add STEP 5 to ROAST.md — instruct agent to call roastMetricsTool"
```

---

### Task 3: Wire tool into roast.agent.ts

**Files:**
- Modify: `packages/ai/src/agents/roasi/roast.agent.ts`

- [ ] **Step 1: Import and add the tool**

In `roast.agent.ts`, update the import and tools object:

```ts
import { cachedModel } from "@roaster/ai/model"
import { scrapeSiteTool } from "@roaster/ai/tools/roast-site"
import { roastMetricsTool } from "@roaster/ai/tools/roast-metrics"
import { isLoopFinished, ToolLoopAgent } from "ai"
import { Bash, InMemoryFs, MountableFs, ReadWriteFs } from "just-bash"

export const roastAgent = async () => {
  const fs = new MountableFs({ base: new InMemoryFs() })

  fs.mount(
    "/home/agent",
    new ReadWriteFs({
      root: "../../packages/ai/src/agents/roasi",
    })
  )

  fs.mount(
    "/home/workspace",
    new ReadWriteFs({
      root: "./.workspace",
    })
  )

  const sandbox = new Bash({ fs, cwd: "/home/agent" })

  const roastMd = await sandbox.readFile("./prompts/ROAST.md")

  const tools = { scrapeSiteTool, roastMetricsTool }

  const instructions = `
    ${roastMd}
    `

  const agent = new ToolLoopAgent({
    model: cachedModel,
    tools,
    instructions,
    stopWhen: isLoopFinished(),
  })

  return agent
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ai/src/agents/roasi/roast.agent.ts
git commit -m "feat: wire roastMetricsTool into roastAgent"
```
