import { cn } from "@roaster/ui/lib/utils"
import { IconX } from "@tabler/icons-react"
import { LiveViewer } from "./LiveViewer"
import { ReportViewer } from "./ReportViewer"

export type PreviewMode = "live" | "report"

interface PreviewPanelProps {
  open: boolean
  mode: PreviewMode
  onModeChange: (mode: PreviewMode) => void
  onClose: () => void
  projectUrl: string
}

export function PreviewPanel({ open, mode, onModeChange, onClose, projectUrl }: PreviewPanelProps) {
  return (
    <div
      id="preview-panel"
      aria-hidden={!open}
      inert={!open || undefined}
      className="flex flex-col bg-[var(--bg-card)] border-l-[3px] border-[var(--black)] overflow-hidden shrink-0 transition-all duration-200"
      style={{
        width: open ? 420 : 0,
        minWidth: open ? 420 : 0,
        height: "100vh",
      }}
    >
      <div
        className="flex items-center gap-2 px-3 border-b-[3px] border-[var(--black)] shrink-0"
        style={{ height: 56, minHeight: 56 }}
      >
        <span
          className="mr-auto tracking-[0.06em] text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          PREVIEW
        </span>

        <div role="group" aria-label="Preview mode" className="flex gap-1">
          {(["live", "report"] as PreviewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              aria-pressed={mode === m}
              className={cn(
                "px-2.5 py-1 border-[3px] border-[var(--black)] cursor-pointer tracking-[0.06em] transition-colors duration-150",
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
          className="flex items-center justify-center bg-transparent border-[3px] border-[var(--black)] cursor-pointer text-[var(--text-primary)] ml-1"
          style={{ width: 32, height: 32 }}
        >
          <IconX size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {open && (
          mode === "live" ? (
            <LiveViewer url={projectUrl} />
          ) : (
            <ReportViewer />
          )
        )}
      </div>
    </div>
  )
}