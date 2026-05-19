import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://roasi.junbosque.com"
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/chat", "/chat/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
