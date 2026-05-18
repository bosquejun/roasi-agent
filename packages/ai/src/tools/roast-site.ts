import Firecrawl from "@mendable/firecrawl-js"
import { tool } from "ai"
import { z } from "zod"
import { supabase } from "../lib/supabase"

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY! })

export class UnsupportedSiteError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UnsupportedSiteError"
  }
}

export const getScrapeSiteCacheKey = (url: string) =>
  `${new URL(url).host}:scrape-data`

export async function scrapeSite(url: string) {
  const cacheKey = getScrapeSiteCacheKey(url)

  const { data: cached } = await supabase
    .from("scrape_cache")
    .select("data")
    .eq("cache_key", cacheKey)
    .single()

  if (cached) return cached.data

  try {
    const scrapeResponse = await firecrawl.scrape(url, {
      formats: ["markdown"],
    })

    const { error } = await supabase
      .from("scrape_cache")
      .upsert({ cache_key: cacheKey, data: scrapeResponse })
    if (error) console.error("[scrape_cache] upsert failed:", error.message)

    return scrapeResponse
  } catch (error) {
    if (error instanceof UnsupportedSiteError) throw error
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.toLowerCase().includes("do not support this site")
    ) {
      throw new UnsupportedSiteError(
        "This site cannot be scraped. Try a different URL."
      )
    }
    throw error
  }
}

export const scrapeSiteTool = tool({
  execute: async ({ url }) => {
    const result = await scrapeSite(url)
    return result
  },
  inputSchema: z.object({
    url: z.string().url(),
  }),
  description: "Scrape site data",
})
