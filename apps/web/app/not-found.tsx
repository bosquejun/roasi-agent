import { RoasiAnimation } from "@roaster/sprite-animations/components/roasi/RoasiAnimation"
import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import TopNav from "@/components/shared/topnav"
import { InvalidUrlDisplay } from "@/components/features/roast"

export default function NotFound() {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <BackgroundRippleEffect rows={17} cellSize={32} cols={72} />
      <TopNav />
      <main className="flex flex-1 items-center justify-center">
        <InvalidUrlDisplay host="This page" />
      </main>
      <RoasiAnimation className="fixed inset-0 -z-[9999]" />
    </div>
  )
}