/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <explanation> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client"

import { useChat } from "@ai-sdk/react"
import { buttonVariants } from "@roaster/ui/components/button"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@roaster/ui/components/ai-elements/message"
import { DefaultChatTransport } from "ai"
import Link from "next/link"
import { useEffect, useMemo, useRef } from "react"
import { StreamingIndicator } from "@/components/features/chat/chat-panel/StreamingIndicator"

interface SiteMetadata {
  ogImage?: string
  favicon?: string
  title?: string
  description?: string
}

interface ScrapeSiteOutput {
  metadata?: SiteMetadata
}

interface RoastMetrics {
  cringeScore: number
  delusionIndex: number
  audacityLevel: number
  embarrassmentRadius: number
}

const METRIC_CONFIGS: {
  key: keyof RoastMetrics
  label: string
  bg: string
  shadow: string
  labelColor: string
  barColor: string
}[] = [
  {
    key: "cringeScore",
    label: "Cringe Score",
    bg: "bg-fire-red-soft",
    shadow: "shadow-neo-fire",
    labelColor: "text-fire-red",
    barColor: "bg-fire-red",
  },
  {
    key: "delusionIndex",
    label: "Delusion Index",
    bg: "bg-fire-org-soft",
    shadow: "shadow-neo-orange",
    labelColor: "text-fire-orange",
    barColor: "bg-fire-orange",
  },
  {
    key: "audacityLevel",
    label: "Audacity Level",
    bg: "bg-blue-soft",
    shadow: "shadow-neo-blue",
    labelColor: "text-electric-blue",
    barColor: "bg-electric-blue",
  },
  {
    key: "embarrassmentRadius",
    label: "Embarrassment Radius",
    bg: "bg-fire-yel-soft",
    shadow: "shadow-neo-yellow",
    labelColor: "text-fire-yellow",
    barColor: "bg-fire-yellow",
  },
]

interface RoastPageProps {
  host: string
  chatEnabled?: boolean
}

function extractRoastMetrics(
  parts: { type: string }[]
): RoastMetrics | undefined {
  for (const part of parts) {
    const p = part as { type: string; toolName?: string; state?: string; output?: unknown }

    const isDynamic = p.type === "dynamic-tool" && p.toolName === "roastMetricsTool"
    const isStatic = p.type === "tool-roastMetricsTool"

    if (!isDynamic && !isStatic) continue
    if (p.state !== "output-available") continue

    return p.output as RoastMetrics
  }
}

function extractSiteMetadata(
  parts: { type: string }[]
): SiteMetadata | undefined {
  for (const part of parts) {
    const p = part as { type: string; toolName?: string; state?: string; output?: unknown }

    const isDynamic = p.type === "dynamic-tool" && p.toolName === "scrapeSiteTool"
    const isStatic = p.type === "tool-scrapeSiteTool"

    if (!isDynamic && !isStatic) continue
    if (p.state !== "output-available") continue

    if (process.env.NODE_ENV === "development") {
      console.log("[roast] scrapeSiteTool output", p.output)
    }

    return (p.output as ScrapeSiteOutput)?.metadata
  }
}

