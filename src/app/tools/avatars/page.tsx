import { AvatarsPlayground } from '@/resources/avatars/playground'
import { engineFromType } from '@/resources/shared/engine'

export const metadata = {
  title: 'Avatars',
  description: 'Generative deterministic avatars playground.',
}

export default async function AvatarsResourcePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams
  return <AvatarsPlayground initialEngine={engineFromType(type)} />
}

export const instant = false
