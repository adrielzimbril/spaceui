import { Animoji } from '@/registry/components/spaceui/animoji'

const text = 'Built with \u{2764}\u{FE0F} love from \u{1F1E8}\u{1F1EE}'

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 px-6 text-center">
      <p className="text-2xl">
        <Animoji>{text}</Animoji>
      </p>
    </div>
  )
}
