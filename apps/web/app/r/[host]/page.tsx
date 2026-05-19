import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { InvalidUrlDisplay, RoastPage } from "@/components/features/roast"
import { normalizeUrl, resolveUrl } from "@/lib/url"

interface PageProps {
  params: Promise<{ host: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { host } = await params
  const decoded = decodeURIComponent(host)
  const title = `Roasting ${decoded}`
  const description = `Brutal AI roast of ${decoded} — cringe score, delusion index, audacity level, and more. No mercy.`
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Roasi`,
      description,
      url: `/r/${host}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Roasi`,
      description,
    },
  }
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
