"use client"

import {
  RoasiHead,
  type RoasiHeadHandle,
} from "@roaster/sprite-animations/components/roasi/RoasiHead"
import Link from "next/link"
import { useRef } from "react"

export function RoasiLogo({ className }: { className?: string }) {
  const headRef = useRef<RoasiHeadHandle>(null)

  return (
    <Link
      href="/"
      className={`flex items-center ${className || ""}`}
      aria-label="Roaster.PH home"
      onClick={() => headRef.current?.play()}
    >
      <RoasiHead ref={headRef} />
      <img
        src="/roasi-brand.svg"
        alt="Roaster.PH"
        className="-ml-3 h-9 w-auto md:-ml-4 md:h-12"
      />
    </Link>
  )
}
