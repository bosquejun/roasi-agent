import "dotenv/config"
import { mistral } from "@ai-sdk/mistral"
import { serve } from "@hono/node-server"
import { createSkillTool } from "@roaster/ai/tools/create-skill-tool"
import { discoverSkills, scanSite, analyzeResults } from "@roaster/ai"
import { buildSkillsPrompt } from "@roaster/ai/skills/skills-prompt"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  stepCountIs,
  tool,
  ToolLoopAgent,
  type UIMessage,
} from "ai"
import { z } from "zod"
import { Hono } from "hono"
import { cors } from "hono/cors"

const app = new Hono()

const allowedOrigins = process.env["ALLOWED_ORIGINS"]?.split(",")

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
)

const skillTools = await createSkillTool()
const skills = await discoverSkills()

const getWeather = tool({
  description: "Get the current weather for a city",
  inputSchema: z.object({
    city: z.string().describe("The city name"),
  }),
  execute: async ({ city }) => ({
    city,
    temperature: Math.round(Math.random() * 30 + 10),
    condition: ["sunny", "cloudy", "rainy", "windy"][Math.floor(Math.random() * 4)],
  }),
})

const tools = { ...skillTools, getWeather, scanSite, analyzeResults }

const instructions = `
You are Roaster, a website quality analyst.

When a user asks to analyze, roast, audit, or get feedback on a website:
1. Call scanSite with the URL — wait for the outputPath
2. Call analyzeResults with that outputPath — get the structured report
3. Reason over the report and deliver findings in your persona

If scanSite returns an error, explain the issue to the user with the exact error message and suggest the fix.

${buildSkillsPrompt(skills)}
`.trim()

app.get("/", (c) => {
  return c.text("Hello Hono!")
})

app.post("/api/chat", async (c) => {
  const { messages } = await c.req.json<{
    messages: UIMessage[]
  }>()

  const modelMessages = await convertToModelMessages(messages)

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const agent = new ToolLoopAgent({
        model: mistral("mistral-large-latest"),
        tools,
        instructions,
        stopWhen: stepCountIs(5),
      })

      const result = await agent.stream({
        messages: modelMessages,
      })

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
          onError: (error) => {
            return error instanceof Error ? error.message : String(error)
          },
          originalMessages: messages,
          generateMessageId: generateId,
        })
      )
    },
  })
  return createUIMessageStreamResponse({ stream })
})

serve(
  {
    fetch: app.fetch,
    port: 5002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
