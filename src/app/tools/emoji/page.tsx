import { EmojiPlayground } from '@/resources/emoji/playground'

export const metadata = {
  title: 'Emoji',
  description: 'Fluent, Apple and Telegram emoji playground.',
}

export default async function EmojiResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view } = await searchParams
  return <EmojiPlayground initialView={view} />
}

export const instant = false
