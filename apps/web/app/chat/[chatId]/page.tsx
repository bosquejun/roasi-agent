import { StudioClient } from "../_components/StudioClient"

interface PageProps {
  params: Promise<{ chatId: string }>
}

export default async function Page({ params }: PageProps) {
  const { chatId } = await params
  return <StudioClient chatId={chatId} />
}

export function generateStaticParams() {
  return []
}
