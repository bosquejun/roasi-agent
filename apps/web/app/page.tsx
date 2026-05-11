import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { SquigglyText } from "@roaster/ui/components/squiggly-text"
import { TypingAnimation } from "@roaster/ui/components/typing-animation"
import { IconFlame, IconWorld } from "@tabler/icons-react"
import { RoasiAnimation, RoasiLogo } from "@/components/roasi"

export default function Page() {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <BackgroundRippleEffect rows={17} cellSize={32} cols={72} />
      {/* Topnav */}
      <header className="sticky top-0 z-10 mt-2 flex h-24 w-full shrink-0 items-center border-0 px-4 py-4 md:mt-4 md:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <RoasiLogo />
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] md:px-3 md:text-btn-sm"
            >
              Sign In
            </Button>
            <Button variant="accent" size="sm" className="text-[10px] md:px-5">
              Join Roasters
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mt-24 flex flex-1 flex-col items-center justify-start gap-4 px-3 md:mt-52 md:gap-6 md:px-4">
        <h1 className="z-10 mx-auto mb-6 max-w-4xl text-center font-bold text-2xl uppercase leading-[1.15] md:mb-8 md:text-4xl md:leading-[1.1] lg:text-5xl">
          Your{" "}
          <TypingAnimation
            loop
            words={["Startup", "Portfolio"]}
            pauseDelay={7000}
            className="text-fire-orange"
          />{" "}
          is probably{" "}
          <SquigglyText
            stepDuration={90}
            scale={[6, 9]}
            className="text-fire-red"
          >
            trash
          </SquigglyText>{" "}
          Let&apos;s <span className="text-fire-yellow">fix</span> it.
        </h1>
        <div className="z-10 w-full max-w-xl">
          <Input
            placeholder="https://your-sh*t.com"
            prefix={<IconWorld className="size-4 md:size-5" />}
            suffix={
              <Button
                variant="danger"
                size="sm"
                className="text-[9px] text-white md:text-[10px]"
              >
                <IconFlame className="size-4 md:size-5" />
                <span className="hidden sm:inline">Get Roasted</span>
                <span className="sm:hidden">Roast</span>
              </Button>
            }
            className="text-sm md:text-base"
          />
        </div>
        <p className="text-center font-mono text-[10px] text-slate md:text-xs">
          No signup needed. Just a URL.
        </p>
      </main>

      <RoasiAnimation />
    </div>
  )
}
