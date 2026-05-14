import type { MemoryEntry } from "../types/index.js"

const memoryStore: Map<string, MemoryEntry> = new Map()

export function createMemoryStore() {
  return {
    get: (id: string): MemoryEntry | undefined => memoryStore.get(id),
    set: (entry: MemoryEntry): void => {
      memoryStore.set(entry.id, entry)
    },
    delete: (id: string): boolean => memoryStore.delete(id),
    list: (): MemoryEntry[] => Array.from(memoryStore.values()),
    clear: (): void => memoryStore.clear(),
  }
}

export const memoryService = createMemoryStore()