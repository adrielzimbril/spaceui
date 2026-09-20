import { Textmoji } from '@/registry/components/spaceui/textmoji'

const SIZES = [
  { label: 'text-xs', className: 'text-xs' },
  { label: 'text-base', className: 'text-base' },
  { label: 'text-2xl', className: 'text-2xl' },
  { label: 'text-4xl', className: 'text-4xl' },
]

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 px-6">
      {SIZES.map(({ label, className }) => (
        <div key={label} className="flex w-full items-center justify-center gap-4">
          <p className={className}>
            <Textmoji>Ship faster 🚀</Textmoji>
          </p>
        </div>
      ))}
    </div>
  )
}
