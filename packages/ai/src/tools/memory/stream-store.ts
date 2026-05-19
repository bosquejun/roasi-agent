/** biome-ignore-all lint/suspicious/noAssignInExpressions: <explanation> */
import { mkdir, readFile, unlink, writeFile } from "fs/promises"
import path from "path"

const MEMORY_DIR = path.join(
  process.env.NODE_ENV === "production" ? "/tmp" : process.cwd(),
  ".workspace",
  ".memory"
)
const ACTIVE_STREAMS_DIR = path.join(MEMORY_DIR, "streams", "active")

// Persist across Next.js HMR by anchoring to global
declare global {
  // eslint-disable-next-line no-var
  var __roasterStreamStore: Map<string, StreamEntry> | undefined
}

const encoder = new TextEncoder()

type StreamEntry = {
  chunks: Uint8Array[]
  done: boolean
  subscribers: Set<ReadableStreamDefaultController<Uint8Array>>
}

const store: Map<string, StreamEntry> = (global.__roasterStreamStore ??=
  new Map())

async function ensureDir() {
  await mkdir(ACTIVE_STREAMS_DIR, { recursive: true })
}

export async function getActiveStreamId(
  chatId: string
): Promise<string | null> {
  if (!chatId) return null
  try {
    const content = await readFile(
      path.join(ACTIVE_STREAMS_DIR, chatId),
      "utf-8"
    )
    return content.trim() || null
  } catch {
    return null
  }
}

export async function setActiveStreamId(
  chatId: string,
  streamId: string | null
): Promise<void> {
  if (!chatId) return
  await ensureDir()
  const file = path.join(ACTIVE_STREAMS_DIR, chatId)
  if (streamId === null) {
    try {
      await unlink(file)
    } catch {}
  } else {
    await writeFile(file, streamId, "utf-8")
  }
}

export function storeStream(
  streamId: string,
  chatId: string
): { write: (chunk: string) => void; end: () => void } {
  const entry: StreamEntry = { chunks: [], done: false, subscribers: new Set() }
  store.set(streamId, entry)

  return {
    write(chunk) {
      const encoded = encoder.encode(chunk)
      entry.chunks.push(encoded)
      for (const ctrl of entry.subscribers) {
        try {
          ctrl.enqueue(encoded)
        } catch {
          entry.subscribers.delete(ctrl)
        }
      }
    },
    end() {
      entry.done = true
      for (const ctrl of entry.subscribers) {
        try {
          ctrl.close()
        } catch {}
      }
      entry.subscribers.clear()
      setActiveStreamId(chatId, null).catch(() => {})
      setTimeout(() => store.delete(streamId), 60_000)
    },
  }
}

export function resumeStream(
  streamId: string
): ReadableStream<Uint8Array> | null {
  const entry = store.get(streamId)
  if (!entry) return null

  let ctrl: ReadableStreamDefaultController<Uint8Array>

  return new ReadableStream<Uint8Array>({
    start(c) {
      ctrl = c
      for (const chunk of entry.chunks) ctrl.enqueue(chunk)
      if (entry.done) {
        ctrl.close()
        return
      }
      entry.subscribers.add(ctrl)
    },
    cancel() {
      entry.subscribers.delete(ctrl)
    },
  })
}
