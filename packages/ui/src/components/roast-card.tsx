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
    <div
      className={cn(
        "bg-bg-card border-[3px] border-black shadow-neo-md overflow-hidden",
        featured ? "border-fire-red shadow-neo-fire" : "",
        hovered ? "hover:shadow-neo-xl translate-x-neg-1 translate-y-neg-1" : "",
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
      <div
        className="h-40 bg-smoke pixel-grid-bg border-b-[3px] border-black relative flex items-center justify-center overflow-hidden"
      >
        {/* Score overlay */}
        <div className="absolute top-sp-3 right-sp-3">
          <ScoreBadge score={overall} />
        </div>

        {/* Placeholder site preview */}
        <div
          className="w-[220px] h-[120px] bg-ash border-[3px] border-black flex flex-col overflow-hidden"
        >
          {/* Browser chrome */}
          <div className="h-sp-4 bg-stone border-b-[2px] border-black flex items-center px-sp-1 gap-1">
            {(["#E8231B", "#F5C518", "#22C55E"] as const).map((c, i) => (
              <div
                key={i}
                className="w-[5px] h-[5px] border-[1px] border-black"
                style={{ background: c }}
              />
            ))}
            <div
              className="flex-1 h-[4px] bg-ash border-[1px] border-black ml-1"
            />
          </div>
          {/* Content skeleton */}
          <div className="flex-1 p-sp-2 flex flex-col gap-sp-1">
            <div className="h-[6px] bg-stone w-[70%]" />
            <div className="h-[4px] bg-ash w-[90%]" />
            <div className="h-[4px] bg-ash w-[60%]" />
            <div className="mt-sp-1 h-4 bg-fire-red w-[40%] border-[2px] border-black" />
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-sp-4 p-sp-5">
        {/* URL + Tags */}
        <div className="flex items-start justify-between gap-sp-3 mb-sp-3 flex-wrap">
          <div>
            <div className="font-mono text-text-base font-bold text-text-primary mb-sp-1">
              {title}
            </div>
            <div className="font-mono text-text-xs text-text-muted">
              {url}
            </div>
          </div>
          <div className="flex gap-sp-1 flex-wrap">
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
        <div className="flex items-center justify-between flex-wrap gap-sp-2">
          <div className="flex gap-sp-3 items-center">
            <button
              onClick={() => setUpvoted(!upvoted)}
              className={cn(
                "font-pixel text-score-micro py-sp-1 px-sp-3 border-[3px] border-black shadow-neo-xs cursor-pointer transition-all duration-fast",
                upvoted
                  ? "bg-fire-red text-white"
                  : "bg-bg-card text-text-primary"
              )}
            >
              🔥 {upvoted ? votes + 1 : votes}
            </button>
            <span className="font-mono text-text-xs text-text-muted">
              💬 {comments}
            </span>
          </div>
          <span className="font-mono text-text-xs text-text-muted">
            @{author} · {timeAgo}
          </span>
          <button className="font-pixel text-score-micro py-sp-1 px-sp-3 bg-black text-white border-[3px] border-black shadow-neo-xs cursor-pointer">
            VIEW ROAST →
          </button>
        </div>
      </div>
    </div>
  )
}

export type { Category, RoastCardProps }
export { RoastCard }