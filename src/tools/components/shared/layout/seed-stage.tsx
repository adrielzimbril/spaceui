'use client'

import type { ReactNode } from 'react'
import { IconRefresh } from '@tabler/icons-react'
import { bloomSound } from '@/components/providers/sound-provider'
import { DynamicCodeBlock } from '@/components/docs/code/dynamic-codeblock'
import { InstallCommandBlock } from '@/components/docs/installation/install-command-block'
import { Button } from '@/registry/primitives/button'
import { Input } from '@/registry/primitives/input'

export function ResourceSeedView({
  title,
  description,
  findLabel,
  seed,
  setSeed,
  placeholder,
  onRandomize,
  preview,
  packageName,
  code,
  codeTitle = 'Avatar.tsx',
  footnote,
}: {
  title: string
  description: string
  findLabel: string
  seed: string
  setSeed: (value: string) => void
  placeholder: string
  onRandomize: () => void
  preview: ReactNode
  packageName: string
  code: string
  codeTitle?: string
  footnote: string
}) {
  return (
    <div className="h-full w-full overflow-auto" data-lenis-prevent="true">
      <div className="flex min-h-full w-full items-center justify-center px-6 pb-10 pt-20 md:px-10 md:pt-24">
        <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex min-w-0 flex-1 flex-col items-center text-center lg:items-start lg:text-left gap-8">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-4">
              <h1 className="text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-7xl">{title}</h1>
              <p className="max-w-md text-base leading-7 text-muted-foreground text-pretty">{description}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-lg tracking-tight text-muted-foreground">
              <span>{findLabel}</span>
              <Input
                unstyled
                value={seed}
                onChange={(event) => setSeed(event.target.value)}
                aria-label="Seed"
                placeholder={placeholder}
                className="w-auto min-w-36 max-w-28 border-0 border-b border-foreground/50 bg-transparent px-0 pb-0.5 text-lg font-medium text-foreground shadow-none outline-none placeholder:text-muted-foreground/50 focus:border-b-foreground focus-within:ring-0! focus-visible:ring-0! [&_input]:h-auto [&_input]:border-none [&_input]:p-0! [&_input]:outline-none [&_input]:ring-0!"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Randomize seed"
                onClick={() => {
                  bloomSound()
                  onRandomize()
                }}
              >
                <IconRefresh />
              </Button>
            </div>
            <div className="flex w-full items-center justify-center lg:justify-start">
              {preview}
            </div>
          </div>
          <div className="flex w-full max-w-md shrink-0 flex-col gap-4">
            <InstallCommandBlock packages={packageName} title="Install" className="my-0" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[0.625rem] font-medium uppercase tracking-tight text-muted-foreground">
                  Your config
                </span>
                <span className="text-[0.625rem] text-muted-foreground">{codeTitle}</span>
              </div>
              <DynamicCodeBlock code={code} lang="tsx" className="my-0" />
            </div>
            <p className="px-1 text-xs leading-5 text-muted-foreground">{footnote}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
