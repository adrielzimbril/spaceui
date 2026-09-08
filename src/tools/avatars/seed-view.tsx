'use client'

import { useMemo } from 'react'
import { IconRefresh } from '@tabler/icons-react'
import { resolveVariant, type AvatarEffect, type AvatarVariant } from '@usespaceui/avatars'
import { Avatar } from '@usespaceui/avatars/react'
import { bloomSound } from '@/components/providers/sound-provider'
import { DynamicCodeBlock } from '@/components/docs/code/dynamic-codeblock'
import { InstallCommandBlock } from '@/components/docs/installation/install-command-block'
import { Button } from '@/registry/primitives/button'
import { Input } from '@/registry/primitives/input'
import { DEFAULT_SEEDS } from '@/tools/shared/seeds'
import { getRandomPersonas } from './utils'
import { cn } from '@/registry/lib/utils'

function snippetFor({
  seed,
  variant,
  size,
  circle,
  effect,
  animate,
  colors,
}: {
  seed: string
  variant: AvatarVariant | 'all'
  size: number
  circle: boolean
  effect: AvatarEffect
  animate: boolean
  colors?: string[]
}) {
  const resolved = variant === 'all' ? resolveVariant(seed, 'all') : variant
  const lines = [`<Avatar`, `  name="${seed}"`, `  variant="${resolved}"`]
  if (size !== 64) lines.push(`  size={${size}}`)
  if (colors?.length) lines.push(`  colors={[${colors.map((color) => `"${color}"`).join(', ')}]}`)
  if (circle) lines.push('  circle')
  if (effect !== 'none') lines.push(`  effect="${effect}"`)
  if (animate) lines.push('  animate')
  lines.push('/>')
  return `import { Avatar } from '@usespaceui/avatars/react'\n\n${lines.join('\n')}`
}

export function SeedView({
  seed,
  setSeed,
  pattern,
  size,
  effect,
  animate,
  circle,
  parsedColors,
}: {
  seed: string
  setSeed: (value: string) => void
  pattern: AvatarVariant | 'all'
  size: number
  effect: AvatarEffect
  animate: boolean
  circle: boolean
  parsedColors?: string[]
}) {
  const name = seed.trim() || DEFAULT_SEEDS
  const code = useMemo(
    () =>
      snippetFor({
        seed: name,
        variant: pattern,
        size,
        circle,
        effect,
        animate,
        colors: parsedColors,
      }),
    [name, pattern, size, circle, effect, animate, parsedColors],
  )

  return (
    <div className="h-full w-full overflow-auto" data-lenis-prevent="true">
      <div className="flex min-h-full w-full items-center justify-center px-6 pb-10 pt-20 md:px-10 md:pt-24">
        <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-7xl">Space Avatars</h1>
              <p className="max-w-md text-base leading-7 text-muted-foreground text-pretty">
                Deterministic generative avatars from any string. SVG, no assets, no network.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-lg tracking-tight text-muted-foreground">
              <span>Let&apos;s find your avatar</span>
              <Input
                unstyled
                value={seed}
                onChange={(event) => setSeed(event.target.value)}
                aria-label="Avatar seed"
                placeholder={DEFAULT_SEEDS}
                className="w-auto min-w-36 max-w-28 border-0 border-b border-foreground/50 bg-transparent px-0 pb-0.5 text-lg font-medium text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-b-foreground focus-within:ring-0! focus-visible:ring-0! shadow-none [&_input]:p-0! [&_input]:h-auto [&_input]:border-none [&_input]:outline-none [&_input]:ring-0!"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Randomize seed"
                onClick={() => {
                  bloomSound()
                  setSeed(getRandomPersonas(1)[0] ?? DEFAULT_SEEDS)
                }}
              >
                <IconRefresh />
              </Button>
            </div>

            <Avatar
              name={name}
              variant={pattern}
              size={size}
              colors={parsedColors}
              circle={circle}
              effect={effect}
              animate={animate}
              className={cn(
                'self-center md:self-start [&_svg]:border-2 [&_svg]:border-muted',
                circle && '[&_svg]:rounded-full',
              )}
            />
          </div>

          <div className="flex w-full max-w-md shrink-0 flex-col gap-4">
            <InstallCommandBlock packages="@usespaceui/avatars" title="Install" className="my-0" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[0.625rem] font-medium uppercase tracking-tight text-muted-foreground">
                  Your config
                </span>
                <span className="text-[0.625rem] text-muted-foreground">Avatar.tsx</span>
              </div>
              <DynamicCodeBlock code={code} lang="tsx" className="my-0" />
            </div>
            <p className="px-1 text-xs leading-5 text-muted-foreground">
              Name is the only required prop. The same seed always renders the same avatar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
