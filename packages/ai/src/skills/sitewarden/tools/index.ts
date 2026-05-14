import { analyzeTool } from "./analyze.js"
import { fixTool } from "./fix.js"
import { scanTool } from "./scan.js"
import { verifyTool } from "./verify.js"

export type { AnalyzeResult, AuditFailure } from "./analyze.js"
export { analyzeTool } from "./analyze.js"
export type { FixResult } from "./fix.js"
export { fixTool } from "./fix.js"
export type { PageReport, ScanResult } from "./scan.js"
export { scanTool } from "./scan.js"
export type { VerifyResult } from "./verify.js"
export { verifyTool } from "./verify.js"

export function getSitewardenTools() {
  return {
    scanSite: scanTool,
    analyzeScanReport: analyzeTool,
    fixAuditFailure: fixTool,
    verifySiteFix: verifyTool,
  }
}
