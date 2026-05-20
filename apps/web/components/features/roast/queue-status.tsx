import { IconFlame } from "@tabler/icons-react"

interface QueueStatusProps {
  position: number
}

const ordinal = (n: number) => {
  if (n === 1) return "1st"
  if (n === 2) return "2nd"
  if (n === 3) return "3rd"
  return `${n}th`
}

export function QueueStatus({ position }: QueueStatusProps) {
  return (
    <div className="flex flex-col items-center gap-4 border-[3px] border-foreground bg-card p-8 shadow-neo-md text-center">
      <IconFlame className="size-10 animate-pulse text-fire-orange" />
      <div className="flex flex-col gap-1">
        <p className="font-pixel text-xl uppercase text-foreground">
          You&apos;re {ordinal(position)} in line
        </p>
        <p className="font-mono text-sm text-slate">
          {position === 1
            ? "You're next — hang tight..."
            : `${position - 1} roast${position - 1 === 1 ? "" : "s"} ahead of you`}
        </p>
      </div>
      <p className="font-mono text-xs text-stone">
        We roast one at a time. No shortcuts.
      </p>
    </div>
  )
}
