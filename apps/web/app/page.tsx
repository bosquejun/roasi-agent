import { RoasiAnimation } from "@roaster/sprite-animations/components/roasi/RoasiAnimation"
import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import { TypingAnimation } from "@roaster/ui/components/typing-animation"
import TopNav from "@/components/shared/topnav"
import { RoastForm } from "@/app/components/roast-form"
import { isChatEnabled } from "@/lib/features"

export default function Page() {
  const chatEnabled = isChatEnabled()

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <BackgroundRippleEffect rows={17} cellSize={32} cols={72} />
      <TopNav />

      <main className="mt-24 flex flex-1 flex-col items-center justify-start gap-4 px-3 md:mt-52 md:gap-6 md:px-4">
        <h1 className="z-10 mx-auto mb-6 max-w-4xl text-center font-bold text-2xl uppercase leading-[1.3] md:mb-8 md:text-4xl md:leading-[1.15] md:leading-[1.1] lg:text-5xl">
          Your{" "}
          <TypingAnimation
            loop
            words={["Startup", "Portfolio"]}
            pauseDelay={7000}
            className="h-12 text-fire-orange"
          />{" "}
          is probably <span className="text-fire-red">trash</span>. Let&apos;s{" "}
          <span className="text-fire-yellow">fix</span> it.
        </h1>
        <RoastForm chatEnabled={chatEnabled} />
        <p className="text-center font-mono text-[10px] text-slate md:text-xs">
          No signup needed. Just a URL.
        </p>
      </main>

      <RoasiAnimation className="fixed inset-0 -z-[9999]" />
    </div>
  )
}
