interface LiveViewerProps {
  url: string
}

export function LiveViewer({ url }: LiveViewerProps) {
  return (
    <iframe
      src={url}
      sandbox="allow-scripts allow-forms allow-popups"
      referrerPolicy="no-referrer"
      loading="eager"
      className="w-full h-full border-none block"
      title="Live preview"
    />
  )
}