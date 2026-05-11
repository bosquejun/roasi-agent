import DesktopTopNav from "./desktop"
import MobileTopNav from "./mobile"

export default function TopNav() {
  return (
    <header className="sticky top-0 z-10 flex h-24 w-full shrink-0 items-center border-0 px-4 py-4 md:mt-4 md:px-6">
      <DesktopTopNav />
      <MobileTopNav />
    </header>
  )
}
