import { planTool } from "./plan-tool.js"
import { updateStepTool } from "./update-step-tool.js"

export type { Plan, PlanStep } from "./plan-tool.js"
export { planTool } from "./plan-tool.js"
export type { StepUpdate } from "./update-step-tool.js"
export { updateStepTool } from "./update-step-tool.js"

export function getPlanningTools() {
  return { planWorkflow: planTool, updateStep: updateStepTool }
}
