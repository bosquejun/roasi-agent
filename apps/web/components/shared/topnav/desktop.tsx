import { Button } from "@roaster/ui/components/button"
import { IconBrandGithub, IconStar } from "@tabler/icons-react"
import Link from "next/link"
import { RoasiLogo } from "@/components/shared/RoasiLogo"

export default function DesktopTopNav({ stars }: { stars: number | null }) {
  return (
    <div className="mx-auto hidden w-full max-w-5xl items-center justify-between md:flex">
      <RoasiLogo />
      <div className="flex items-center gap-2 md:gap-3">
        <a
          href="https://github.com/bosquejun/roasi-agent"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="secondary"
            size="sm"
            className="text-[10px] md:px-3 md:text-btn-sm"
          >
            <IconBrandGithub className="size-4" />
            <span className="hidden md:inline">Github</span>
            {stars !== null && stars > 0 && (
              <span className="hidden items-center gap-1 md:flex">
                <IconStar className="size-3" />
                {stars.toLocaleString()}
              </span>
            )}
          </Button>
        </a>
        <Link href="/chat">
          <Button
            variant="accent"
            size="sm"
            className="hidden text-[10px] md:block md:px-5"
          >
            Start Chat
          </Button>
        </Link>
      </div>
    </div>
  )
}
