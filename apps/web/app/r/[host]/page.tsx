import { redirect } from "next/navigation"
import { normalizeUrl, resolveUrl } from "@/lib/url"

interface PageProps {
  params: Promise<{ host: string }>
}

export default async function Page({ params }: PageProps) {
  const { host: rawHost } = await params

  const normalizedHost = normalizeUrl(rawHost)

  const { host } = await resolveUrl(rawHost)

  if (normalizeUrl(host) !== normalizedHost) {
    redirect(`/r/${host}`)
  }
}
