'use client'

import * as React from 'react'
import { truncateText, randomWord, capitalizeText } from '@/registry/utils/format-text'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Badge } from '@/registry/primitives/badge'
import { Input } from '@/registry/primitives/input'
import { IconTypography, IconRefresh } from '@tabler/icons-react'

export default function Demo() {
  const [str, setStr] = React.useState('SPACE UI IS THE BEST UI LIBRAY. TRY IT TODAY!')
  const [random, setRandom] = React.useState(() => randomWord({ casing: 'capitalize' }))

  return (
    <Card className="w-full max-w-md bg-muted rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 pt-1 pb-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Badge variant="secondary" className="rounded-sm aspect-square h-full! bg-transparent">
            <IconTypography className="size-4 text-muted-foreground" />
          </Badge>
          <span>Text Formatter</span>
        </div>
        <Badge variant="outline" size="sm">
          Utility
        </Badge>
      </div>
      <CardPanel className="flex flex-col gap-3 rounded-[0.875rem] bg-background p-3">
        <div className="flex flex-col gap-1.5">
          <Input
            value={str}
            onChange={(e) => setStr(e.target.value)}
            className="text-base sm:text-sm font-mono"
            aria-label="Text to format"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Presets:</span>
            <button
              type="button"
              onClick={() => setStr('SPACE UI IS THE BEST UI LIBRAY. TRY IT TODAY!')}
              className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              UPPERCASE
            </button>
            <button
              type="button"
              onClick={() => setStr('space ui is the best ui libray. try it today!')}
              className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              lowercase
            </button>
            <button
              type="button"
              onClick={() => setStr('sPaCe UI iS aWeSoMe! BuIlD fAsTeR.')}
              className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              mixed
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="rounded-lg bg-muted p-2.5">
            <span className="block text-[.6875rem] font-semibold text-muted-foreground">Capitalize (Sentence)</span>
            <span className="mt-0.5 block truncate font-mono text-sm font-semibold text-foreground">
              {capitalizeText(str, 'sentence')}
            </span>
          </div>
          <div className="rounded-lg bg-muted p-2.5">
            <span className="block text-[.6875rem] font-semibold text-muted-foreground">Capitalize (Words)</span>
            <span className="mt-0.5 block truncate font-mono text-sm font-semibold text-foreground">
              {capitalizeText(str, 'words')}
            </span>
          </div>
          <div className="rounded-lg bg-muted p-2.5">
            <span className="block text-[.6875rem] font-semibold text-muted-foreground">Capitalize (First only)</span>
            <span className="mt-0.5 block truncate font-mono text-sm font-semibold text-foreground">
              {capitalizeText(str, 'first')}
            </span>
          </div>
          <div className="rounded-lg bg-muted p-2.5">
            <span className="block text-[.6875rem] font-semibold text-muted-foreground">Truncate (14 chars)</span>
            <span className="mt-0.5 block truncate font-mono text-sm font-semibold text-foreground">
              {truncateText(str, { maxLength: 14 })}
            </span>
          </div>
          <div className="rounded-lg bg-muted p-2.5">
            <span className="block text-[.6875rem] font-semibold text-muted-foreground">Truncate (3 words)</span>
            <span className="mt-0.5 block truncate font-mono text-sm font-semibold text-foreground">
              {truncateText(str, { type: 'word', maxLength: 3 })}
            </span>
          </div>
          <div className="rounded-lg bg-muted p-2.5 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <span className="block text-[.6875rem] font-semibold text-muted-foreground">Random word</span>
              <span className="mt-0.5 block font-mono text-sm font-semibold text-foreground">
                {random}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRandom(randomWord({ casing: 'capitalize' }))}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors cursor-pointer shrink-0"
              aria-label="Generate new random word"
            >
              <IconRefresh className="size-3.5" />
            </button>
          </div>
        </div>
      </CardPanel>
    </Card>
  )
}
