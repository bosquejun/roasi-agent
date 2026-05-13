# Roaster Insights Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose `roaster-insights-skill` as two typed AI SDK tools (`scanSite`, `analyzeResults`) in `packages/ai` and wire them into the `packages/local-server` agent with a proper system prompt.

**Architecture:** Keep the existing `createSkillTool` (bash-tool) untouched as a flexible fallback. Add two thin typed wrappers alongside it: `scanSite` runs an Unlighthouse scan as a blocking subprocess and returns the output path; `analyzeResults` calls the existing `analyzeResults.js` script and returns the structured report. Both tools are registered in `local-server` and the agent instructions are replaced with a proper Roaster system prompt.

**Tech Stack:** TypeScript (NodeNext ESM), AI SDK `tool()`, Zod, Node `child_process.execSync`, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/ai/src/tools/scan-site.ts` | Create | Prereq checks + blocking Unlighthouse scan |
| `packages/ai/src/tools/analyze-results.ts` | Create | Thin wrapper over `analyzeResults.js` |
| `packages/ai/src/tools/scan-site.test.ts` | Create | Unit tests for `scanSite` |
| `packages/ai/src/tools/analyze-results.test.ts` | Create | Unit tests for `analyzeResults` |
| `packages/ai/src/index.ts` | Modify | Export new tools |
| `packages/ai/package.json` | Modify | Add `vitest` devDependency + `test` script |
| `packages/ai/vitest.config.ts` | Create | Vitest config for NodeNext ESM |
| `packages/local-server/src/index.ts` | Modify | Register new tools + replace agent instructions |

---

## Task 1: Add Vitest to `packages/ai`

**Files:**
- Modify: `packages/ai/package.json`
- Create: `packages/ai/vitest.config.ts`

- [ ] **Step 1: Add vitest to devDependencies and test script**

Edit `packages/ai/package.json` — replace the `"scripts"` and `"devDependencies"` sections:

```json
{
  "name": "@roaster/ai",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "ai": "^6.0.177",
    "bash-tool": "^1.3.16",
    "just-bash": "^3.0.0",
    "yaml": "^2.9.0",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@roaster/eslint-config": "workspace:*",
    "@roaster/typescript-config": "workspace:*",
    "@types/node": "^22.0.0",
    "typescript": "^5.9.3",
    "vitest": "^2.0.0"
  },
  "exports": {
    ".": "./src/index.ts",
    "./skills/*": "./src/skills/*.ts",
    "./tools/*": "./src/tools/*.ts"
  }
}
```

- [ ] **Step 2: Create vitest config**

Create `packages/ai/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
  },
})
```

- [ ] **Step 3: Install vitest**

Run from the repo root:

```bash
pnpm install
```

- [ ] **Step 4: Verify vitest is available**

Run from `packages/ai`:

```bash
cd packages/ai && pnpm test
```

Expected: `No test files found` (or similar — zero failures, vitest exits 0)

- [ ] **Step 5: Commit**

```bash
git add packages/ai/package.json packages/ai/vitest.config.ts
git commit -m "chore(ai): add vitest"
```

---

## Task 2: Implement `scan-site` — prerequisite checks

**Files:**
- Create: `packages/ai/src/tools/scan-site.ts`
- Create: `packages/ai/src/tools/scan-site.test.ts`

- [ ] **Step 1: Write failing tests for prerequisite checks**

Create `packages/ai/src/tools/scan-site.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}))

import { execSync } from "child_process"
import { scanSite } from "./scan-site.js"

const mockExecSync = vi.mocked(execSync)

function setupPrereqs({
  nodeVersion = "v20.0.0",
  npxFails = false,
  chromeFails = false,
  chromiumFails = false,
} = {}) {
  mockExecSync.mockImplementation((cmd) => {
    const c = cmd as string
    if (c === "node --version") return nodeVersion as any
    if (c === "npx --version") {
      if (npxFails) throw new Error("command not found")
      return "10.9.0" as any
    }
    if (c === "google-chrome --version") {
      if (chromeFails) throw new Error("not found")
      return "Google Chrome 120.0.0" as any
    }
    if (c === "chromium-browser --version") {
      if (chromiumFails) throw new Error("not found")
      return "Chromium 120.0.0" as any
    }
    return "" as any
  })
}

