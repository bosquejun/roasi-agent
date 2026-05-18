"use client"

import { useRoasiAnimation } from "@roaster/sprite-animations/hooks/useRoasiAnimation"
import { useRef } from "react"

interface RoasiAnimationProps {
  className?: string
}

export function RoasiAnimation({ className }: RoasiAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useRoasiAnimation(containerRef)

  return <div ref={containerRef} className={className} />
}
