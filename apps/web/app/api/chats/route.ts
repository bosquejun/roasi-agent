import { listChats } from "@roaster/ai/tools/memory"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const chats = await listChats()
  return NextResponse.json(
    chats.map((c) => ({ id: c.id, title: c.title ?? c.id, updatedAt: c.updatedAt }))
  )
}
