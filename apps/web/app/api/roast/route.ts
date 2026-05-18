import { appendConversation } from "@roaster/ai/tools/memory"
import type { UIMessage } from "ai"
import type { NextRequest } from "next/server"
import { createChatStream } from "../chat/service"
import roastInstructions from "./instructions"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { message, id } = (await req.json()) as Awaited<{
    message: UIMessage
    id: string
  }>

  const stream = await createChatStream(
    [message],
    [],
    roastInstructions,
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