describe("scanSite — prerequisite checks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns error when Node version is below 18", async () => {
    setupPrereqs({ nodeVersion: "v16.14.0" })
    const result = await scanSite.execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).toEqual({
      error: expect.stringContaining("Node >= 18 is required"),
    })
  })

  it("returns error when node command throws", async () => {
    mockExecSync.mockImplementation((cmd) => {
      if ((cmd as string) === "node --version") throw new Error("not found")
      return "" as any
    })
    const result = await scanSite.execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).toEqual({
      error: expect.stringContaining("Node not found"),
    })
  })

  it("returns error when npx is not found", async () => {
    setupPrereqs({ npxFails: true })
    const result = await scanSite.execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).toEqual({
      error: expect.stringContaining("npx not found"),
    })
  })

  it("returns error when neither Chrome nor Chromium is found", async () => {
    setupPrereqs({ chromeFails: true, chromiumFails: true })
    const result = await scanSite.execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).toEqual({
      error: expect.stringContaining("Chrome/Chromium not found"),
    })
  })

  it("succeeds when Chromium is found even if Chrome is missing", async () => {
    setupPrereqs({ chromeFails: true, chromiumFails: false })
    const result = await scanSite.execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).not.toHaveProperty("error")
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd packages/ai && pnpm test
```

Expected: `Cannot find module './scan-site.js'` — module doesn't exist yet.

- [ ] **Step 3: Create `scan-site.ts` with prerequisite checks only**

Create `packages/ai/src/tools/scan-site.ts`:

```typescript
import { tool } from "ai"
import { execSync } from "child_process"
import { createHash } from "crypto"
import { z } from "zod"

function checkPrerequisites(): string | null {
  try {
    const version = execSync("node --version", { encoding: "utf-8" }).trim()
    const major = parseInt(version.replace("v", "").split(".")[0] ?? "0", 10)
    if (major < 18) return `Node >= 18 is required. Current version: ${version}`
  } catch {
    return "Node not found. Ensure Node.js >= 18 is installed."
  }

  try {
    execSync("npx --version", { encoding: "utf-8" })
  } catch {
    return "npx not found. Ensure Node.js is installed correctly."
  }

  const chromeFound = (() => {
    for (const cmd of ["google-chrome --version", "chromium-browser --version"]) {
      try {
        execSync(cmd, { encoding: "utf-8" })
        return true
      } catch {}
    }
    return false
  })()

  if (!chromeFound) {
    return "Chrome/Chromium not found. Install Puppeteer: npm install -g @unlighthouse/cli puppeteer"
  }

  return null
}

export function deriveOutputPath(url: string): string {
  const hash = createHash("md5").update(url).digest("hex").slice(0, 8)
  return `/tmp/roaster-${hash}`
}

export const scanSite = tool({
  description:
    "Scan a website using Unlighthouse. Checks prerequisites, runs the scan, and returns outputPath for use with analyzeResults.",
  inputSchema: z.object({
    url: z.string().describe("The website URL to scan"),
  }),
  execute: async ({ url }) => {
    const prereqError = checkPrerequisites()
    if (prereqError) return { error: prereqError }

    const outputPath = deriveOutputPath(url)
    try {
      execSync(
        `npx unlighthouse-ci --site ${url} --output-path ${outputPath} --reporter jsonExpanded`,
        { stdio: "inherit" }
      )
      return { outputPath }
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) }
    }
  },
})
```

- [ ] **Step 4: Run tests — verify prerequisite check tests pass**

```bash
cd packages/ai && pnpm test
```

Expected: All 5 prerequisite check tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/ai/src/tools/scan-site.ts packages/ai/src/tools/scan-site.test.ts
git commit -m "feat(ai): add scan-site tool with prerequisite checks"
```

---

## Task 3: Implement `scan-site` — scan execution

**Files:**
- Modify: `packages/ai/src/tools/scan-site.test.ts` (add tests)
- `packages/ai/src/tools/scan-site.ts` is already complete from Task 2

- [ ] **Step 1: Add scan execution tests to `scan-site.test.ts`**

