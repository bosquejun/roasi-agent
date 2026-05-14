import { RoasiAnimation } from "@roaster/sprite-animations/components/roasi/RoasiAnimation"
import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { TypingAnimation } from "@roaster/ui/components/typing-animation"
import { IconFlame, IconWorld } from "@tabler/icons-react"
import TopNav from "@/components/shared/topnav"

export default function Page() {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <BackgroundRippleEffect rows={17} cellSize={32} cols={72} />
      {/* Topnav */}
      <TopNav />

      {/* Hero */}
      <main className="mt-24 flex flex-1 flex-col items-center justify-start gap-4 px-3 md:mt-52 md:gap-6 md:px-4">
        <h1 className="z-10 mx-auto mb-6 max-w-4xl text-center font-bold text-2xl uppercase leading-[1.3] md:mb-8 md:text-4xl md:leading-[1.15] md:leading-[1.1] lg:text-5xl">
          Your{" "}
          <TypingAnimation
            loop
            words={["Startup", "Portfolio"]}
            pauseDelay={7000}
            className="h-12 text-fire-orange"
          />{" "}
          is probably <span className="text-fire-red">tr🗑️sh</span>. Let&apos;s{" "}
          <span className="text-fire-yellow">fix</span> it.
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

      <RoasiAnimation className="fixed inset-0 -z-[9999]" />
    </div>
  )
}
