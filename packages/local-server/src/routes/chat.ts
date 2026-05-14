import type { SkillMetadata } from "@roaster/ai/tools/skills"
import { Hono } from "hono"
import { buildInstructions } from "../lib/skills.js"
import { processChatStream } from "../services/ai-stream.js"
import type { ChatRequest } from "../types/index.js"

export function createChatRouter(skills: SkillMetadata[]) {
  const chat = new Hono()

  const instructions = buildInstructions(skills)

  chat.post("/", async (c) => {
    const { messages } = await c.req.json<ChatRequest>()

    const stream = await processChatStream(messages, skills, instructions)

    return stream
  })

  return chat
}
