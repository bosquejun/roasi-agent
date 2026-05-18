export function isValidUrl(url: string): boolean {
  const trimmed = url.trim()

  if (trimmed.startsWith("http://")) {
    return false
  }

  let urlToCheck = trimmed
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    urlToCheck = `https://${trimmed}`
  }

  try {
    const parsed = new URL(urlToCheck)
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`
  }
  return trimmed
}

export async function resolveRedirects(url: string): Promise<string | null> {
  const normalized = normalizeUrl(url)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(normalized, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const location = response.headers.get("Location")
    if (location) {
      return resolveRedirects(location)
    }

    return normalized
  } catch {
    return null
  }
}

export async function resolveUrl(rawHost: string) {
  const normalizedUrl = normalizeUrl(rawHost)
  let urlHost: string

  try {
    urlHost = new URL(normalizedUrl).hostname
  } catch {
    throw "Invalid Host"
  }

  if (!urlHost.includes(".")) {
    throw "Invalid Host"
  }

  const resolvedUrl = await resolveRedirects(normalizedUrl)

  let finalHost = urlHost
  if (resolvedUrl && resolvedUrl !== normalizedUrl) {
    try {
      const resolvedHost = new URL(resolvedUrl).hostname
      const normalizedResolvedHost = normalizeUrl(resolvedHost).replace(
        "https://",
        ""
      )
      if (normalizedResolvedHost !== urlHost) {
        finalHost = normalizedResolvedHost
      }
    } catch {
      // ignore redirect resolution errors, proceed with valid host
    }
  }

  return {
    host: finalHost,
    url: resolvedUrl,
  }
}
