import { planTool } from "./plan-tool"
import { updateStepTool } from "./update-step-tool"

export type { Plan, PlanStep } from "./plan-tool"
export { planTool } from "./plan-tool"
export type { StepUpdate } from "./update-step-tool"
export { updateStepTool } from "./update-step-tool"

export function getPlanningTools() {
  return { planWorkflow: planTool, updateStep: updateStepTool }
}