export function RoastPage({ host, chatEnabled = false }: RoastPageProps) {
  const triggered = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/roast",
      prepareSendMessagesRequest() {
        return { body: { host } }
      },
    }),
  })

  useEffect(() => {
    if (triggered.current) return
    triggered.current = true
    sendMessage({ text: host })
  }, [host, sendMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const allParts = useMemo(
    () => messages.flatMap((m) => m.parts as { type: string }[]),
    [messages]
  )

  const siteMeta = useMemo(() => extractSiteMetadata(allParts), [allParts])
  const roastMetrics = useMemo(() => extractRoastMetrics(allParts), [allParts])

  const isDone = status === "ready" || status === "error"
  const hasRoastText = useMemo(
    () => messages.some((m) => m.role === "assistant" && m.parts.some((p) => p.type === "text")),
    [messages]
  )

  return (
    <div
      className="z-10 mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-12 pb-40"
      aria-busy={!isDone}
      aria-label={!isDone ? "Loading roast results" : undefined}
    >
      {/* Metadata Card */}
      <div className="flex flex-col gap-4 border-[3px] border-foreground bg-card p-6 shadow-neo-md">
        {siteMeta?.ogImage ? (
          // biome-ignore lint/performance/noImgElement: external URL, can't use next/image without domain config
          <img
            src={siteMeta.ogImage}
            alt={siteMeta.title ?? host}
            className="aspect-video w-full rounded-sm object-cover"
          />
        ) : (
          <div className="aspect-video w-full animate-pulse rounded-sm bg-smoke" />
        )}
        <div className="flex items-center gap-3">
          {siteMeta?.favicon ? (
            // biome-ignore lint/performance/noImgElement: external URL
            <img
              src={siteMeta.favicon}
              alt=""
              className="size-8 shrink-0 rounded-full object-contain"
            />
          ) : (
            <div className="size-8 shrink-0 animate-pulse rounded-full bg-smoke" />
          )}
          <div className="flex flex-1 flex-col gap-1">
            {siteMeta?.title ? (
              <p className="font-mono text-sm font-semibold">{siteMeta.title}</p>
            ) : (
              <div className="h-4 w-32 animate-pulse rounded-sm bg-smoke" />
            )}
            <p className="font-mono text-stone text-xs">{host}</p>
          </div>
        </div>
        {siteMeta?.description ? (
          <p className="font-mono text-slate text-sm leading-relaxed">
            {siteMeta.description}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="h-3 w-full animate-pulse rounded-sm bg-smoke" />
            <div className="h-3 w-4/5 animate-pulse rounded-sm bg-smoke" />
          </div>
        )}
      </div>

      {/* Roast Content */}
      <div className="flex flex-col gap-4">
        {messages.map((message, messageIndex) => {
          if (message.role !== "assistant") return null
          const textParts = message.parts.filter((p) => p.type === "text") as {
            type: "text"
            text: string
          }[]
          return textParts.map((part, i) => (
            <Message key={`${messageIndex}-${i}`} from="assistant">
              <MessageContent>
                <MessageResponse className="font-medium text-md [&_em]:not-italic [&_em]:text-fire-orange [&_em]:font-semibold [&_strong]:text-fire-red [&_strong]:font-bold">
                  {part.text}
                </MessageResponse>
              </MessageContent>
            </Message>
          ))
        })}
        <StreamingIndicator status={status} messages={messages} />
      </div>

      {/* Metrics */}
      {hasRoastText && (
        <div className="grid grid-cols-2 gap-4">
          {METRIC_CONFIGS.map(({ key, label, bg, shadow, labelColor, barColor }) => {
            const score = roastMetrics?.[key]
            return (
              <div
                key={key}
                className={`flex flex-col gap-3 border-[3px] border-foreground p-5 ${bg} ${shadow}`}
              >
                <p className={`font-mono text-[10px] uppercase tracking-widest ${labelColor}`}>
                  {label}
                </p>
                {score !== undefined ? (
                  <>
                    <p className="font-pixel text-5xl leading-none text-foreground">{score}</p>
                    <div className="mt-auto flex flex-col gap-1.5">
                      <div className="h-2 w-full border border-foreground bg-foreground/10">
                        <div
                          className={`h-full ${barColor} transition-all duration-700`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className={`text-right font-mono text-[10px] ${labelColor}`}>/ 100</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-12 w-16 animate-pulse rounded-sm bg-foreground/10" />
                    <div className="mt-auto flex flex-col gap-1.5">
                      <div className="h-2 w-full animate-pulse rounded-sm bg-foreground/10" />
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Chat CTA */}
      {chatEnabled && hasRoastText && isDone && (
        <div className="flex flex-col items-center gap-4 border-[3px] border-foreground bg-card p-6 text-center shadow-neo-md">
          <h3 className="font-pixel text-base uppercase">Want to go deeper?</h3>
          <p className="font-mono text-slate text-sm">
            Chat with the roaster to get actionable fixes.
          </p>
          <Link
            href="/chat"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            Start Chat
          </Link>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