Append to `packages/ai/src/tools/scan-site.test.ts` (after the existing `describe` block):

```typescript
import { deriveOutputPath } from "./scan-site.js"

describe("deriveOutputPath", () => {
  it("returns a path under /tmp/roaster-", () => {
    const p = deriveOutputPath("https://example.com")
    expect(p).toMatch(/^\/tmp\/roaster-[a-f0-9]{8}$/)
  })

  it("returns the same path for the same URL", () => {
    expect(deriveOutputPath("https://example.com")).toBe(
      deriveOutputPath("https://example.com")
    )
  })

  it("returns different paths for different URLs", () => {
    expect(deriveOutputPath("https://foo.com")).not.toBe(
      deriveOutputPath("https://bar.com")
    )
  })
})

describe("scanSite — scan execution", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns outputPath on successful scan", async () => {
    setupPrereqs()
    const result = await scanSite.execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).toEqual({
      outputPath: expect.stringMatching(/^\/tmp\/roaster-[a-f0-9]{8}$/),
    })
  })

  it("outputPath is deterministic for the same URL", async () => {
    setupPrereqs()
    const r1 = await scanSite.execute({ url: "https://example.com" }, {} as any)
    const r2 = await scanSite.execute({ url: "https://example.com" }, {} as any)
    expect((r1 as any).outputPath).toBe((r2 as any).outputPath)
  })

  it("returns error when unlighthouse scan fails", async () => {
    setupPrereqs()
    mockExecSync.mockImplementation((cmd) => {
      const c = cmd as string
      if (c.includes("unlighthouse-ci")) throw new Error("Scan failed: connection refused")
      if (c === "node --version") return "v20.0.0" as any
      if (c === "npx --version") return "10.9.0" as any
      if (c === "google-chrome --version") return "Google Chrome 120" as any
      return "" as any
    })
    const result = await scanSite.execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).toEqual({
      error: expect.stringContaining("Scan failed"),
    })
  })

  it("calls unlighthouse-ci with the correct site URL and output path", async () => {
    setupPrereqs()
    await scanSite.execute({ url: "https://example.com" }, {} as any)
    const scanCall = mockExecSync.mock.calls.find(
      ([cmd]) => (cmd as string).includes("unlighthouse-ci")
    )
    expect(scanCall).toBeDefined()
    expect(scanCall![0]).toContain("--site https://example.com")
    expect(scanCall![0]).toContain("--reporter jsonExpanded")
  })
})
```

- [ ] **Step 2: Run tests — verify all scan-site tests pass**

```bash
cd packages/ai && pnpm test
```

Expected: All tests in `scan-site.test.ts` pass.

- [ ] **Step 3: Commit**

```bash
git add packages/ai/src/tools/scan-site.test.ts
git commit -m "test(ai): add scan execution tests for scan-site"
```

---

## Task 4: Implement `analyze-results` tool

