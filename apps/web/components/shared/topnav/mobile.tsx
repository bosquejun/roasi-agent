import { Button } from "@roaster/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@roaster/ui/components/popover"
import { cn } from "@roaster/ui/lib/utils"
import { IconMenu } from "@tabler/icons-react"
import { RoasiLogo } from "@/components/roasi"

export default function MobileTopNav() {
  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-between md:hidden">
      <RoasiLogo />
      <div className="flex items-center gap-2 md:gap-3">
        <Popover>
          <PopoverTrigger
            className={cn([
              "border-[3px] border-foreground bg-card p-1 text-black shadow-neo-md",
              "hover:shadow-neo-lg",
              "disabled:border-stone disabled:bg-smoke disabled:text-stone disabled:shadow-none",
            ])}
          >
            <IconMenu />
          </PopoverTrigger>
          <PopoverContent className="mt-1 flex border-[3px] border-foreground shadow-neo-md md:hidden">
            <Button variant="secondary" className="shadow-neo-sm">
              Sign in
            </Button>
            <Button variant="accent" className="shadow-neo-sm">
              Join Roasters
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
