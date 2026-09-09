import { FlagPlayground } from '@/tools/flags/playground'

export const metadata = {
  title: 'Flags — Space UI',
  description: '430 country and 201 language vector flags in circle, square, and 4:3 SVG.',
}

export default async function FlagsResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ shape?: string; mode?: string }>
}) {
  const { shape, mode } = await searchParams
  return <FlagPlayground initialShape={shape} initialMode={mode} />
}

export const instant = false
