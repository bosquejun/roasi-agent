import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { IconWorld } from "@tabler/icons-react"

export default function Page() {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      {/* Topnav */}
      <header className="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center border-0 px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <span
            className="font-[family-name:var(--font-pixel)] text-[11px] uppercase tracking-widest"
            style={{ color: "var(--fire-red)" }}
          >
            Roaster<span style={{ color: "var(--fire-yellow)" }}>.PH</span>
          </span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="accent" size="sm">
              Join Roasters
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <h1
          className="text-center font-[family-name:var(--font-pixel)] text-[28px] uppercase leading-tight tracking-wider"
          style={{ color: "var(--fire-red)" }}
        >
          YOUR STARTUP IS
          <br />
          PROBABLY TRASH.
        </h1>
        <p
          className="text-center font-[family-name:var(--font-mono)] text-[14px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Let&apos;s roast it.
        </p>
        <div className="w-full max-w-xl">
          <Input
            placeholder="https://yourstartup.com"
            prefix={<IconWorld className="size-5" />}
            suffix={
              <Button variant="primary" size="sm">
                Roast It
              </Button>
            }
          />
        </div>
        <p
          className="text-center font-[family-name:var(--font-mono)] text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          No signup needed. Just a URL.
        </p>
      </main>
    </div>
  )
}
