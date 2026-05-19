import { RoastForm } from "@/components/features/roast"
import TopNav from "@/components/shared/topnav"
import { RoasiRippleBackground } from "@/components/features/roast/roasi-ripple-background"

export default function Page() {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <RoasiRippleBackground />
      <TopNav />

      <main className="mt-52 flex flex-1 flex-col items-center justify-start gap-4 px-3 md:mt-72 md:gap-6 md:px-4">
        <h1 className="z-10 mx-auto mb-6 max-w-4xl text-center font-bold text-2xl uppercase leading-[1.3] md:mb-8 md:text-4xl md:leading-[1.15] md:leading-[1.1] lg:text-5xl">
          While other AIs <span className="text-fire-orange">clap</span> for
          you, <span className="text-fire-red">Roasi</span> tells you the{" "}
          <span className="text-fire-yellow">truth</span>.
        </h1>
        <RoastForm />
        <p className="text-center font-mono text-[10px] text-slate md:text-xs">
          No signup needed. Just a URL.
        </p>
      </main>
    </div>
  )
}
