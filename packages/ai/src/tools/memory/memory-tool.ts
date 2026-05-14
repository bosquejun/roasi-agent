import { tool } from "ai"
import { appendFile, mkdir, readFile, writeFile } from "fs/promises"
import path from "path"
import { z } from "zod"

const MEMORY_DIR = path.join(process.cwd(), ".memory")
const CORE_FILE = path.join(MEMORY_DIR, "core.md")
const NOTES_FILE = path.join(MEMORY_DIR, "notes.md")
const CONVERSATIONS_FILE = path.join(MEMORY_DIR, "conversations.jsonl")

async function ensureDir() {
  await mkdir(MEMORY_DIR, { recursive: true })
}

export async function readCoreMemory(): Promise<string> {
  try {
    return await readFile(CORE_FILE, "utf-8")
  } catch {
    return ""
  }
}

export const memoryTool = tool({
  description: `Manage persistent memory across conversations.
Actions:
- view_core: Read the core memory injected into every turn
- update_core: Replace core memory with new content (key facts about the user/project)
- add_note: Append a timestamped note to archival storage
- search_notes: Search archival notes by keyword
- save_conversation: Log a summary of the current conversation`,
  inputSchema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("view_core"),
    }),
    z.object({
      action: z.literal("update_core"),
      content: z.string().describe("New core memory content (markdown)"),
    }),
    z.object({
      action: z.literal("add_note"),
      note: z.string().describe("Note to append to archival storage"),
    }),
    z.object({
      action: z.literal("search_notes"),
      query: z.string().describe("Keyword to search in archival notes"),
    }),
    z.object({
      action: z.literal("save_conversation"),
      summary: z.string().describe("Brief summary of the conversation"),
    }),
  ]),
  execute: async (input) => {
    await ensureDir()

    switch (input.action) {
      case "view_core": {
        const content = await readCoreMemory()
        return { content: content || "(empty)" }
      }
      case "update_core": {
        await writeFile(CORE_FILE, input.content, "utf-8")
        return { success: true }
      }
      case "add_note": {
        const timestamp = new Date().toISOString()
        await appendFile(
          NOTES_FILE,
          `\n## ${timestamp}\n${input.note}\n`,
          "utf-8"
        )
        return { success: true }
      }
      case "search_notes": {
        try {
          const notes = await readFile(NOTES_FILE, "utf-8")
          const query = input.query.toLowerCase()
          const matches = notes
            .split("\n")
            .filter((line) => line.toLowerCase().includes(query))
            .join("\n")
          return { matches: matches || "(no matches)" }
        } catch {
          return { matches: "(no notes yet)" }
        }
      }
      case "save_conversation": {
        const entry =
          JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: input.summary,
          }) + "\n"
        await appendFile(CONVERSATIONS_FILE, entry, "utf-8")
        return { success: true }
      }
    }
  },
})

export async function appendConversation(entry: {
  role: "user" | "assistant"
  parts: unknown[]
  timestamp: string
}): Promise<void> {
  await ensureDir()
  await appendFile(CONVERSATIONS_FILE, `${JSON.stringify(entry)}\n`, "utf8")
}

export async function readConversations(): Promise<
  Array<{ role: "user" | "assistant"; parts: unknown[]; timestamp: string }>
> {
  try {
    const raw = await readFile(CONVERSATIONS_FILE, "utf-8")
    return raw
      .split("\n")
      .filter(Boolean)
      .flatMap((line) => {
        try {
          const entry = JSON.parse(line)
          if (entry.role && entry.parts) return [entry]
          return []
        } catch {
          return []
        }
      })
  } catch {
    return []
  }
}
