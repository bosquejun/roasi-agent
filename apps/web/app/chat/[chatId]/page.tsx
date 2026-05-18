import { readChatTitle, readConversations } from "@roaster/ai/tools/memory"
import { notFound } from "next/navigation"
import { StudioClient } from "@/components/features/chat"
import { isChatEnabled } from "@/lib/features"

interface PageProps {
  params: Promise<{ chatId: string }>
}

export default async function Page({ params }: PageProps) {
  if (!isChatEnabled()) notFound()
  const { chatId } = await params

  const [messages, title] = await Promise.all([
    readConversations(chatId),
    readChatTitle(chatId),
  ])

  return <StudioClient chatId={chatId} messages={messages} title={title ?? undefined} />
}

export function generateStaticParams() {
  return []
}
