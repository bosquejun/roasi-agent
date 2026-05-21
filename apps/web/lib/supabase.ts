import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function hasBeenRoasted(host: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("scrape_cache")
      .select("cache_key")
      .eq("cache_key", `${host}:scrape-data`)
      .maybeSingle()

    return data !== null
  } catch (err) {
    console.error("[hasBeenRoasted] supabase lookup failed:", err)
    return false
  }
}
