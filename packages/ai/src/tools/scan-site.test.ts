import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("child_process", () => ({
  execSync: vi.fn(),
  spawnSync: vi.fn(() => ({ status: 0 })),
}))

import { execSync, spawnSync } from "child_process"
import { scanSite } from "./scan-site.js"
import { deriveOutputPath } from "./scan-site.js"

const mockExecSync = vi.mocked(execSync)
const mockSpawnSync = vi.mocked(spawnSync)

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
    mockSpawnSync.mockReturnValue({ status: 0 } as any)
    const execute = scanSite.execute!
    const result = await execute({ url: "https://example.com" }, {} as any)
    expect(result).toEqual({
      outputPath: expect.stringMatching(/^\/tmp\/roaster-[a-f0-9]{8}$/),
    })
  })

  it("outputPath is deterministic for the same URL", async () => {
    setupPrereqs()
    mockSpawnSync.mockReturnValue({ status: 0 } as any)
    const execute = scanSite.execute!
    const r1 = await execute({ url: "https://example.com" }, {} as any)
    const r2 = await execute({ url: "https://example.com" }, {} as any)
    expect((r1 as any).outputPath).toBe((r2 as any).outputPath)
  })

  it("returns error when unlighthouse scan fails", async () => {
    setupPrereqs()
    mockSpawnSync.mockReturnValue({ status: 1 } as any)
    const execute = scanSite.execute!
    const result = await execute({ url: "https://example.com" }, {} as any)
    expect(result).toHaveProperty("error")
  })

  it("calls spawnSync with the correct site URL and output path", async () => {
    setupPrereqs()
    mockSpawnSync.mockReturnValue({ status: 0 } as any)
    const execute = scanSite.execute!
    await execute({ url: "https://example.com" }, {} as any)
    const spawnCall = mockSpawnSync.mock.calls.find(
      ([cmd]) => cmd === "npx"
    )
    expect(spawnCall).toBeDefined()
    expect(spawnCall![1]).toContain("--site")
    expect(spawnCall![1]).toContain("https://example.com")
    expect(spawnCall![1]).toContain("--output-path")
    expect(spawnCall![1]).toContain(deriveOutputPath("https://example.com"))
    expect(spawnCall![1]).toContain("--reporter")
    expect(spawnCall![1]).toContain("jsonExpanded")
  })
})
