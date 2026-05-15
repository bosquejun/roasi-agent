import { analyzeTool } from "./analyze.js"
import { scanTool } from "./scan.js"

export type { AnalyzeResult, AuditFailure } from "./analyze.js"
export { analyzeTool } from "./analyze.js"
export type { PageReport, ScanResult } from "./scan.js"
export { scanTool } from "./scan.js"

export function getSitewardenTools() {
  return {
    scanSite: scanTool,
    analyzeScanReport: analyzeTool,
  }
}
