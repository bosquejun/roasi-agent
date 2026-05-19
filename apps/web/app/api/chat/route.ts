import { appendConversation, readConversations } from "@roaster/ai/tools/memory"
import type { SkillMetadata } from "@roaster/ai/tools/skills"
import type { UIMessage } from "ai"
import type { NextRequest } from "next/server"
import { isChatEnabled } from "@/lib/features"
import { verifyTurnstile } from "@/lib/turnstile"
import { buildInstructions } from "./instructions"
import { createChatStream } from "./service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  if (!isChatEnabled()) {
    return new Response("Not Found", { status: 404 })
  }

  const skills: SkillMetadata[] = []
  const instructions = buildInstructions(skills)

  const { message, id } = (await req.json()) as {
    message: UIMessage
    id: string
  }
  const turnstileToken = req.headers.get("x-turnstile-token")

  const history = await readConversations(id)

  if (history.length === 0) {
    if (!turnstileToken) {
      return new Response("Missing verification token", { status: 403 })
    }
    try {
      await verifyTurnstile(turnstileToken)
    } catch {
      return new Response("Verification failed", { status: 403 })
    }
  }

  await appendConversation({
    role: message.role,
    parts: message.parts,
    timestamp: new Date().toISOString(),
    id,
  })

  const fullMessages = [...history, message]

  const stream = await createChatStream(
    fullMessages,
    skills,
    instructions,
    id,
    history.length === 0,
    async (parts) => {
      await appendConversation({
        role: "assistant",
        parts,
        timestamp: new Date().toISOString(),
        id,
      })
    }
  )

  return stream
}
