import { readConversations } from "@roaster/ai/tools/memory"
import { StudioClient } from "../_components/StudioClient"

interface PageProps {
  params: Promise<{ chatId: string }>
}

export default async function Page({ params }: PageProps) {
  const { chatId } = await params

  const messages = await readConversations(chatId)

  return <StudioClient chatId={chatId} messages={messages} />
}

export function generateStaticParams() {
  return []
}
