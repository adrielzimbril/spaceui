'use client'

import { GooeyInfoPopover } from '@/registry/components/spaceui/gooey-info-popover'

export default function Demo() {
  return (
    <div className="flex w-full items-end justify-center px-6 py-24">
      <GooeyInfoPopover
        trigger={<img src="/logo-white.svg" alt="" className="relative size-6 translate-y-[0.0125rem]" />}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm opacity-50">Space UI</span>
          <span className="text-right font-mono text-sm opacity-50">v2.4.0</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Build</span>
          <span className="text-sm font-semibold text-emerald-400">Passing</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Route</span>
          <span className="text-sm font-semibold opacity-45">Static</span>
        </div>
      </GooeyInfoPopover>
    </div>
  )
}
