import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { IconWorld } from "@tabler/icons-react"

export default function Page() {
  return (
    <div className="flex h-svh flex-col overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Topnav */}
      <header
        className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between px-4"
        style={{ background: "var(--bg-card)" }}
      >
        <span
          className="font-[family-name:var(--font-pixel)] text-[11px] tracking-widest uppercase"
          style={{ color: "var(--fire-red)" }}
        >
          Roaster<span style={{ color: "var(--fire-yellow)" }}>.PH</span>
        </span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button variant="accent" size="sm">Join Roasters</Button>
        </div>
      </header>

      {/* Hero */}
      <main className="pixel-grid-bg flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <h1
          className="font-[family-name:var(--font-pixel)] text-center text-[28px] leading-tight tracking-wider uppercase"
          style={{ color: "var(--fire-red)" }}
        >
          YOUR STARTUP IS<br />PROBABLY TRASH.
        </h1>
        <p
          className="font-[family-name:var(--font-mono)] text-center text-[14px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Let&apos;s roast it.
        </p>
        <div className="w-full max-w-xl">
          <Input
            placeholder="https://yourstartup.com"
            prefix={<IconWorld className="size-5" />}
            suffix={<Button variant="primary" size="sm">Roast It</Button>}
          />
        </div>
        <p
          className="font-[family-name:var(--font-mono)] text-center text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          No signup needed. Just a URL.
        </p>
      </main>
    </div>
  )
}
