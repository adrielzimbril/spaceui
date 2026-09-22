'use client'

import { ScatterText } from '@/registry/components/spaceui/scatter-text'
import { logger } from '@/registry/utils/logger'

export default function Demo() {
  return (
    <div className="flex w-full items-center justify-center px-6">
      <div className="flex max-w-lg w-full items-center squircle rounded-2xl bg-muted">
        <ScatterText
          placeholder="hello@spaceui.one"
          onSubmit={(value) => {
            logger.log('submitted', value)
          }}
        />
      </div>
    </div>
  )
}
