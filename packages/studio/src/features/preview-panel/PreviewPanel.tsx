/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
import { cn } from "@roaster/ui/lib/utils"
import { IconX } from "@tabler/icons-react"
import { LiveViewer } from "./LiveViewer"
import { ReportViewer } from "./ReportViewer"
import { TerminalViewer } from "./TerminalViewer"

export type PreviewMode = "live" | "report" | "terminal"

interface PreviewPanelProps {
  open: boolean
  width?: number
  isDragging?: boolean
  mode: PreviewMode
  onModeChange: (mode: PreviewMode) => void
  onClose: () => void
  projectUrl: string
  terminalOutput?: string
  terminalStreaming?: boolean
}

export function PreviewPanel({
  open,
  width = 420,
  isDragging = false,
  mode,
  onModeChange,
  onClose,
  projectUrl,
  terminalOutput = "",
  terminalStreaming = false,
}: PreviewPanelProps) {
  return (
    <div
      id="preview-panel"
      aria-hidden={!open}
      inert={!open || undefined}
      className={cn(
        "flex shrink-0 flex-col overflow-hidden bg-[var(--bg-card)]",
        !isDragging && "transition-all duration-200"
      )}
      style={{
        width: open ? width : 0,
        minWidth: open ? width : 0,
        height: "100vh",
      }}
    >
<div
        className="flex shrink-0 items-center gap-2 border-[var(--black)] border-b-[3px] px-3"
        style={{ height: 56, minHeight: 56 }}
      >
        <span
          className="mr-auto text-[var(--text-primary)] tracking-[0.06em]"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          PREVIEW
        </span>

        <div role="group" aria-label="Preview mode" className="flex gap-1">
          {(["live", "report", "terminal"] as PreviewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              aria-pressed={mode === m}
              className={cn(
                "cursor-pointer border-[3px] border-[var(--black)] px-2.5 py-1 tracking-[0.06em] transition-colors duration-150",
                mode === m
                  ? "bg-[var(--black)] text-[var(--white)]"
                  : "bg-transparent text-[var(--text-muted)]"
              )}
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview panel"
          className="ml-1 flex cursor-pointer items-center justify-center border-[3px] border-[var(--black)] bg-transparent text-[var(--text-primary)]"
          style={{ width: 32, height: 32 }}
        >
          <IconX size={14} />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {open &&
          (mode === "live" ? (
            <LiveViewer url={projectUrl} />
          ) : mode === "terminal" ? (
            <TerminalViewer
              output={terminalOutput}
              isStreaming={terminalStreaming}
            />
          ) : (
            <ReportViewer />
          ))}
      </div>
    </div>
  )
}
