import { Button } from "@roaster/ui/components/button"
import {
  IconBrandGithub,
  IconMessageCircle,
  IconStar,
} from "@tabler/icons-react"
import Link from "next/link"
import { RoasiLogo } from "@/components/shared/RoasiLogo"

export default function MobileTopNav({ stars }: { stars: number | null }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-between md:hidden">
      <RoasiLogo />
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/bosquejun/roasi-agent"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary" size="sm" className="text-[10px]">
            <IconBrandGithub className="size-4" />
            {stars !== null && stars > 0 && (
              <span className="flex items-center gap-1">
                <IconStar className="size-3" />
                {stars.toLocaleString()}
              </span>
            )}
          </Button>
        </a>
        <Link href="/chat">
          <Button variant="accent" size="sm" className="text-[10px]">
            <IconMessageCircle className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
