import { cn } from "@roaster/ui/lib/utils"
import { IconX } from "@tabler/icons-react"
import { ReportViewer } from "./ReportViewer"

interface PreviewPanelProps {
  open: boolean
  width?: number
  isDragging?: boolean
  onClose: () => void
  reportUrl?: string
  isLoading?: boolean
}

export function PreviewPanel({
  open,
  width = 420,
  isDragging = false,
  onClose,
  reportUrl,
  isLoading = false,
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
          REPORT
        </span>

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
        {open && <ReportViewer reportUrl={reportUrl} isLoading={isLoading} />}
      </div>
    </div>
  )
}
