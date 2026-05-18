import Link from "next/link"
import { buttonVariants } from "@roaster/ui/components/button"
import { IconFlame } from "@tabler/icons-react"

interface InvalidUrlDisplayProps {
  host: string
}

export function InvalidUrlDisplay({ host }: InvalidUrlDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center px-4">
      <IconFlame className="size-16 text-fire-red" />
      <div className="flex flex-col gap-2">
        <h2 className="font-pixel text-xl uppercase text-fire-red">URL Not Found</h2>
        <p className="font-mono text-sm text-slate">
          We couldn&apos;t reach that URL.
        </p>
        <p className="font-mono text-xs text-stone">{host}</p>
      </div>
      <Link href="/" className={buttonVariants({ variant: "danger", size: "md" })}>
        Try another URL
      </Link>
    </div>
  )
}
