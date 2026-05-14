import type { AnalyticsEvent } from "../types/index.js"

const analyticsEvents: AnalyticsEvent[] = []

export function trackEvent(event: AnalyticsEvent): void {
  analyticsEvents.push(event)
}

export function getEvents(type?: string): AnalyticsEvent[] {
  if (type) {
    return analyticsEvents.filter((e) => e.type === type)
  }
  return analyticsEvents
}

export function clearEvents(): void {
  analyticsEvents.length = 0
}