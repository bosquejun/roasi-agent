/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */

import { IconGripVertical } from "@tabler/icons-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { ChatPanel } from "@/features/chat-panel"
import { type PreviewMode, PreviewPanel } from "@/features/preview-panel"
import { type NavItem, Sidebar } from "@/features/sidebar"

const PREVIEW_DEFAULT_WIDTH = 720
const PREVIEW_MIN_WIDTH = 450
const CHAT_MIN_WIDTH = 620

export function AppShell() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>("live")
  const [activeNav, setActiveNav] = useState<NavItem>("chats")
  const [terminalOutput, setTerminalOutput] = useState("")
  const [terminalStreaming, setTerminalStreaming] = useState(false)
  const [previewWidth, setPreviewWidth] = useState(PREVIEW_DEFAULT_WIDTH)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTerminalUpdate = useCallback(
    (output: string, streaming: boolean) => {
      setTerminalOutput(output)
      setTerminalStreaming(streaming)
    },
    []
  )

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const onMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const maxPreviewWidth = rect.width - CHAT_MIN_WIDTH
      const newWidth = Math.min(
        maxPreviewWidth,
        Math.max(PREVIEW_MIN_WIDTH, rect.right - e.clientX)
      )
      setPreviewWidth(newWidth)
    }

    const onMouseUp = () => setIsDragging(false)

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={containerRef}
      className="flex h-screen overflow-hidden bg-[var(--bg-base)]"
    >
      {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize" />}
      <Sidebar
        expanded={sidebarExpanded}
        activeNav={activeNav}
        onToggle={() => setSidebarExpanded((v) => !v)}
        onNavChange={setActiveNav}
      />
      <ChatPanel
        previewOpen={previewOpen}
        onTogglePreview={() => setPreviewOpen((v) => !v)}
        onTerminalUpdate={handleTerminalUpdate}
      />
      {previewOpen && (
        <div
          className="relative z-10 flex w-2 shrink-0 cursor-col-resize items-center justify-center"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-[var(--black)]" />
          <IconGripVertical
            size={14}
            className="relative z-10 bg-black text-[var(--white)]"
          />
        </div>
      )}
      <PreviewPanel
        open={previewOpen}
        width={previewWidth}
        isDragging={isDragging}
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
