import { readChatTitle } from "@roaster/ai/tools/memory"
import { readdir, stat } from "fs/promises"
import { NextResponse } from "next/server"
import path from "path"

const CONVERSATIONS_DIR = path.join(process.cwd(), ".memory", "conversations")

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const files = await readdir(CONVERSATIONS_DIR)
    const jsonlFiles = files.filter((f) => f.endsWith(".jsonl"))

    const chats = await Promise.all(
      jsonlFiles.map(async (filename) => {
        const chatId = filename.replace(".jsonl", "")
        const filePath = path.join(CONVERSATIONS_DIR, filename)
        const [title, stats] = await Promise.all([
          readChatTitle(chatId),
          stat(filePath),
        ])
        return {
          id: chatId,
          title: title ?? chatId,
          updatedAt: stats.mtime.toISOString(),
        }
      })
    )

    chats.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return NextResponse.json(chats)
  } catch {
    return NextResponse.json([])
  }
}
