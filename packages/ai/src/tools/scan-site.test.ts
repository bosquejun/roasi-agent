import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("child_process", () => ({
  execSync: vi.fn(),
  spawnSync: vi.fn(() => ({ status: 0 })),
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
  const execute = scanSite.execute!

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns error when Node version is below 18", async () => {
    setupPrereqs({ nodeVersion: "v16.14.0" })
    const result = await execute(
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
    const result = await execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).toEqual({
      error: expect.stringContaining("Node not found"),
    })
  })

  it("returns error when npx is not found", async () => {
    setupPrereqs({ npxFails: true })
    const result = await execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).toEqual({
      error: expect.stringContaining("npx not found"),
    })
  })

  it("returns error when neither Chrome nor Chromium is found", async () => {
    setupPrereqs({ chromeFails: true, chromiumFails: true })
    const result = await execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).toEqual({
      error: expect.stringContaining("Chrome/Chromium not found"),
    })
  })

  it("succeeds when Chromium is found even if Chrome is missing", async () => {
    setupPrereqs({ chromeFails: true, chromiumFails: false })
    const result = await execute(
      { url: "https://example.com" },
      {} as any
    )
    expect(result).not.toHaveProperty("error")
  })
})
