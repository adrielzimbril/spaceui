'use client'

import { ScatterText } from '@/registry/components/spaceui/scatter-text'

export default function Demo() {
  return (
    <div className="flex w-full items-center justify-center px-6">
      <div className="flex max-w-lg w-full items-center squircle rounded-2xl bg-muted px-6 lg:h-20">
        <ScatterText
          placeholder="hello@spaceui.one"
          onSubmit={(value) => {
            console.log('submitted', value)
          }}
        />
      </div>
    </div>
  )
}
