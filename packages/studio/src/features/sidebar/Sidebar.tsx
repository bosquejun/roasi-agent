import { cn } from "@roaster/ui/lib/utils"
import {
  RoasiHead,
  type RoasiHeadHandle,
} from "@roaster/sprite-animations/components/roasi/RoasiHead"
import { IconChartBar, IconFolders, IconMessages, IconSettings } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { useRef, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@roaster/ui/components/tooltip"
import { buttonVariants } from "@roaster/ui/components/button"

export type NavItem = "chats" | "metrics" | "settings"

interface SidebarProps {
  expanded: boolean
  activeNav: NavItem
  onToggle: () => void
  onNavChange: (nav: NavItem) => void
}

const NAV_ITEMS: { id: NavItem; icon: ReactNode; label: string }[] = [
  { id: "chats", icon: <IconMessages size={20} />, label: "Chats" },
  // { id: "metrics", icon: <IconChartBar size={20} />, label: "METRICS" },
  // { id: "settings", icon: <IconSettings size={20} />, label: "SETTINGS" },
]

export function Sidebar({
  expanded,
  activeNav,
  onToggle,
  onNavChange,
}: SidebarProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const roasiRef = useRef<RoasiHeadHandle>(null)

  const handleRoasiClick = () => {
    roasiRef.current?.play()
    onToggle()
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-[var(--bg-card)] border-r-[3px] border-[var(--black)] overflow-hidden shrink-0 relative",
        "w-14 min-w-14 h-screen"
      )}
    >
      <button
        type="button"
        onClick={handleRoasiClick}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={expanded}
        onMouseEnter={() => setShowTooltip("roasi")}
        onMouseLeave={() => setShowTooltip(null)}
        className="flex items-center justify-center border-b-[3px] border-[var(--black)] bg-transparent cursor-pointer shrink-0 w-full p-1.5"
        style={{ height: 56, minHeight: 56 }}
      >
        <RoasiHead
          ref={roasiRef}
          spriteJsonUrl="/assets/sprites/roasi/Roasi-head.json"
          spritePngUrl="/assets/sprites/roasi/Roasi-head.png"
          size={48}
        />
      </button>

      {showTooltip === "roasi" && (
        <div
          className="absolute left-16 top-4 bg-[var(--black)] text-white px-2 py-1 whitespace-nowrap z-[100] pointer-events-none"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
        >
          {expanded ? "Collapse" : "Expand"}
        </div>
      )}

      <nav className="flex-1 flex flex-col py-2">
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const isActive = activeNav === id
          return (
            <Tooltip key={label}>
              <TooltipTrigger
                onClick={() => onNavChange(id)}
                className={cn(buttonVariants({ variant: "secondary", size:'sm', }), "!shadow-none border-0 !translate-0 active:!translate-none",{
                  "!border-l-4 bg-fire-red/10 border-l-fire-red": isActive
                })}
              >
                {icon}
              </TooltipTrigger>
              <TooltipContent side="right">
                {label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div className="py-3 flex justify-center border-t-[3px] border-[var(--black)] shrink-0">
        <div
          className="w-8 h-8 bg-[var(--fire-red)] border-[3px] border-[var(--black)] flex items-center justify-center text-white shrink-0"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
        >
          R
        </div>
      </div>
    </div>
  )
}
