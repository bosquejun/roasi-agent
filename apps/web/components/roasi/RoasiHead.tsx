"use client"

import { forwardRef } from "react"
import {
  RoasiHead as BaseRoasiHead,
  type RoasiHeadHandle as BaseRoasiHeadHandle,
} from "@roaster/sprite-animations/components/roasi"
import styles from "./roasi-head.module.css"

export type { RoasiHeadHandle } from "@roaster/sprite-animations/components/roasi"

interface RoasiHeadProps {
  className?: string
}

export const RoasiHead = forwardRef<BaseRoasiHeadHandle, RoasiHeadProps>(
  function RoasiHead({ className }, ref) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <BaseRoasiHead
          ref={ref}
          className={styles.container}
          canvasClassName={styles.canvas}
        />
      </div>
    )
  }
)
