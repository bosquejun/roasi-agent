import { RoasiAnimation } from "@roaster/sprite-animations/components/roasi/RoasiAnimation"
import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import TopNav from "@/components/shared/topnav"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-svh flex-col overflow-hidden">
      <BackgroundRippleEffect rows={17} cellSize={32} cols={72} />
      <TopNav />
      <main className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="relative z-10 mx-auto max-w-2xl pt-24">{children}</div>
      </main>
      <RoasiAnimation className="fixed inset-0 -z-[9999]" />
    </div>
  )
}
