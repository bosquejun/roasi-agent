import "dotenv/config"
import { mistral } from "@ai-sdk/mistral"
import { serve } from "@hono/node-server"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai"
import { Hono } from "hono"
import { cors } from "hono/cors"

const app = new Hono()

app.use(
  "*",
  cors({
    origin: ["http://localhost:5051", "http://localhost:5173"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
)

app.get("/", (c) => {
  return c.text("Hello Hono!")
})

app.post("/api/chat", async (c) => {
  const { messages } = await c.req.json<{
    messages: UIMessage[]
  }>()

  const modelMessages = await convertToModelMessages(messages)

  // immediately start streaming the response
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" })

      writer.write({
        type: "data-custom",
        data: {
          custom: "Hello, world!",
        },
      })

      const result = streamText({
        model: mistral("mistral-large-latest"),
        messages: modelMessages,
      })

      writer.merge(
        result.toUIMessageStream({
          sendStart: false,
          sendReasoning: true,
          sendSources: true,
          onError: (error) => {
            // Error messages are masked by default for security reasons.
            // If you want to expose the error message to the client, you can do so here:
            return error instanceof Error ? error.message : String(error)
          },
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
