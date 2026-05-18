import {
  getActiveStreamId,
  resumeStream,
  setActiveStreamId,
} from "@roaster/ai/tools/memory"
import { UI_MESSAGE_STREAM_HEADERS } from "ai"

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const activeStreamId = await getActiveStreamId(id)

  if (!activeStreamId) {
    return new Response(null, { status: 204 })
  }

  const stream = resumeStream(activeStreamId)

  if (!stream) {
    // Stale record — process restarted after the stream was created
    await setActiveStreamId(id, null)
    return new Response(null, { status: 204 })
  }

  return new Response(stream, { headers: UI_MESSAGE_STREAM_HEADERS })
}
