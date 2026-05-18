import { buttonVariants } from "@roaster/ui/components/button"
import { IconFlame } from "@tabler/icons-react"
import Link from "next/link"

interface InvalidUrlDisplayProps {
  host: string
  title?: string
}

export function InvalidUrlDisplay({
  host,
  title = "URL Not Found.",
}: InvalidUrlDisplayProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <div className="relative z-10 flex flex-col items-center gap-6">
        <IconFlame className="size-16 text-fire-red" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h2 className="font-pixel text-fire-red text-xl uppercase">
            {title}
          </h2>
          <p className="font-mono text-slate text-sm">
            We couldn&apos;t reach that URL.
          </p>
          <p className="font-mono text-stone text-xs">{host}</p>
        </div>
        <Link
          href="/"
          className={buttonVariants({ variant: "danger", size: "md" })}
        >
          Try another URL
        </Link>
      </div>
    </div>
  )
}
