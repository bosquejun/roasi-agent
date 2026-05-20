/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { readFile } from "node:fs/promises"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"
import { ImageResponse } from "next/og"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

interface Props {
  params: Promise<{ host: string }>
}

const SUPPORTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
])

async function fetchFaviconAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    const mimeType =
      res.headers.get("content-type")?.split(";")?.[0]?.trim() ?? "image/png"
    if (!SUPPORTED_MIME_TYPES.has(mimeType)) return null
    const buf = await res.arrayBuffer()
    return `data:${mimeType};base64,${Buffer.from(buf).toString("base64")}`
  } catch {
    return null
  }
}

interface RoastMetrics {
  cringeScore: number
  delusionIndex: number
  audacityLevel: number
  embarrassmentRadius: number
}

export default async function Image({ params }: Props) {
  const { host } = await params

  const templatePath = path.join(process.cwd(), "public", "og-template.png")
  const templateBuffer = await readFile(templatePath)
  const templateSrc = `data:image/png;base64,${templateBuffer.toString("base64")}`

  let faviconSrc: string | null = null
  let roastMetrics: RoastMetrics | null = null

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Try cached favicon from Supabase scrape_cache
  try {
    const cacheKey = `${host}:scrape-data`
    const { data: cached } = await supabase
      .from("scrape_cache")
      .select("data")
      .eq("cache_key", cacheKey)
      .single()

    const faviconUrl = cached?.data?.metadata?.favicon as string | undefined

    if (faviconUrl) {
      faviconSrc = await fetchFaviconAsBase64(faviconUrl)
      console.log(
        "[og] cached favicon fetch result:",
        faviconSrc ? "ok" : "null"
      )
    }
  } catch {}

  // Try cached roast metrics
  try {
    const { data: metricsRow } = await supabase
      .from("scrape_cache")
      .select("data")
      .eq("cache_key", `${host}:roast-metrics`)
      .single()

    if (metricsRow?.data) {
      roastMetrics = metricsRow.data as RoastMetrics
    }
  } catch {}

  // Fall back to Google favicon service
  if (!faviconSrc) {
    faviconSrc = await fetchFaviconAsBase64(
      `https://www.google.com/s2/favicons?domain=${host}&sz=128`
    )
  }

  const faviconSize = 123
  const faviconLeft = 588 - faviconSize / 2
  const faviconTop = 380 - faviconSize / 2

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: 1200,
        height: 630,
        display: "flex",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={templateSrc}
        alt=""
        width={1200}
        height={630}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          objectFit: "cover",
        }}
      />
      {faviconSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={faviconSrc}
          alt={host}
          width={faviconSize}
          height={faviconSize}
          style={{
            position: "absolute",
            left: faviconLeft,
            top: faviconTop,
            width: faviconSize + 5,
            height: faviconSize,
            borderRadius: 24,
            filter: "sepia(1) hue-rotate(320deg) saturate(4) brightness(0.55)",
            imageRendering: "pixelated",
          }}
        />
      )}
      {/* URL bar — always shown */}
      <div
        style={{
          position: "absolute",
          left: 352,
          top: 536,
          width: 500,
          height: 52,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#F0DEC0",
            letterSpacing: 1,
          }}
        >
          {host}
        </span>
      </div>
      {/* Score values in card boxes */}
      {([381, 524, 669, 812] as number[]).map((cx, i) => {
        const values = roastMetrics
          ? [
              roastMetrics.cringeScore,
              roastMetrics.delusionIndex,
              roastMetrics.audacityLevel,
              roastMetrics.embarrassmentRadius,
            ]
          : null
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - 50,
              top: 493,
              width: 100,
              height: 40,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: values ? 28 : 32,
                fontWeight: 900,
                color: values ? "#5C1A00" : "#8B2500",
                opacity: values ? 1 : 0.5,
              }}
            >
              {values ? values[i] : "?"}
            </span>
          </div>
        )
      })}
    </div>,
    { ...size }
  )
}
