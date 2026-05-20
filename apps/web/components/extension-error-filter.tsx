"use client"

import { useEffect } from "react"

// Browser extensions (MetaMask, wallets, etc.) inject scripts that throw
// plain-object promise rejections. Next.js Turbopack's error overlay catches
// ALL unhandledrejection events, so we intercept and suppress extension noise.
export function ExtensionErrorFilter() {
  useEffect(() => {
    function handler(event: PromiseRejectionEvent) {
      const reason = event.reason
      if (reason == null || reason instanceof Error) return

      // Plain objects with JSON-RPC / MetaMask fingerprints
      if (
        typeof reason === "object" &&
        ("code" in reason || "name" in reason) &&
        !("stack" in reason)
      ) {
        event.preventDefault()
      }
    }

    window.addEventListener("unhandledrejection", handler)
    return () => window.removeEventListener("unhandledrejection", handler)
  }, [])

  return null
}
