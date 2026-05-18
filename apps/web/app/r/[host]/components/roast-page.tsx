import Link from "next/link"
import { buttonVariants } from "@roaster/ui/components/button"
import { isChatEnabled } from "@/lib/features"

interface RoastPageProps {
  host: string
}

export function RoastPage({ host }: RoastPageProps) {
  const chatEnabled = isChatEnabled()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 flex flex-col gap-10">
      {/* Metadata Card */}
      <div className="border-[3px] border-foreground shadow-neo-md bg-card p-6 flex flex-col gap-4">
        {/* ogImage placeholder */}
        <div className="aspect-video w-full bg-smoke animate-pulse rounded-sm" />
        {/* Favicon + name + URL row */}
        <div className="flex items-center gap-3">
          <div className="size-8 shrink-0 rounded-full bg-smoke animate-pulse" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-4 w-32 bg-smoke animate-pulse rounded-sm" />
            <div className="h-3 w-48 bg-smoke animate-pulse rounded-sm" />
          </div>
        </div>
        {/* Description */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full bg-smoke animate-pulse rounded-sm" />
          <div className="h-3 w-4/5 bg-smoke animate-pulse rounded-sm" />
        </div>
      </div>

      {/* Roast Content */}
      <div className="flex flex-col gap-6">
        <h2 className="font-pixel text-lg uppercase text-fire-red">The Roast</h2>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-3 w-full bg-smoke animate-pulse rounded-sm" />
            <div className="h-3 w-full bg-smoke animate-pulse rounded-sm" />
            <div className="h-3 w-3/4 bg-smoke animate-pulse rounded-sm" />
          </div>
        ))}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {["Performance", "SEO", "UX", "Copy"].map((label) => (
          <div
            key={label}
            className="border-[3px] border-foreground shadow-neo-md bg-card p-4 flex flex-col gap-2"
          >
            <div className="h-8 w-12 bg-smoke animate-pulse rounded-sm" />
            <p className="font-mono text-xs text-stone uppercase">{label}</p>
          </div>
        ))}
      </div>

      {/* Chat CTA */}
      {chatEnabled && (
        <div className="border-[3px] border-foreground shadow-neo-md bg-card p-6 flex flex-col gap-4 items-center text-center">
          <h3 className="font-pixel text-base uppercase">Want to go deeper?</h3>
          <p className="font-mono text-sm text-slate">
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
