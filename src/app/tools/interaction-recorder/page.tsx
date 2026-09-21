import registryMeta from '@/__registry__/meta.json'
import { InteractionRecorderPlayground } from '@/tools/interaction-recorder/playground'
import type { InteractionRecorderItem } from '@/tools/interaction-recorder/types'

export const metadata = {
  title: 'Interaction Recorder',
  robots: { index: false, follow: false },
}

export default function InteractionRecorderPage() {
  // meta.json indexes each item under both its shortName and its full registry
  // name, so only keep the full-name key — otherwise every interaction shows up twice.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: InteractionRecorderItem[] = Object.entries(registryMeta as Record<string, any>)
    .filter(
      ([key, entry]) =>
        key === entry?.name && typeof entry?.name === 'string' && entry.name.startsWith('interactions-'),
    )
    .map(([, entry]) => ({
      name: entry.name,
      shortName: entry.shortName,
      title: entry.title,
      description: entry.description ?? '',
      categories: Array.isArray(entry.categories) ? entry.categories : [],
    }))
    .sort((a, b) => a.title.localeCompare(b.title))

  return <InteractionRecorderPlayground items={items} />
}

export const instant = false
