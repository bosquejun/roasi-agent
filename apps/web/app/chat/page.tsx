import { notFound } from "next/navigation"
import { StudioClient } from "./_components/StudioClient"
import { isChatEnabled } from "@/lib/features"

export default function Page() {
  if (!isChatEnabled()) notFound()
  return <StudioClient />
}
