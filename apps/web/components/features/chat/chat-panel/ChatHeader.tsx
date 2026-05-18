import { cn } from "@roaster/ui/lib/utils"

interface ChatHeaderProps {
  title?: string
  previewOpen: boolean
  onTogglePreview: () => void
}

export function ChatHeader({
  title,
  previewOpen,
  onTogglePreview,
}: ChatHeaderProps) {
  return (
    <div
      className="flex shrink-0 items-center justify-between border-[var(--black)] border-b-[3px] bg-[var(--bg-card)] px-4"
      style={{ height: 56, minHeight: 56 }}
    >
      <span
        className="text-[var(--text-primary)] tracking-[0.04em]"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
      >
        {title ? title.toUpperCase() : "NEW CHAT"}
      </span>
      <button
        onClick={onTogglePreview}
        type="button"
        aria-pressed={previewOpen}
        className={cn(
          "cursor-pointer border-[3px] border-[var(--black)] px-3 py-1.5 tracking-[0.04em] transition-all duration-150",
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
