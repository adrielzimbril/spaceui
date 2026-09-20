import { Animoji, type AnimojiSource } from '@/registry/components/spaceui/animoji'

const SOURCES: { label: string; source: AnimojiSource }[] = [
  { label: 'Fluent', source: 'fluent' },
  { label: 'Telegram', source: 'telegram' },
  { label: 'Noto', source: 'noto' },
]

export default function Demo() {
  return (
    <div className="grid w-full max-w-md grid-cols-3 gap-4 px-6">
      {SOURCES.map(({ label, source }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <p className="text-3xl">
            <Animoji source={source}>🚀</Animoji>
          </p>
          <span className="text-[0.6875rem] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
