interface ReportViewerProps {
  reportUrl?: string
}

export function ReportViewer({ reportUrl }: ReportViewerProps) {
  if (!reportUrl) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--text-muted)]"
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
      className="w-full h-full border-none block"
      title="Lighthouse report"
    />
  )
}
