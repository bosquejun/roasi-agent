interface ReportViewerProps {
  reportUrl?: string
  isLoading?: boolean
}

export function ReportViewer({ reportUrl, isLoading = false }: ReportViewerProps) {
  if (isLoading && !reportUrl) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-3 text-[var(--text-muted)]"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
      >
        <span className="animate-pulse">SCANNING...</span>
      </div>
    )
  }

  if (!reportUrl) {
    return (
      <div
        className="flex h-full items-center justify-center text-[var(--text-muted)]"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
      >
        NO REPORT AVAILABLE
      </div>
    )
  }

  return (
    <iframe
      src={reportUrl}
      sandbox="allow-scripts allow-same-origin"
      className="block h-full w-full border-none"
      title="Lighthouse report"
    />
  )
}
