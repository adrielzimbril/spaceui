import { Textmoji, type StaticEmojiSource } from '@/registry/components/spaceui/textmoji'

const SOURCES: { label: string; source: StaticEmojiSource }[] = [
  { label: 'Fluent', source: 'fluent' },
  { label: 'Apple', source: 'apple' },
  { label: 'Twemoji', source: 'twemoji' },
  { label: 'Blobmoji', source: 'blobmoji' },
  { label: 'Noto', source: 'noto' },
]

export default function Demo() {
  return (
    <div className="grid w-full max-w-md grid-cols-5 gap-4 px-6">
      {SOURCES.map(({ label, source }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <p className="text-3xl">
            <Textmoji source={source}>🚀</Textmoji>
          </p>
          <span className="text-[0.6875rem] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
