'use client'

import { OrbSmooth } from '@/registry/components/orb/smooth'
import { useCorsAudioSrc } from '@/registry/components/orb/smooth/use-orb-audio'
import * as React from 'react'

type AudioMode = 'ambient' | 'mic' | 'file'

export interface OrbSmoothDemoProps {
  audioMode?: AudioMode
  audioSource?: 'url' | 'upload'
  audioUrl?: string
  audioFile?: string
  textureSource?: 'url' | 'upload'
  textureUrl?: string
  textureFile?: string
  grain?: boolean
  grainOpacity?: number
  grainAnimated?: boolean
  watercolor?: boolean
  watercolorStrength?: number
  size?: number
}

export default function Demo({
  audioMode = 'ambient',
  audioSource = 'url',
  audioUrl = '',
  audioFile,
  textureSource = 'url',
  textureUrl = 'https://avatars.spaceui.one/v1?name=space&variant=lumina&format=svg',
  textureFile,
  grain = true,
  grainOpacity = 0.67,
  grainAnimated = true,
  watercolor = true,
  watercolorStrength = 0.5,
  size = 240,
}: OrbSmoothDemoProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const rawSrc = audioSource === 'upload' && audioFile ? audioFile : audioUrl
  const playSrc = useCorsAudioSrc(audioMode === 'file' ? rawSrc : '')
  const effectiveTextureUrl = textureSource === 'upload' && textureFile ? textureFile : textureUrl

  return (
    <div className="flex size-full min-h-80 flex-col items-center justify-center gap-3 p-6">
      {audioMode === 'file' ? (
        <audio
          ref={audioRef}
          src={playSrc || undefined}
          controls
          autoPlay
          crossOrigin="anonymous"
          className="h-8 max-w-[220px]"
        />
      ) : null}
      <OrbSmooth
        size={size}
        textureUrl={effectiveTextureUrl}
        audioMode={audioMode}
        audioElement={audioRef}
        audioSrc={playSrc}
        grainOpacity={grain ? grainOpacity : 0}
        grainAnimated={grainAnimated}
        watercolorStrength={watercolor ? watercolorStrength : 0}
      />
    </div>
  )
}
