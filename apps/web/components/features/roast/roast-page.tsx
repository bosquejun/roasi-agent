/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */

import { buttonVariants } from "@roaster/ui/components/button"
import Link from "next/link"
import { isChatEnabled } from "@/lib/features"

interface RoastPageProps {
  host: string
}

export function RoastPage({ host: _host }: RoastPageProps) {
  const chatEnabled = isChatEnabled()

  return (
    <div
      className="z-10 mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-12 pb-40"
      aria-busy="true"
      aria-label="Loading roast results"
    >
      {/* Metadata Card */}
      <div className="flex flex-col gap-4 border-[3px] border-foreground bg-card p-6 shadow-neo-md">
        {/* ogImage placeholder */}
        <div className="aspect-video w-full animate-pulse rounded-sm bg-smoke" />
        {/* Favicon + name + URL row */}
        <div className="flex items-center gap-3">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-smoke" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-4 w-32 animate-pulse rounded-sm bg-smoke" />
            <div className="h-3 w-48 animate-pulse rounded-sm bg-smoke" />
          </div>
        </div>
        {/* Description */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded-sm bg-smoke" />
          <div className="h-3 w-4/5 animate-pulse rounded-sm bg-smoke" />
        </div>
      </div>

      {/* Roast Content */}
      <div className="flex flex-col gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-3 w-full animate-pulse rounded-sm bg-smoke" />
            <div className="h-3 w-full animate-pulse rounded-sm bg-smoke" />
            <div className="h-3 w-3/4 animate-pulse rounded-sm bg-smoke" />
          </div>
        ))}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {["Performance", "SEO", "UX", "Copy"].map((label) => (
          <div
            key={label}
            className="flex flex-col gap-2 border-[3px] border-foreground bg-card p-4 shadow-neo-md"
          >
            <div className="h-8 w-12 animate-pulse rounded-sm bg-smoke" />
            <p className="font-mono text-stone text-xs uppercase">{label}</p>
          </div>
        ))}
      </div>

      {/* Chat CTA */}
      {chatEnabled && (
        <div className="flex flex-col items-center gap-4 border-[3px] border-foreground bg-card p-6 text-center shadow-neo-md">
          <h3 className="font-pixel text-base uppercase">Want to go deeper?</h3>
          <p className="font-mono text-slate text-sm">
            Chat with the roaster to get actionable fixes.
          </p>
          <Link
            href="/chat"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            Start Chat
          </Link>
        </div>
      )}
    </div>
  )
}
