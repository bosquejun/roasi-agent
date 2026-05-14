import { Hono } from "hono"
import type { ChatRequest } from "../types/index.js"
import type { SkillMetadata } from "@roaster/ai/skills/discover-skills"
import { processChatStream } from "../services/ai-stream.js"
import { buildInstructions } from "../lib/skills.js"

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