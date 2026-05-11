import { useState } from "react"
import type { ReactNode } from "react"
import { IconFolders, IconMenu2, IconChevronLeft, IconChartBar, IconSettings } from "@tabler/icons-react"
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

export function Sidebar({ expanded, activeNav, onToggle, onNavChange }: SidebarProps) {
  const width = expanded ? 220 : 56
  const [hoveredId, setHoveredId] = useState<NavItem | null>(null)

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
        transition: "width 200ms ease, min-width 200ms ease",
        flexShrink: 0,
      }}
    >
      {/* Toggle header */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={expanded}
        style={{
          height: 56,
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "space-between" : "center",
          padding: expanded ? "0 16px" : "0",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          borderBottom: "3px solid var(--black)",
          background: "none",
          cursor: "pointer",
          color: "var(--text-primary)",
          flexShrink: 0,
          width: "100%",
        }}
      >
        {expanded ? (
          <>
            <img
              src="/roaster-logo.png"
              alt="Roaster"
              style={{ height: 32, imageRendering: "pixelated" }}
            />
            <IconChevronLeft size={18} />
          </>
        ) : (
          <IconMenu2 size={20} />
        )}
      </button>

      {/* Nav items */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 0" }}>
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const isActive = activeNav === id
          return (
            <button
              key={id}
              onClick={() => onNavChange(id)}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.transform = "translate(4px, 4px)"
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = hoveredId === id && !isActive ? "var(--shadow-sm)" : "none"
                e.currentTarget.style.transform = hoveredId === id && !isActive ? "translate(-2px, -2px)" : "none"
              }}
              style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: expanded ? "0 16px" : "0",
                justifyContent: expanded ? "flex-start" : "center",
                background: isActive ? "var(--fire-red)" : "transparent",
                color: isActive ? "#fff" : "var(--text-muted)",
                border: "none",
                cursor: "pointer",
                transition: "background 150ms, box-shadow 150ms, transform 80ms",
                boxShadow: !isActive && hoveredId === id ? "var(--shadow-sm)" : "none",
                transform: !isActive && hoveredId === id ? "translate(-2px, -2px)" : "none",
                fontFamily: "var(--font-pixel)",
                fontSize: 8,
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {icon}
              {expanded && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom avatar */}
      <div
        style={{
          padding: expanded ? "12px 16px" : "12px 0",
          display: "flex",
          justifyContent: expanded ? "flex-start" : "center",
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
