'use client'

import * as React from 'react'
import { useClipboard } from '@/registry/hooks/browser/use-clipboard'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Badge } from '@/registry/primitives/badge'
import { Button } from '@/registry/primitives/button'
import { Input } from '@/registry/primitives/input'
import { IconCheck, IconCopy } from '@tabler/icons-react'

interface DemoProps {
  timeout?: number
}

export default function Demo({ timeout = 2000 }: DemoProps) {
  const [text, setText] = React.useState('npx shadcn add @spaceui/hooks-browser-use-clipboard')
  const { copy, copied } = useClipboard({ timeout })

  return (
    <Card className="w-full max-w-md bg-muted rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 pt-1 pb-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Badge variant="secondary" className="rounded-sm aspect-square h-full! bg-transparent">
            <IconCopy className="size-4 text-muted-foreground" />
          </Badge>
          <span>Clipboard</span>
        </div>
        <Badge variant={copied ? 'success' : 'outline'} size="sm">
          {copied ? 'Copied' : 'Ready'}
        </Badge>
      </div>
      <CardPanel className="flex gap-2 rounded-[0.875rem] bg-background p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="font-mono text-base sm:text-sm"
          placeholder="Text to copy"
          aria-label="Text to copy"
        />
        <Button
          onClick={() => copy(text)}
          variant={copied ? 'secondary' : 'default'}
          className="shrink-0"
          aria-label={copied ? 'Copied' : 'Copy'}
        >
          {copied ? <IconCheck className="size-3.5" /> : <IconCopy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </CardPanel>
    </Card>
  )
}
