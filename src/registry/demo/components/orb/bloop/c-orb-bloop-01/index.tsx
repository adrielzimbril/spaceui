'use client'

import * as React from 'react'
import { OrbBloop } from '@/registry/components/orb/bloop'
import { BloopState } from '@/registry/components/orb/bloop/types'
import { BLOOP_PALETTES, BloopPaletteName } from '@/registry/components/orb/bloop/palettes'
import { useCorsAudioSrc } from '@/registry/components/orb/smooth/use-orb-audio'

type AudioMode = 'ambient' | 'mic' | 'file'
type Palette = BloopPaletteName
type OrbState = BloopState

export interface OrbBloopDemoProps {
  palette?: Palette
  orbState?: OrbState
  size?: number
  audioMode?: AudioMode
  audioSource?: 'url' | 'upload'
  audioUrl?: string
  audioFile?: string
  watercolor?: boolean
  watercolorStrength?: number
}

export default function Demo({
  palette = BloopPaletteName.blue,
  orbState = BloopState.listen,
  size = 240,
  audioMode = 'ambient',
  audioSource = 'url',
  audioUrl = '',
  audioFile,
  watercolor = true,
  watercolorStrength = 0.5,
}: OrbBloopDemoProps) {
  const colors = BLOOP_PALETTES[palette] ?? BLOOP_PALETTES[BloopPaletteName.blue]
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const rawSrc = audioSource === 'upload' && audioFile ? audioFile : audioUrl
  const playSrc = useCorsAudioSrc(audioMode === 'file' ? rawSrc : '')

  return (
    <div className="flex size-full min-h-80 flex-col items-center justify-center gap-3 p-6">
      {audioMode === 'file' ? (
        <audio
          ref={audioRef}
          src={playSrc || undefined}
          controls
          autoPlay
          crossOrigin="anonymous"
          className="h-9 max-w-xs"
        />
      ) : null}
      <OrbBloop
        size={size}
        audioMode={audioMode}
        demoMode={audioMode === 'ambient'}
        audioElement={audioRef}
        audioSrc={playSrc}
        state={orbState}
        bloopColorMain={colors.main}
        bloopColorLow={colors.low}
        bloopColorMid={colors.mid}
        bloopColorHigh={colors.high}
        watercolorStrength={watercolor ? watercolorStrength : 0}
        watercolorAnimated={false}
      />
    </div>
  )
}
