import { tool } from 'ai'
import { z } from 'zod'

export interface StepUpdate {
  type: 'step-update'
  stepId: string
  status: 'in_progress' | 'done' | 'error' | 'skipped'
  summary?: string
}

export const updateStepTool = tool({
  description:
    'Update the status of a step declared by the plan tool. ' +
    'Call with status="in_progress" when starting a step, then again with "done", "error", or "skipped" when it finishes. ' +
    'The UI patches the matching step in the task list — never repeats the information as plain text.',
  inputSchema: z.object({
    stepId: z.string().describe('Must match an id from the plan tool call'),
    status: z.enum(['in_progress', 'done', 'error', 'skipped']),
    summary: z.string().optional().describe('One-line result or error shown beneath the step label'),
  }),
  execute: async ({ stepId, status, summary }): Promise<StepUpdate> => ({
    type: 'step-update',
    stepId,
    status,
    summary,
  }),
})
