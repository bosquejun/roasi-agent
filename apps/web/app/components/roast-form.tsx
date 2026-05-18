"use client"

import { cn } from "@roaster/ui/lib/utils"
import { Button } from "@roaster/ui/components/button"
import { Input } from "@roaster/ui/components/input"
import { IconFlame, IconWorld } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { isValidUrl, normalizeUrl } from "@/lib/url"

interface RoastFormProps {
  chatEnabled: boolean
}

export function RoastForm({ chatEnabled }: RoastFormProps) {
  const router = useRouter()
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit() {
    if (!value.trim()) {
      setError("Enter a URL to get roasted")
      return
    }
    if (!isValidUrl(value)) {
      setError("That doesn't look like a valid URL")
      return
    }
    setError("")
    setIsLoading(true)
    const normalized = normalizeUrl(value)
    const host = new URL(normalized).hostname
    router.push(`/r/${host}`)
  }

  return (
    <div className="z-10 w-full max-w-xl">
      <Input
        placeholder="https://your-sh*t.com"
        prefix={<IconWorld className="size-4 md:size-5" />}
        suffix={
          chatEnabled ? (
            <Button
              variant="danger"
              size="sm"
              className="text-[9px] text-white md:text-[10px]"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              <IconFlame
                className={cn("size-4 md:size-5", isLoading && "animate-pulse")}
              />
              {isLoading ? (
                <>
                  <span className="hidden sm:inline">Roasting...</span>
                  <span className="sm:hidden">Roasting</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Get Roasted</span>
                  <span className="sm:hidden">Roast</span>
                </>
              )}
            </Button>
          ) : undefined
        }
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          if (error) setError("")
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit()
        }}
        disabled={isLoading}
        error={!!error}
        errorText={error}
        className="text-sm md:text-base"
      />
    </div>
  )
}
