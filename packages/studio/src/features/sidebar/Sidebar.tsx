import {
  RoasiHead,
  type RoasiHeadHandle,
} from "@roaster/sprite-animations/components/roasi/RoasiHead"
import { buttonVariants } from "@roaster/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@roaster/ui/components/tooltip"
import { cn } from "@roaster/ui/lib/utils"
import { IconMessages } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { useRef, useState } from "react"

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
        "relative flex shrink-0 flex-col overflow-hidden border-[var(--black)] border-r-[3px] bg-[var(--bg-card)]",
        "h-screen w-14 min-w-14"
      )}
    >
      <button
        type="button"
        onClick={handleRoasiClick}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={expanded}
        onMouseEnter={() => setShowTooltip("roasi")}
        onMouseLeave={() => setShowTooltip(null)}
        className="flex w-full shrink-0 cursor-pointer items-center justify-center border-[var(--black)] border-b-[3px] bg-transparent p-1.5"
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
          className="pointer-events-none absolute top-4 left-16 z-[100] whitespace-nowrap bg-[var(--black)] px-2 py-1 text-white"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
        >
          {expanded ? "Collapse" : "Expand"}
        </div>
      )}

      <nav className="flex flex-1 flex-col py-2">
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const isActive = activeNav === id
          return (
            <Tooltip key={label}>
              <TooltipTrigger
                onClick={() => onNavChange(id)}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "!shadow-none !translate-0 active:!translate-none border-0",
                  {
                    "!border-l-4 border-l-fire-red bg-fire-red/10": isActive,
                  }
                )}
              >
                {icon}
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div className="flex shrink-0 justify-center border-[var(--black)] border-t-[3px] py-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center border-[3px] border-[var(--black)] bg-[var(--fire-red)] text-white"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
        >
          R
        </div>
      </div>
    </div>
  )
}
