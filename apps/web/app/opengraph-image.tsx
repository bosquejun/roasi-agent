import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const logoBuffer = await readFile(
    path.join(process.cwd(), "public", "roasi-logo-brand.png")
  )
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F0F0EC",
        position: "relative",
        fontFamily: "monospace",
      }}
    >
      {/* Pixel grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(10,10,10,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,10,0.06) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          display: "flex",
        }}
      />

      {/* Outer neo-brutal border */}
      <div
        style={{
          position: "absolute",
          inset: 32,
          border: "5px solid #0A0A0A",
          boxShadow: "8px 8px 0 #0A0A0A",
          display: "flex",
        }}
      />

      {/* Fire-red top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 32,
          right: 32,
          height: 12,
          backgroundColor: "#E8231B",
          display: "flex",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          position: "relative",
          zIndex: 1,
          padding: "0 80px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="Roasi"
          width={480}
          height={160}
          style={{ imageRendering: "pixelated", objectFit: "contain" }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 28,
              color: "#E8231B",
              letterSpacing: "0.04em",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Your website is getting roasted tonight.
          </span>
        </div>
      </div>

      {/* Fire-orange bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 32,
          right: 32,
          height: 8,
          backgroundColor: "#F47820",
          display: "flex",
        }}
      />
    </div>,
    { ...size }
  )
}
