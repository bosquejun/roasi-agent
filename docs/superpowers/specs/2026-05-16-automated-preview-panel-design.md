# Automated Preview Panel

**Date:** 2026-05-16

## Goal

Automatically open and switch the preview panel based on scan lifecycle events — no manual interaction required from the user.

## Behaviour

| Event | Panel state |
|---|---|
| `scanSite` tool input received | Open panel → switch to **Live** tab, load host URL |
| `analyzeScanReport` output available | Switch to **Report** tab, load Lighthouse HTML |

## Architecture

### 1. Data layer — `ScanResult` gets `reportPath`

**File:** `packages/ai/src/skills/sitewarden/tools/scan.ts`

Add `reportPath: string` to the `ScanResult` type and return it from the scan tool. The value is the `outputPath` already computed inside the tool (e.g. `reports/linear.app/2026-05-16`).

```ts
interface ScanResult {
  pages: PageReport[]
  mode: "default" | "targeted" | "smart" | "full"
  reportPath: string  // new
}
```

The client constructs the full iframe URL as:
```
/api/reports/{reportPath}/reports/lighthouse.html
```

### 2. Message parsing — new `useEffect` in `ChatPanel`

**File:** `apps/web/app/chat/_components/chat-panel/ChatPanel.tsx`

Add two optional callbacks to `ChatPanelProps`:

```ts
onScanStarted?: (url: string) => void
onScanComplete?: (reportPath: string) => void
```

Add a `useEffect` that iterates `messages` (same pattern as the existing terminal extraction) and looks for:

- A `scanSite` tool part with `state === "input-available"` or any state after — extract `input.url` and call `onScanStarted(url)`
- An `analyzeScanReport` tool part with `state === "output-available"` — read `output.reportPath` and call `onScanComplete(output.reportPath)`

Use a ref to avoid firing callbacks more than once per unique tool call ID.

### 3. State + automation — `StudioClient`

**File:** `apps/web/app/chat/_components/StudioClient.tsx`

Add state:

```ts
const [projectUrl, setProjectUrl] = useState("")
const [reportUrl, setReportUrl] = useState<string | undefined>()
```

Add handlers:

```ts
function handleScanStarted(url: string) {
  setProjectUrl(url)
  setPreviewOpen(true)
  setPreviewMode("live")
}

function handleScanComplete(reportPath: string) {
  setReportUrl(`/api/reports/${reportPath}/reports/lighthouse.html`)
  setPreviewMode("report")
}
```

Pass to `ChatPanel`:

```tsx
<ChatPanel
  onScanStarted={handleScanStarted}
  onScanComplete={handleScanComplete}
  ...
/>
```

Pass to `PreviewPanel`:

```tsx
<PreviewPanel
  projectUrl={projectUrl}
  reportUrl={reportUrl}
  ...
/>
```

## Files Changed

| File | Change |
|---|---|
| `packages/ai/src/skills/sitewarden/tools/scan.ts` | Add `reportPath` to `ScanResult` return value |
| `packages/ai/src/skills/sitewarden/tools/scan.ts` | Update `ScanResult` type |
| `apps/web/app/chat/_components/chat-panel/ChatPanel.tsx` | Add `onScanStarted` / `onScanComplete` callbacks + parsing `useEffect` |
| `apps/web/app/chat/_components/StudioClient.tsx` | Add state + handlers + wire to ChatPanel and PreviewPanel |

## Out of Scope

- Handling multiple scans in one chat session (last scan wins)
- Persisting host/report across page reloads
- Error state if report file doesn't exist yet
