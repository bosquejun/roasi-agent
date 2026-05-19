import { TypingAnimation } from "@roaster/ui/components/typing-animation"
import { RoastForm } from "@/components/features/roast"
import { RoasiRippleBackground } from "@/components/features/roast/roasi-ripple-background"
import TopNav from "@/components/shared/topnav"

export default function Page() {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <RoasiRippleBackground />
      <TopNav />

      <main className="mt-52 flex flex-1 flex-col items-center justify-start gap-4 px-3 md:mt-72 md:gap-6 md:px-4">
        <h1 className="z-10 mx-auto mb-6 max-w-4xl text-center font-bold text-2xl uppercase leading-[1.3] md:mb-8 md:text-4xl md:leading-[1.15] md:leading-[1.1] lg:text-5xl">
          Your{" "}
          <TypingAnimation
            as="span"
            className="text-fire-orange leading-normal"
            words={["startup", "portfolio", "website"]}
            loop
            duration={60}
            deleteSpeed={50}
            pauseDelay={5000}
          />{" "}
          is probably <span className="text-fire-red line-through">trash</span>.
          <br />
          <span className="text-foreground">
            Let&apos;s <span className="text-acid-lime">fix</span> it.
          </span>
        </h1>
        <RoastForm />
        <p className="text-center font-mono text-[10px] text-slate md:text-xs">
          No signup needed. Just a URL.
        </p>
      </main>
    </div>
  )
}
