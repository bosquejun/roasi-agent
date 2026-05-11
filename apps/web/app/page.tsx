import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { IconFlame, IconWorld } from "@tabler/icons-react"
import { RoasiAnimation } from "@/components/roasi"

export default function Page() {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <BackgroundRippleEffect />
      {/* Topnav */}
      <header className="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center border-0 px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <span className="font-pixelated text-fire-red text-xs uppercase tracking-widest">
            Roaster<span className="text-fire-yellow">.PH</span>
          </span>
          <div className="flex items-center gap-3">
            <Button variant="ghost">Sign In</Button>
            <Button variant="accent">Join Roasters</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-center font-pixelated text-4xl uppercase leading-tight tracking-wider">
          YOUR STARTUP IS
          <br />
          PROBABLY TRASH.
        </h1>
        <p className="text-center font-mono text-base text-charcoal">
          Let&apos;s roast it.
        </p>
        <div className="w-full max-w-xl">
          <Input
            placeholder="https://your-sh*t.com"
            prefix={<IconWorld className="size-5" />}
            suffix={
              <Button variant="danger" className="text-[10px] text-white">
                <IconFlame className="size-5" />
                Get Roasted
              </Button>
            }
          />
        </div>
        <p className="text-center font-mono text-slate text-xs">
          No signup needed. Just a URL.
        </p>
      </main>

      <RoasiAnimation />
    </div>
  )
}
