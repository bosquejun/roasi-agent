import { useCallback, useState } from "react"
import { Sidebar, type NavItem } from "@/features/sidebar"
import { ChatPanel } from "@/features/chat-panel"
import { PreviewPanel, type PreviewMode } from "@/features/preview-panel"

export function AppShell() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>("live")
  const [activeNav, setActiveNav] = useState<NavItem>("chats")
  const [terminalOutput, setTerminalOutput] = useState("")
  const [terminalStreaming, setTerminalStreaming] = useState(false)

  const handleTerminalUpdate = useCallback((output: string, streaming: boolean) => {
    setTerminalOutput(output)
    setTerminalStreaming(streaming)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
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
        onTerminalUpdate={handleTerminalUpdate}
      />
      <PreviewPanel
        open={previewOpen}
        mode={previewMode}
        onModeChange={setPreviewMode}
        onClose={() => setPreviewOpen(false)}
        projectUrl="https://roaster.ph"
        terminalOutput={terminalOutput}
        terminalStreaming={terminalStreaming}
      />
    </div>
  )
}
