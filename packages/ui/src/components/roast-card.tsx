"use client"

import * as React from "react"

import { cn } from "@roaster/ui/lib/utils"
import { Badge, ScoreBadge } from "@roaster/ui/components/badge"
import { ScoreBreakdown } from "@roaster/ui/components/score-bar"

type Category = "landing" | "portfolio" | "saas" | "startup" | "agency" | "ecommerce"

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
      className={cn(className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        border: featured ? "3px solid var(--fire-red)" : "var(--border-rule)",
        boxShadow: hovered
          ? "var(--shadow-xl)"
          : featured
            ? "var(--shadow-fire)"
            : "var(--shadow-md)",
        transform: hovered ? "translate(-2px, -2px)" : "none",
        transition: "all 150ms",
        overflow: "hidden",
      }}
    >
      {/* Featured banner */}
      {featured && (
        <div
          style={{
            background: "var(--fire-red)",
            padding: "4px 16px",
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
            color: "#fff",
            letterSpacing: "0.1em",
          }}
        >
          🔥 FEATURED ROAST
        </div>
      )}

      {/* Screenshot preview */}
      <div
        style={{
          height: 160,
          background: "var(--smoke)",
          backgroundImage: "var(--pixel-grid)",
          backgroundSize: "8px 8px",
          borderBottom: "var(--border-rule)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Score overlay */}
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <ScoreBadge score={overall} />
        </div>

        {/* Placeholder site preview */}
        <div
          style={{
            width: 220,
            height: 120,
            background: "var(--ash)",
            border: "var(--border-rule)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              height: 16,
              background: "var(--stone)",
              borderBottom: "2px solid var(--black)",
              display: "flex",
              alignItems: "center",
              padding: "0 6px",
              gap: 4,
            }}
          >
            {(["#E8231B", "#F5C518", "#22C55E"] as const).map((c, i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  background: c,
                  border: "1px solid var(--black)",
                }}
              />
            ))}
            <div
              style={{
                flex: 1,
                height: 4,
                background: "var(--ash)",
                marginLeft: 4,
                border: "1px solid var(--black)",
              }}
            />
          </div>
          {/* Content skeleton */}
          <div
            style={{
              flex: 1,
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ height: 6, background: "var(--stone)", width: "70%" }} />
            <div style={{ height: 4, background: "var(--ash)", width: "90%" }} />
            <div style={{ height: 4, background: "var(--ash)", width: "60%" }} />
            <div
              style={{
                marginTop: 6,
                height: 16,
                background: "var(--fire-red)",
                width: "40%",
                border: "2px solid var(--black)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 20px" }}>
        {/* URL + Tags */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-muted)",
              }}
            >
              {url}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <Badge key={tag} variant={tag}>
                {tag.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Score bars */}
        <div style={{ marginBottom: 14 }}>
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => setUpvoted(!upvoted)}
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 8,
                padding: "6px 10px",
                background: upvoted ? "var(--fire-red)" : "var(--bg-card)",
                color: upvoted ? "#fff" : "var(--text-primary)",
                border: "var(--border-rule)",
                boxShadow: "var(--shadow-xs)",
                cursor: "pointer",
                transition: "all 100ms",
              }}
            >
              🔥 {upvoted ? votes + 1 : votes}
            </button>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-muted)",
              }}
            >
              💬 {comments}
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-muted)",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span>@{author}</span>
            <span>·</span>
            <span>{timeAgo}</span>
          </div>
          <button
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 8,
              padding: "7px 14px",
              background: "var(--black)",
              color: "#fff",
              border: "var(--border-rule)",
              boxShadow: "var(--shadow-xs)",
              cursor: "pointer",
            }}
          >
            VIEW ROAST →
          </button>
        </div>
      </div>
    </div>
  )
}

export { RoastCard }
export type { RoastCardProps, Category }
