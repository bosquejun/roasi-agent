import { tool } from 'ai'
import { z } from 'zod'

const stepSchema = z.object({
  id: z.string().describe('Unique step identifier'),
  label: z.string().describe('Human-readable step label'),
  description: z.string().optional().describe('Extra context shown below the label'),
})

export type PlanStep = z.infer<typeof stepSchema> & {
  status: 'pending' | 'in_progress' | 'done' | 'error' | 'skipped'
  summary?: string
}

export interface Plan {
  type: 'plan'
  title: string
  steps: PlanStep[]
}

export const planTool = tool({
  description:
    'Declare a multi-step workflow as a structured task list before executing it. ' +
    'Call this first so the UI can render a task list instead of plain text. ' +
    'Then use updateStep to mark each step as it starts or finishes.',
  inputSchema: z.object({
    title: z.string().describe('Short title for this task run'),
    steps: z.array(stepSchema).min(1),
  }),
  execute: async ({ title, steps }): Promise<Plan> => ({
    type: 'plan',
    title,
    steps: steps.map((s) => ({ ...s, status: 'pending' })),
  }),
})
