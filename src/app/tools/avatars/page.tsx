import { AvatarsPlayground } from '@/tools/avatars/playground'
import { engineFromType } from '@/tools/shared/engine'

export const metadata = {
  title: 'Avatars',
  description: 'Generative deterministic avatars playground.',
}

export default async function AvatarsResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; view?: string }>
}) {
  const { type, view } = await searchParams
  return <AvatarsPlayground initialEngine={engineFromType(type)} initialView={view} />
}

export const instant = false
