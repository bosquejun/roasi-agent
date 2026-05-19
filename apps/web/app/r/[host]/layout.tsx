import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import TopNav from "@/components/shared/topnav"
import { RoasiLayoutClient } from "./RoasiLayoutClient"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-svh flex-col overflow-hidden">
      <BackgroundRippleEffect rows={17} cellSize={32} cols={72} />
      <TopNav />
      <RoasiLayoutClient>{children}</RoasiLayoutClient>
    </div>
  )
}
