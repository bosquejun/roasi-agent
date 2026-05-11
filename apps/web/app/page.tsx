import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { SquigglyText } from "@roaster/ui/components/squiggly-text"
import { TypingAnimation } from "@roaster/ui/components/typing-animation"
import { IconFlame, IconWorld } from "@tabler/icons-react"
import { RoasiAnimation } from "@/components/roasi"

export default function Page() {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <BackgroundRippleEffect rows={17} cellSize={32} cols={72} />
      {/* Topnav */}
      <header className="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center border-0 px-6 py-12">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <img src="/roasi-logo.png" alt="Roaster.PH" className="h-22 w-auto" />
          <div className="flex items-center gap-3">
            <Button variant="ghost">Sign In</Button>
            <Button variant="accent">Join Roasters</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mt-52 flex flex-1 flex-col items-center justify-start gap-6 px-4">
        <h1 className="z-10 mx-auto mb-8 max-w-4xl text-center font-bold text-5xl uppercase leading-[1.1] md:text-5xl">
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
