import { useState } from "react"
import { ChatPanel } from "./ChatPanel"
import { PreviewPanel } from "./PreviewPanel"
import { Sidebar } from "./Sidebar"

export type NavItem = "projects" | "metrics" | "settings"
export type PreviewMode = "live" | "report"

export function AppShell() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>("live")
  const [activeNav, setActiveNav] = useState<NavItem>("projects")

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg-base)",
      }}
    >
      <Sidebar
        expanded={sidebarExpanded}
        activeNav={activeNav}
        onToggle={() => setSidebarExpanded((v) => !v)}
        onNavChange={setActiveNav}
      />
      <ChatPanel
        projectName="roaster.ph"
        previewOpen={previewOpen}
        onTogglePreview={() => setPreviewOpen((v) => !v)}
      />
      <PreviewPanel
        open={previewOpen}
        mode={previewMode}
        onModeChange={setPreviewMode}
        onClose={() => setPreviewOpen(false)}
        projectUrl="https://roaster.ph"
      />
    </div>
  )
}
