import { Button } from "@roaster/ui/components/button"
import { RoasiLogo } from "@/components/roasi"

export default function DesktopTopNav() {
  return (
    <div className="mx-auto hidden w-full max-w-5xl items-center justify-between md:flex">
      <RoasiLogo />
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] md:px-3 md:text-btn-sm"
        >
          <span className="hidden md:inline">Sign In</span>
        </Button>
        <Button
          variant="accent"
          size="sm"
          className="hidden text-[10px] md:block md:px-5"
        >
          Join Roasters
        </Button>
      </div>
    </div>
  )
}
