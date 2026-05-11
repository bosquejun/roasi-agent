interface LiveViewerProps {
  url: string
}

export function LiveViewer({ url }: LiveViewerProps) {
  return (
    <iframe
      src={url}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
      }}
      title="Live preview"
    />
  )
}
