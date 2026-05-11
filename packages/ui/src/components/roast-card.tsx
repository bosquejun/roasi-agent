"use client"

import { Badge, ScoreBadge } from "@roaster/ui/components/badge"
import { ScoreBreakdown } from "@roaster/ui/components/score-bar"
import { cn } from "@roaster/ui/lib/utils"
import * as React from "react"

type Category =
  | "landing"
  | "portfolio"
  | "saas"
  | "startup"
  | "agency"
  | "ecommerce"

interface RoastCardProps {
  url: string
  title: string
  tags: Category[]
  scores: {
    design: number
    copy: number
    ux: number
    performance: number
    mobile: number
  }
  overall: number
  votes?: number
  comments?: number
  author: string
  timeAgo: string
  featured?: boolean
  className?: string
}

function RoastCard({
  url,
  title,
  tags,
  scores,
  overall,
  votes = 0,
  comments = 0,
  author,
  timeAgo,
  featured = false,
  className,
}: RoastCardProps) {
  const [upvoted, setUpvoted] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
    <div
      className={cn(
        "overflow-hidden border-[3px] border-black bg-bg-card shadow-neo-md",
        featured ? "border-fire-red shadow-neo-fire" : "",
        hovered
          ? "translate-x-neg-1 translate-y-neg-1 hover:shadow-neo-xl"
          : "",
        "transition-all duration-base",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Featured banner */}
      {featured && (
        <div className="bg-fire-red px-sp-4 py-sp-1 font-pixel text-score-micro text-white tracking-md">
          🔥 FEATURED ROAST
        </div>
      )}

      {/* Screenshot preview */}
      <div className="pixel-grid-bg relative flex h-40 items-center justify-center overflow-hidden border-black border-b-[3px] bg-smoke">
        {/* Score overlay */}
        <div className="absolute top-sp-3 right-sp-3">
          <ScoreBadge score={overall} />
        </div>

        {/* Placeholder site preview */}
        <div className="flex h-[120px] w-[220px] flex-col overflow-hidden border-[3px] border-black bg-ash">
          {/* Browser chrome */}
          <div className="flex h-sp-4 items-center gap-1 border-black border-b-[2px] bg-stone px-sp-1">
            {(["#E8231B", "#F5C518", "#22C55E"] as const).map((c, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={i}
                className="h-[5px] w-[5px] border-[1px] border-black"
                style={{ background: c }}
              />
            ))}
            <div className="ml-1 h-[4px] flex-1 border-[1px] border-black bg-ash" />
          </div>
          {/* Content skeleton */}
          <div className="flex flex-1 flex-col gap-sp-1 p-sp-2">
            <div className="h-[6px] w-[70%] bg-stone" />
            <div className="h-[4px] w-[90%] bg-ash" />
            <div className="h-[4px] w-[60%] bg-ash" />
            <div className="mt-sp-1 h-4 w-[40%] border-[2px] border-black bg-fire-red" />
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-sp-4 p-sp-5">
        {/* URL + Tags */}
        <div className="mb-sp-3 flex flex-wrap items-start justify-between gap-sp-3">
          <div>
            <div className="mb-sp-1 font-bold font-mono text-base text-primary">
              {title}
            </div>
            <div className="font-mono text-muted text-xs">{url}</div>
          </div>
          <div className="flex flex-wrap gap-sp-1">
            {tags.map((tag) => (
              <Badge key={tag} variant={tag}>
                {tag.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Score bars */}
        <div className="mb-sp-3">
          <ScoreBreakdown
            design={scores.design}
            copy={scores.copy}
            ux={scores.ux}
            performance={scores.performance}
            mobile={scores.mobile}
            compact
          />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-sp-2">
          <div className="flex items-center gap-sp-3">
            <button
              type="button"
              onClick={() => setUpvoted(!upvoted)}
              className={cn(
                "cursor-pointer border-[3px] border-black px-sp-3 py-sp-1 font-pixel text-score-micro shadow-neo-xs transition-all duration-fast",
                upvoted ? "bg-fire-red text-white" : "bg-bg-card text-primary"
              )}
            >
              🔥 {upvoted ? votes + 1 : votes}
            </button>
            <span className="font-mono text-muted text-xs">💬 {comments}</span>
          </div>
          <span className="font-mono text-muted text-xs">
            @{author} · {timeAgo}
          </span>
          <button
            type="button"
            className="cursor-pointer border-[3px] border-black bg-black px-sp-3 py-sp-1 font-pixel text-score-micro text-white shadow-neo-xs"
          >
            VIEW ROAST →
          </button>
        </div>
      </div>
    </div>
  )
}

export type { Category, RoastCardProps }
export { RoastCard }