**Files:**
- Create: `packages/ai/src/tools/analyze-results.ts`
- Create: `packages/ai/src/tools/analyze-results.test.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/ai/src/tools/analyze-results.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../skills/roaster-insights-skill/scripts/analyzeResults.js", () => ({
  analyzeResults: vi.fn(),
}))

import { analyzeResults as runAnalysis } from "../skills/roaster-insights-skill/scripts/analyzeResults.js"
import { analyzeResults } from "./analyze-results.js"

const mockRunAnalysis = vi.mocked(runAnalysis)

const mockReport = {
  source: "/tmp/roaster-abc123",
  totalPages: 5,
  categoryAverages: {
    performance: { label: "Performance", score: 72, raw: 0.72, rating: "NEEDS_WORK" },
    accessibility: { label: "Accessibility", score: 91, raw: 0.91, rating: "GOOD" },
    "best-practices": { label: "Best Practices", score: 83, raw: 0.83, rating: "NEEDS_WORK" },
    seo: { label: "SEO", score: 95, raw: 0.95, rating: "GOOD" },
  },
  cwvAverages: {},
  worstPages: [{ url: "https://example.com/slow", score: 42, rating: "POOR" }],
  failingAudits: [
    {
      id: "color-contrast",
      title: "Background and foreground colors do not have a sufficient contrast ratio",
      description: "Low-contrast text is difficult for many users to read.",
      affectedPages: 4,
      affectedPercent: 80,
      worstScore: 0,
      urls: ["https://example.com/"],
    },
  ],
  perfectPages: [],
}

describe("analyzeResults tool", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns the structured report on success", async () => {
    mockRunAnalysis.mockResolvedValue({ report: mockReport, markdown: "# Report" })
    const result = await analyzeResults.execute(
      { outputPath: "/tmp/roaster-abc123" },
      {} as any
    )
    expect(result).toEqual(mockReport)
  })

  it("returns error when outputPath does not exist", async () => {
    mockRunAnalysis.mockRejectedValue(
      new Error("No Lighthouse result files found in /tmp/roaster-abc123.")
    )
    const result = await analyzeResults.execute(
      { outputPath: "/tmp/roaster-abc123" },
      {} as any
    )
    expect(result).toEqual({
      error: expect.stringContaining("No Lighthouse result files found"),
    })
  })

  it("returns error when analyzeResults throws a non-Error", async () => {
    mockRunAnalysis.mockRejectedValue("unexpected failure")
    const result = await analyzeResults.execute(
      { outputPath: "/tmp/roaster-abc123" },
      {} as any
    )
    expect(result).toEqual({ error: "unexpected failure" })
  })

  it("passes outputPath to the underlying analyzeResults function", async () => {
    mockRunAnalysis.mockResolvedValue({ report: mockReport, markdown: "" })
    await analyzeResults.execute({ outputPath: "/tmp/roaster-xyz" }, {} as any)
    expect(mockRunAnalysis).toHaveBeenCalledWith("/tmp/roaster-xyz")
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd packages/ai && pnpm test
```

Expected: `Cannot find module './analyze-results.js'`

- [ ] **Step 3: Create `analyze-results.ts`**

Create `packages/ai/src/tools/analyze-results.ts`:

```typescript
import { tool } from "ai"
import { z } from "zod"
import { analyzeResults as runAnalysis } from "../skills/roaster-insights-skill/scripts/analyzeResults.js"

export const analyzeResults = tool({
  description:
    "Analyze Unlighthouse scan results from the given outputPath. Returns a structured report with scores, Core Web Vitals, failing audits, and worst pages. Always call scanSite first to get the outputPath.",
  inputSchema: z.object({
    outputPath: z
      .string()
      .describe("The output directory path returned by scanSite"),
  }),
  execute: async ({ outputPath }) => {
    try {
      const { report } = await runAnalysis(outputPath)
      return report
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) }
    }
  },
})
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
cd packages/ai && pnpm test
```

Expected: All 4 `analyze-results` tests pass. All `scan-site` tests still pass.

- [ ] **Step 5: Commit**

```bash
git add packages/ai/src/tools/analyze-results.ts packages/ai/src/tools/analyze-results.test.ts
git commit -m "feat(ai): add analyze-results tool"
```

---

## Task 5: Export new tools from `packages/ai`

**Files:**
- Modify: `packages/ai/src/index.ts`

- [ ] **Step 1: Add exports**

Edit `packages/ai/src/index.ts` — replace the entire file:

```typescript
export { discoverSkills } from "./skills/discover-skills.js"
export { scanSite } from "./tools/scan-site.js"
export { analyzeResults } from "./tools/analyze-results.js"
```

- [ ] **Step 2: Run typecheck**

```bash
cd packages/ai && pnpm typecheck
```

Expected: No errors.

- [ ] **Step 3: Run tests — verify nothing broke**

```bash
cd packages/ai && pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/ai/src/index.ts
git commit -m "feat(ai): export scanSite and analyzeResults from package root"
```

---

## Task 6: Wire tools and system prompt into `local-server`

**Files:**
- Modify: `packages/local-server/src/index.ts`

- [ ] **Step 1: Update `local-server/src/index.ts`**

Replace the entire file with:

