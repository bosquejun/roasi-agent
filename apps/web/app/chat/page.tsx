import { buttonVariants } from "@roaster/ui/components/button"
import Link from "next/link"
import { StudioClient } from "@/components/features/chat"
import { isChatEnabled } from "@/lib/features"

export default function Page() {
  if (!isChatEnabled()) return <ChatUnavailable />
  return <StudioClient />
}

function ChatUnavailable() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-20">
      <div className="flex w-full max-w-md flex-col gap-6 border-[3px] border-foreground bg-card p-8 shadow-neo-lg">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] text-fire-orange uppercase tracking-widest">
            Feature Status
          </p>
          <h1 className="font-pixel text-sm uppercase leading-relaxed">
            Chat not available in prod
          </h1>
        </div>

        <p className="font-mono text-slate text-sm leading-relaxed">
          The chat feature is only available when running the project locally.
          Clone the repo and spin it up to try it out.
        </p>

        <div className="flex flex-col gap-2 border-[2px] border-foreground bg-background p-4">
          <p className="font-mono text-[10px] text-slate uppercase tracking-widest">
            Quick start
          </p>
          <pre className="whitespace-pre-wrap break-all font-mono text-foreground text-xs leading-relaxed">
            {`git clone https://github.com/bosquejun/roasi-agent.git
cd roasi-agent
pnpm install
pnpm dev`}
          </pre>
        </div>

        <Link
          href="/"
          className={buttonVariants({ variant: "ghost", size: "md" })}
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
