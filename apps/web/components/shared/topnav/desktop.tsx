import { Button } from "@roaster/ui/components/button"
import Link from "next/link"
import { RoasiLogo } from "@/components/shared/RoasiLogo"

export default function DesktopTopNav() {
  return (
    <div className="mx-auto hidden w-full max-w-5xl items-center justify-between md:flex">
      <RoasiLogo />
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="text-[10px] md:px-3 md:text-btn-sm"
        >
          <span className="hidden md:inline">Github</span>
        </Button>
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
