import { RoasiAnimation } from "@roaster/sprite-animations/components/roasi/RoasiAnimation"
import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import TopNav from "@/components/shared/topnav"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <BackgroundRippleEffect rows={17} cellSize={32} cols={72} />
      <TopNav />
      <main className="flex flex-1 flex-col">{children}</main>
      <RoasiAnimation className="fixed inset-0 -z-[9999]" />
    </div>
  )
}