"use client"

import { RoasiAnimation } from "@roaster/sprite-animations/components/roasi/RoasiAnimation"
import { useCallback, useState } from "react"
import { RoastCompleteContext } from "@/components/features/roast/roast-complete-context"

export function RoasiLayoutClient({
  children,
}: { children: React.ReactNode }) {
  const [isComplete, setIsComplete] = useState(false)

  const setComplete = useCallback(() => setIsComplete(true), [])

  return (
    <RoastCompleteContext.Provider value={{ setComplete }}>
      <main className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="relative z-10 mx-auto max-w-2xl pt-24">{children}</div>
      </main>
      {isComplete && (
        <RoasiAnimation className="fixed inset-0 -z-[9999]" />
      )}
    </RoastCompleteContext.Provider>
  )
}
