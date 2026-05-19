"use client"

import { createContext, useContext } from "react"

interface RoastCompleteContextValue {
  setComplete: () => void
}

export const RoastCompleteContext = createContext<RoastCompleteContextValue>({
  setComplete: () => {},
})

export function useRoastCompleteSignal() {
  return useContext(RoastCompleteContext)
}
