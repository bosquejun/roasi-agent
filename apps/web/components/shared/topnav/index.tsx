import DesktopTopNav from "./desktop"
import MobileTopNav from "./mobile"

async function fetchGithubStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/bosquejun/roasi-agent", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { stargazers_count: number }
    return data.stargazers_count
  } catch {
    return null
  }
}

export default async function TopNav() {
  const stars = await fetchGithubStars()

  return (
    <header className="absolute top-0 z-50 flex h-24 w-full shrink-0 items-center border-0 px-4 py-4 md:mt-4 md:px-6">
      <DesktopTopNav stars={stars} />
      <MobileTopNav stars={stars} />
    </header>
  )
}
