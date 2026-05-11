"use client"

import { useRef } from "react"
import { useRoasiAnimation } from "./useRoasiAnimation"
import styles from "./roasi.module.css"

export function RoasiAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  useRoasiAnimation(containerRef)

  return <div ref={containerRef} className={styles.container} />
}
