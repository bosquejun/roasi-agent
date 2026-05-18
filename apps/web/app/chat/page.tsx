import { notFound } from "next/navigation"
import { StudioClient } from "@/components/features/chat"
import { isChatEnabled } from "@/lib/features"

export default function Page() {
  if (!isChatEnabled()) notFound()
  return <StudioClient />
}
