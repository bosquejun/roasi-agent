export interface AnalyzeResultsOutput {
  report: {
    source: string
    totalPages: number
    categoryAverages: Record<
      string,
      {
        label: string
        score: number
        raw: number
        rating: string
      }
    >
    cwvAverages: Record<
      string,
      {
        value: number
        display: string
        rating: string
        good: string
        poor: string
      }
    >
    worstPages: Array<{
      url: string
      score: number
      rating: string
    }>
    failingAudits: Array<{
      id: string
      title: string
      description: string
      affectedPages: number
      affectedPercent: number
      worstScore: number
      urls: string[]
    }>
    perfectPages: string[]
  }
  markdown: string
}

export async function analyzeResults(outputDir: string): Promise<AnalyzeResultsOutput>