```typescript
import "dotenv/config"
import { mistral } from "@ai-sdk/mistral"
import { serve } from "@hono/node-server"
import { createSkillTool } from "@roaster/ai/tools/create-skill-tool"
import { discoverSkills, scanSite, analyzeResults } from "@roaster/ai"
import { buildSkillsPrompt } from "@roaster/ai/skills/skills-prompt"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  stepCountIs,
  tool,
  ToolLoopAgent,
  type UIMessage,
} from "ai"
import { z } from "zod"
import { Hono } from "hono"
import { cors } from "hono/cors"

const app = new Hono()

const allowedOrigins = process.env["ALLOWED_ORIGINS"]?.split(",")

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
)

const skillTools = await createSkillTool()
const skills = await discoverSkills()

const getWeather = tool({
  description: "Get the current weather for a city",
  inputSchema: z.object({
    city: z.string().describe("The city name"),
  }),
  execute: async ({ city }) => ({
    city,
    temperature: Math.round(Math.random() * 30 + 10),
    condition: ["sunny", "cloudy", "rainy", "windy"][Math.floor(Math.random() * 4)],
  }),
})

const tools = { ...skillTools, getWeather, scanSite, analyzeResults }

const instructions = `
You are Roaster, a website quality analyst.

When a user asks to analyze, roast, audit, or get feedback on a website:
1. Call scanSite with the URL — wait for the outputPath
2. Call analyzeResults with that outputPath — get the structured report
3. Reason over the report and deliver findings in your persona

If scanSite returns an error, explain the issue to the user with the exact error message and suggest the fix.

${buildSkillsPrompt(skills)}
`.trim()

app.get("/", (c) => {
  return c.text("Hello Hono!")
})

app.post("/api/chat", async (c) => {
  const { messages } = await c.req.json<{
    messages: UIMessage[]
  }>()

  const modelMessages = await convertToModelMessages(messages)

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const agent = new ToolLoopAgent({
        model: mistral("mistral-large-latest"),
        tools,
        instructions,
        stopWhen: stepCountIs(5),
      })

      const result = await agent.stream({
        messages: modelMessages,
      })

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
          onError: (error) => {
            return error instanceof Error ? error.message : String(error)
          },
          originalMessages: messages,
          generateMessageId: generateId,
        })
      )
    },
  })
  return createUIMessageStreamResponse({ stream })
})

serve(
  {
    fetch: app.fetch,
    port: 5002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
```

- [ ] **Step 2: Run typecheck on local-server**

```bash
cd packages/local-server && pnpm typecheck
```

Expected: No errors. If you see `'buildSkillsPrompt' has no exported member` — check that `packages/ai/src/skills/skills-prompt.ts` exports `buildSkillsPrompt` (it does, confirmed in codebase).

- [ ] **Step 3: Start the server and verify it boots without errors**

```bash
cd packages/local-server && pnpm dev
```

Expected output (within a few seconds):

```
Server is running on http://localhost:5002
```

No errors about missing imports, missing tools, or skill discovery failures.

- [ ] **Step 4: Smoke-test the chat endpoint**

With the server running, in another terminal:

```bash
curl -s -X POST http://localhost:5002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"id":"1","role":"user","content":[{"type":"text","text":"Hello, who are you?"}]}]}' \
  | head -c 500
```

Expected: A streaming response with Roaster's persona in the content. No `500` error.

- [ ] **Step 5: Commit**

```bash
git add packages/local-server/src/index.ts
git commit -m "feat(local-server): register scanSite/analyzeResults tools and add Roaster system prompt"
```

---

## Self-Review Checklist

- [x] **Spec § Tool: scan-site** → Task 2 (prereq checks) + Task 3 (scan execution)
- [x] **Spec § Tool: analyze-results** → Task 4
- [x] **Spec § Exports** → Task 5
- [x] **Spec § Local-Server Integration** → Task 6 (tools + instructions + buildSkillsPrompt)
- [x] **Spec § Error Handling** → Both tools return `{ error: string }` and never throw (covered in tests)
- [x] **Spec § Prerequisite checks** → Task 2 tests cover all 3 checks with exact error messages from spec table
- [x] **Spec § Output path strategy** → `deriveOutputPath` tested in Task 3
- [x] No TBDs or placeholders
- [x] Type consistency: `scanSite` / `analyzeResults` used consistently across Tasks 2–6; `deriveOutputPath` exported and tested in same task it is defined
