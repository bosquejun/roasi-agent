import { analyzeTool } from "./analyze"
import { scanTool } from "./scan"

export type { AnalyzeResult, AuditFailure } from "./analyze"
export { analyzeTool } from "./analyze"
export type { PageReport, ScanResult } from "./scan"
export { scanTool } from "./scan"

export function getSitewardenTools() {
  return {
    scanSite: scanTool,
    analyzeScanReport: analyzeTool,
  }
}
