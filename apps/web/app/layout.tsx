import type { Metadata, Viewport } from "next"
import { Press_Start_2P, Space_Mono } from "next/font/google"

import "@roaster/ui/globals.css"
import { cn } from "@roaster/ui/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://roasi.junbosque.com"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Roasi — Your website is getting roasted tonight.",
    template: "%s | Roasi",
  },
  description:
    "Paste your startup URL and get a brutal, no-mercy AI roast of your landing page. No signup needed. Just a URL.",
  keywords: [
    "startup roast",
    "landing page feedback",
    "AI roast",
    "startup feedback",
    "landing page review",
    "startup critique",
  ],
  authors: [{ name: "Roasi" }],
  creator: "Roasi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Roasi",
    title: "Roasi — Roasi — Your website is getting roasted tonight.",
    description:
      "Paste your startup URL and get a brutal, no-mercy AI roast of your landing page. No signup needed. Just a URL.",
    images: [
      { url: "/og-template.png", width: 1200, height: 630, alt: "Roasi" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roasi — Roasi — Your website is getting roasted tonight.",
    description:
      "Paste your startup URL and get a brutal, no-mercy AI roast of your landing page. No signup needed. Just a URL.",
    images: ["/og-template.png"],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#E8231B",
  colorScheme: "light dark",
}

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
})

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", pressStart2P.variable, spaceMono.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
