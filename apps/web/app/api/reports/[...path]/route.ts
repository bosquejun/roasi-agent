import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"

const REPORTS_DIR = path.join(process.cwd(), ".reports")

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const filePath = path.join(REPORTS_DIR, ...segments)

  // Prevent path traversal
  if (!filePath.startsWith(REPORTS_DIR)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  try {
    const file = await readFile(filePath)
    const ext = path.extname(filePath)
    const contentType =
      ext === ".html"
        ? "text/html"
        : ext === ".json"
          ? "application/json"
          : "application/octet-stream"

    return new NextResponse(file, {
      headers: { "Content-Type": contentType },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
