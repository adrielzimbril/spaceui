'use client'

import * as React from 'react'
import { MorphingCommandBar } from '@/registry/components/spaceui/morphing-command-bar'
import { TextMorph } from '@/registry/components/spaceui/morphing-text'

export interface MorphingCommandDemoProps {
  corner?: number
}

export default function Demo({ corner = 28 }: MorphingCommandDemoProps) {
  const [submitted, setSubmitted] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col items-center justify-center gap-[1.25rem] py-[2rem] px-[1rem]">
      <MorphingCommandBar corner={Number(corner)} onSubmit={(val) => setSubmitted(val)} />
      {submitted && (
        <TextMorph className="text-[0.8125rem] font-medium text-muted-foreground">
          {`Executed: "${submitted}"`}
        </TextMorph>
      )}
    </div>
  )
}
