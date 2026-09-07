import { EmojiPlayground } from '@/resources/emoji/playground'

export const metadata = {
  title: 'Emoji',
  description: 'Fluent, Apple and Telegram emoji playground.',
}

export default function EmojiResourcePage() {
  return <EmojiPlayground />
}

export const instant = false
