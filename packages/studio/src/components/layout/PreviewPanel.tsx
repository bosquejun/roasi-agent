import { IconX } from "@tabler/icons-react"
import { LiveViewer } from "../preview/LiveViewer"
import { ReportViewer } from "../preview/ReportViewer"
import type { PreviewMode } from "./AppShell"

interface PreviewPanelProps {
  open: boolean
  mode: PreviewMode
  onModeChange: (mode: PreviewMode) => void
  onClose: () => void
  projectUrl: string
}

export function PreviewPanel({ open, mode, onModeChange, onClose, projectUrl }: PreviewPanelProps) {
  const width = open ? 420 : 0

  return (
    <div
      id="preview-panel"
      aria-hidden={!open}
      inert={!open || undefined}
      style={{
        width,
        minWidth: width,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-card)",
        borderLeft: "3px solid var(--black)",
        overflow: "hidden",
        transition: "width 200ms ease, min-width 200ms ease",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          borderBottom: "3px solid var(--black)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            letterSpacing: "0.06em",
            color: "var(--text-primary)",
            marginRight: "auto",
          }}
        >
          PREVIEW
        </span>

        {/* Mode switcher */}
        <div role="group" aria-label="Preview mode" style={{ display: "flex", gap: 4 }}>
          {(["live", "report"] as PreviewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              aria-pressed={mode === m}
              style={{
                padding: "5px 10px",
                background: mode === m ? "var(--black)" : "transparent",
                color: mode === m ? "var(--white)" : "var(--text-muted)",
                border: "3px solid var(--black)",
                fontFamily: "var(--font-pixel)",
                fontSize: 7,
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "background 150ms, color 150ms",
              }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview panel"
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "3px solid var(--black)",
            cursor: "pointer",
            color: "var(--text-primary)",
            marginLeft: 4,
          }}
        >
          <IconX size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
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
