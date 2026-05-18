"use client"

import { RoasiAnimation } from "@roaster/sprite-animations/components/roasi/RoasiAnimation"
import { BackgroundRippleEffect } from "@roaster/ui/components/background-ripple-effect"
import { useState } from "react"

const GRID_ROWS = 17
const GRID_COLS = 72
const GRID_CELL_SIZE = 32

export function RoasiRippleBackground() {
  const [externalRipple, setExternalRipple] = useState<{
    row: number
    col: number
    key: number
  } | undefined>(undefined)

  function handleHeadClick({ x, y }: { x: number; y: number }) {
    const gridWidth = GRID_COLS * GRID_CELL_SIZE
    const offsetX = (window.innerWidth - gridWidth) / 2
    const col = Math.max(0, Math.min(GRID_COLS - 1, Math.floor((x - offsetX) / GRID_CELL_SIZE)))
    const row = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(y / GRID_CELL_SIZE)))
    setExternalRipple((prev) => ({ row, col, key: (prev?.key ?? 0) + 1 }))
  }

  return (
    <>
      <BackgroundRippleEffect
        rows={GRID_ROWS}
        cellSize={GRID_CELL_SIZE}
        cols={GRID_COLS}
        externalRipple={externalRipple}
      />
      <RoasiAnimation className="fixed inset-0 -z-[9999]" onHeadClick={handleHeadClick} />
    </>
  )
}
