import { redirect } from "next/navigation"
import { InvalidUrlDisplay, RoastPage } from "@/components/features/roast"
import { normalizeUrl, resolveUrl } from "@/lib/url"

interface PageProps {
  params: Promise<{ host: string }>
}

export default async function Page({ params }: PageProps) {
  const { host: rawHost } = await params

  let resolvedHost: string
  try {
    const { host } = await resolveUrl(rawHost)
    resolvedHost = host
  } catch {
    return <InvalidUrlDisplay host={rawHost} title="Invalid URL" />
  }

  const normalizedRaw = normalizeUrl(rawHost)
  const normalizedResolved = normalizeUrl(resolvedHost)
  if (normalizedResolved !== normalizedRaw) {
    redirect(`/r/${resolvedHost}`)
  }

  return <RoastPage host={resolvedHost} />
}
