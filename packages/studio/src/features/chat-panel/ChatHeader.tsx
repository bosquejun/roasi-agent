import { cn } from "@roaster/ui/lib/utils"

interface ChatHeaderProps {
  projectName: string
  previewOpen: boolean
  onTogglePreview: () => void
}

export function ChatHeader({ projectName, previewOpen, onTogglePreview }: ChatHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 bg-[var(--bg-card)] border-b-[3px] border-[var(--black)] shrink-0"
      style={{ height: 56, minHeight: 56 }}
    >
      <span
        className="tracking-[0.04em] text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
      >
        {projectName.toUpperCase()}
      </span>
      <button
        onClick={onTogglePreview}
        type="button"
        aria-pressed={previewOpen}
        className={cn(
          "px-3 py-1.5 border-[3px] border-[var(--black)] cursor-pointer tracking-[0.04em] transition-all duration-150",
          previewOpen
            ? "bg-[var(--electric-blue)] text-[var(--white)] shadow-[var(--shadow-xs)]"
            : "bg-transparent text-[var(--text-muted)] shadow-none"
        )}
        style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
      >
        PREVIEW
      </button>
    </div>
  )
}