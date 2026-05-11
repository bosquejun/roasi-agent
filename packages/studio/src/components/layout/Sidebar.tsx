import {
  RoasiHead,
  type RoasiHeadHandle,
} from "@roaster/sprite-animations/components/roasi/RoasiHead"
import { IconChartBar, IconFolders, IconSettings } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { useRef, useState } from "react"
import type { NavItem } from "./AppShell"

interface SidebarProps {
  expanded: boolean
  activeNav: NavItem
  onToggle: () => void
  onNavChange: (nav: NavItem) => void
}

const NAV_ITEMS: { id: NavItem; icon: ReactNode; label: string }[] = [
  { id: "projects", icon: <IconFolders size={20} />, label: "PROJECTS" },
  { id: "metrics", icon: <IconChartBar size={20} />, label: "METRICS" },
  { id: "settings", icon: <IconSettings size={20} />, label: "SETTINGS" },
]

export function Sidebar({
  expanded,
  activeNav,
  onToggle,
  onNavChange,
}: SidebarProps) {
  const width = 56
  const [hoveredId, setHoveredId] = useState<NavItem | null>(null)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const roasiRef = useRef<RoasiHeadHandle>(null)

  const handleRoasiClick = () => {
    roasiRef.current?.play()
    onToggle()
  }

  return (
    <div
      style={{
        width,
        minWidth: width,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-card)",
        borderRight: "3px solid var(--black)",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Roasi header */}
      <button
        type="button"
        onClick={handleRoasiClick}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={expanded}
        onMouseEnter={() => setShowTooltip("roasi")}
        onMouseLeave={() => setShowTooltip(null)}
        style={{
          height: 56,
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          borderBottom: "3px solid var(--black)",
          background: "none",
          cursor: "pointer",
          flexShrink: 0,
          width: "100%",
          padding: 6,
        }}
      >
        <RoasiHead
          ref={roasiRef}
          spriteJsonUrl="/assets/sprites/roasi/Roasi-head.json"
          spritePngUrl="/assets/sprites/roasi/Roasi-head.png"
          size={48}
        />
      </button>

      {/* Tooltip for roasi */}
      {showTooltip === "roasi" && (
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 16,
            background: "var(--black)",
            color: "#fff",
            padding: "4px 8px",
            fontSize: 10,
            fontFamily: "var(--font-pixel)",
            whiteSpace: "nowrap",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          {expanded ? "Collapse" : "Expand"}
        </div>
      )}

      {/* Nav items */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "8px 0",
        }}
      >
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const isActive = activeNav === id
          const isHovered = hoveredId === id
          return (
            <div key={id} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => onNavChange(id)}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                onMouseEnter={() => {
                  setHoveredId(id)
                  setShowTooltip(id)
                }}
                onMouseLeave={() => {
                  setHoveredId(null)
                  setShowTooltip(null)
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = "none"
                  e.currentTarget.style.transform = "translate(4px, 4px)"
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow =
                    isHovered && !isActive ? "var(--shadow-sm)" : "none"
                  e.currentTarget.style.transform =
                    isHovered && !isActive ? "translate(-2px, -2px)" : "none"
                }}
                style={{
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  background: isActive ? "var(--fire-red)" : "transparent",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  border: "none",
                  cursor: "pointer",
                  transition:
                    "background 150ms, box-shadow 150ms, transform 80ms",
                  boxShadow:
                    !isActive && isHovered ? "var(--shadow-sm)" : "none",
                  transform:
                    !isActive && isHovered ? "translate(-2px, -2px)" : "none",
                  width: "100%",
                }}
              >
                {icon}
              </button>
              {showTooltip === id && (
                <div
                  style={{
                    position: "absolute",
                    left: 64,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "var(--black)",
                    color: "#fff",
                    padding: "4px 8px",
                    fontSize: 10,
                    fontFamily: "var(--font-pixel)",
                    whiteSpace: "nowrap",
                    zIndex: 100,
                    pointerEvents: "none",
                  }}
                >
                  {label}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom avatar */}
      <div
        style={{
          padding: "12px 0",
          display: "flex",
          justifyContent: "center",
          borderTop: "3px solid var(--black)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "var(--fire-red)",
            border: "3px solid var(--black)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-pixel)",
            fontSize: 10,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          R
        </div>
      </div>
    </div>
  )
}
