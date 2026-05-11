import { IconFolders, IconMenu2, IconChevronLeft, IconChartBar, IconSettings } from "@tabler/icons-react"
import type { NavItem } from "./AppShell"

interface SidebarProps {
  expanded: boolean
  activeNav: NavItem
  onToggle: () => void
  onNavChange: (nav: NavItem) => void
}

const NAV_ITEMS: { id: NavItem; icon: React.ReactNode; label: string }[] = [
  { id: "projects", icon: <IconFolders size={20} />, label: "PROJECTS" },
  { id: "metrics", icon: <IconChartBar size={20} />, label: "METRICS" },
  { id: "settings", icon: <IconSettings size={20} />, label: "SETTINGS" },
]

export function Sidebar({ expanded, activeNav, onToggle, onNavChange }: SidebarProps) {
  const width = expanded ? 220 : 56

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
        onClick={onToggle}
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
                transition: "background 150ms, box-shadow 150ms, transform 150ms",
                boxShadow: "none",
                fontFamily: "var(--font-pixel)",
                fontSize: 8,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.boxShadow = "var(--shadow-xs)"
                  e.currentTarget.style.transform = "translate(-1px, -1px)"
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.transform = "none"
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
