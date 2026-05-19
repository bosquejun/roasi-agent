import { Button } from "@roaster/ui/components/button"
import Link from "next/link"
import { RoasiLogo } from "@/components/shared/RoasiLogo"
import { isChatEnabled } from "@/lib/features"

export default function MobileTopNav() {
  const chatEnabled = isChatEnabled()

  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-between md:hidden">
      <RoasiLogo />
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" className="text-[10px]">
          Github
        </Button>
        {chatEnabled && (
          <Link href="/chat">
            <Button variant="accent" size="sm" className="text-[10px]">
              Start Chat
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
