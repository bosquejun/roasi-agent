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
    const execute = analyzeResults.execute!
    const result = await execute({ outputPath: "/tmp/roaster-abc123" }, {} as any)
    expect(result).toEqual(mockReport)
  })

  it("returns error when outputPath does not exist", async () => {
    mockRunAnalysis.mockRejectedValue(
      new Error("No Lighthouse result files found in /tmp/roaster-abc123.")
    )
    const execute = analyzeResults.execute!
    const result = await execute({ outputPath: "/tmp/roaster-abc123" }, {} as any)
    expect(result).toEqual({
      error: expect.stringContaining("No Lighthouse result files found"),
    })
  })

  it("returns error when analyzeResults throws a non-Error", async () => {
    mockRunAnalysis.mockRejectedValue("unexpected failure")
    const execute = analyzeResults.execute!
    const result = await execute({ outputPath: "/tmp/roaster-abc123" }, {} as any)
    expect(result).toEqual({ error: "unexpected failure" })
  })

  it("passes outputPath to the underlying analyzeResults function", async () => {
    mockRunAnalysis.mockResolvedValue({ report: mockReport, markdown: "" })
    const execute = analyzeResults.execute!
    await execute({ outputPath: "/tmp/roaster-xyz" }, {} as any)
    expect(mockRunAnalysis).toHaveBeenCalledWith("/tmp/roaster-xyz")
  })
})
