import { buttonVariants } from "@roaster/ui/components/button"
import Link from "next/link"
import { isChatEnabled } from "@/lib/features"
import { StudioClient } from "@/components/features/chat"

export default function Page() {
  if (!isChatEnabled()) return <ChatUnavailable />
  return <StudioClient />
}

function ChatUnavailable() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-20">
      <div className="flex w-full max-w-md flex-col gap-6 border-[3px] border-foreground bg-card p-8 shadow-neo-lg">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-fire-orange">
            Feature Status
          </p>
          <h1 className="font-pixel text-sm uppercase leading-relaxed">
            Chat not available in prod
          </h1>
        </div>

        <p className="font-mono text-sm text-slate leading-relaxed">
          The chat feature is only available when running the project locally.
          Clone the repo and spin it up to try it out.
        </p>

        <div className="flex flex-col gap-2 border-[2px] border-foreground bg-background p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
            Quick start
          </p>
          <pre className="font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap break-all">
            {`git clone <repo-url>
cd roaster-ph
pnpm install
pnpm dev`}
          </pre>
        </div>

        <Link href="/" className={buttonVariants({ variant: "outline", size: "md" })}>
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
