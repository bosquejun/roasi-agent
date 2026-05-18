import {
  Terminal,
  TerminalActions,
  TerminalContent,
  TerminalCopyButton,
  TerminalHeader,
  TerminalTitle,
} from "@roaster/ui/components/ai-elements/terminal"

interface TerminalViewerProps {
  output: string
  isStreaming: boolean
}

export function TerminalViewer({ output, isStreaming }: TerminalViewerProps) {
  const empty = !output && !isStreaming

  return (
    <Terminal
      output={output}
      isStreaming={isStreaming}
      className="h-full rounded-none border-0"
    >
      <TerminalHeader>
        <TerminalTitle>Bash Output</TerminalTitle>
        <TerminalActions>
          <TerminalCopyButton />
        </TerminalActions>
      </TerminalHeader>
      <TerminalContent className="max-h-none flex-1 min-h-0">
        {empty && (
          <p
            className="text-zinc-600"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
          >
            No bash output yet. Run a scan to see output here.
          </p>
        )}
      </TerminalContent>
    </Terminal>
  )
}