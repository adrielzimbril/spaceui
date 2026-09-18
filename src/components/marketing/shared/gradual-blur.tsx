import { cn } from '@/registry/lib/utils'

const BLUR_LAYERS = [
  'backdrop-blur-[0.084rem] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_14.3%,black_28.6%,transparent_42.885714%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_14.3%,black_28.6%,transparent_42.885714%)]',
  'backdrop-blur-[0.125rem] [-webkit-mask-image:linear-gradient(to_bottom,transparent_14.3%,black_28.6%,black_42.9%,transparent_57.185714%)] [mask-image:linear-gradient(to_bottom,transparent_14.3%,black_28.6%,black_42.9%,transparent_57.185714%)]',
  'backdrop-blur-[0.214rem] [-webkit-mask-image:linear-gradient(to_bottom,transparent_28.6%,black_42.9%,black_57.1%,transparent_71.385714%)] [mask-image:linear-gradient(to_bottom,transparent_28.6%,black_42.9%,black_57.1%,transparent_71.385714%)]',
  'backdrop-blur-[0.386rem] [-webkit-mask-image:linear-gradient(to_bottom,transparent_42.9%,black_57.1%,black_71.4%,transparent_85.685714%)] [mask-image:linear-gradient(to_bottom,transparent_42.9%,black_57.1%,black_71.4%,transparent_85.685714%)]',
  'backdrop-blur-[0.664rem] [-webkit-mask-image:linear-gradient(to_bottom,transparent_57.1%,black_71.4%,black_85.7%,transparent_99.985714%)] [mask-image:linear-gradient(to_bottom,transparent_57.1%,black_71.4%,black_85.7%,transparent_99.985714%)]',
  'backdrop-blur-[0.986rem] [-webkit-mask-image:linear-gradient(to_bottom,transparent_71.4%,black_85.7%,black_100%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_71.4%,black_85.7%,black_100%,transparent_100%)]',
  'backdrop-blur-[1.150rem] [-webkit-mask-image:linear-gradient(to_bottom,transparent_85.7%,black_100%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_85.7%,black_100%,transparent_100%)]',
]

export function GradualBlur({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'gradual-blur pointer-events-none fixed inset-x-0 bottom-0 z-9 h-[clamp(3.5rem,9vw,7rem)] w-full opacity-100',
        className,
      )}
      aria-hidden="true"
    >
      <div className="relative size-full">
        {BLUR_LAYERS.map((layerClass, index) => (
          <div key={index} className={cn('absolute inset-0 opacity-90', layerClass)} />
        ))}
      </div>
    </div>
  )
}
