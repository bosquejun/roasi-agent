import { readChatTitle, readConversations } from "@roaster/ai/tools/memory"
import { StudioClient } from "../_components/StudioClient"

interface PageProps {
  params: Promise<{ chatId: string }>
}

export default async function Page({ params }: PageProps) {
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
