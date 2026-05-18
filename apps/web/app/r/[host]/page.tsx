import { redirect } from "next/navigation"
import { normalizeUrl, resolveUrl } from "@/lib/url"
import { InvalidUrlDisplay } from "./components/invalid-url-display"
import { RoastPage } from "./components/roast-page"
import TopNav from "@/components/shared/topnav"

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
    return (
      <div className="flex h-svh flex-col">
        <TopNav />
        <InvalidUrlDisplay host={rawHost} />
      </div>
    )
  }

  const normalizedRaw = normalizeUrl(rawHost)
  const normalizedResolved = normalizeUrl(resolvedHost)
  if (normalizedResolved !== normalizedRaw) {
    redirect(`/r/${resolvedHost}`)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <TopNav />
      <main>
        <RoastPage host={resolvedHost} />
      </main>
    </div>
  )
}
