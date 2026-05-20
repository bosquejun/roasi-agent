export default function Loading() {
  return (
    <div className="z-10 mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-12 pb-40">
      {/* Metadata card skeleton */}
      <div className="flex flex-col gap-4 border-[3px] border-foreground bg-card p-6 shadow-neo-md">
        <div className="aspect-video w-full animate-pulse rounded-sm bg-smoke" />
        <div className="flex items-center gap-3">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-smoke" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-4 w-32 animate-pulse rounded-sm bg-smoke" />
            <div className="h-3 w-24 animate-pulse rounded-sm bg-smoke" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded-sm bg-smoke" />
          <div className="h-3 w-4/5 animate-pulse rounded-sm bg-smoke" />
        </div>
      </div>
    </div>
  )
}
