import { cachedModel } from "@roaster/ai/model"
import { scrapeSiteTool } from "@roaster/ai/tools/roast-site"
import { roastMetricsTool } from "@roaster/ai/tools/roast-metrics"
import { isLoopFinished, ToolLoopAgent } from "ai"
import { ROAST_PROMPT } from "./prompts/roast"

export const roastAgent = async () => {
  const agent = new ToolLoopAgent({
    model: cachedModel,
    tools: { scrapeSiteTool, roastMetricsTool },
    instructions: ROAST_PROMPT,
    stopWhen: isLoopFinished(),
  })

  return agent
}
