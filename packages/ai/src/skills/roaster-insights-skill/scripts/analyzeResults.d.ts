export interface CategoryAverage {
  label: string
  score: number | null
  raw: number | null
  rating: string
}

export interface CwvAverage {
  value: number
  display: string
  rating: string | null
  good: string
  poor: string
}

export interface WorstPage {
  url: string
  score: number | null
  rating: string
}

export interface FailingAudit {
  id: string
  title: string
  description: string
  affectedPages: number
  affectedPercent: number
  worstScore: number | null
  urls: string[]
}

export interface AnalysisReport {
  source: string
  totalPages: number
  categoryAverages: Record<string, CategoryAverage>
  cwvAverages: Record<string, CwvAverage>
  worstPages: WorstPage[]
  failingAudits: FailingAudit[]
  perfectPages: string[]
}

export function analyzeResults(outputDir: string): Promise<{
  report: AnalysisReport
  markdown: string
}>
