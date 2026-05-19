import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Roasi",
    short_name: "Roasi",
    description: "Brutal AI roasts of startup landing pages. No mercy.",
    start_url: "/",
    display: "standalone",
    background_color: "#F0F0EC",
    theme_color: "#E8231B",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/roasi-brand.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
