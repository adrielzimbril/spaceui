'use client'

import { useEffect, useMemo, useState } from 'react'
import { resolveFlagUrl } from './cdn'
import type { FlagMode, FlagShape } from './types'
import { cn } from '@/registry/lib/utils'

export function AssetFlag({
  code,
  shape = 'circle',
  mode = 'country',
  size,
  lazy = true,
  className,
  alt,
}: {
  code: string
  shape?: FlagShape
  mode?: FlagMode
  size?: number
  lazy?: boolean
  className?: string
  alt?: string
}) {
  const [hasError, setHasError] = useState(false)
  const resolvedShape: FlagShape = mode === 'language' && shape === '4x3' ? 'circle' : shape

  const src = useMemo(() => {
    const targetCode = hasError ? 'xx' : code
    return resolveFlagUrl(targetCode, resolvedShape, hasError ? 'country' : mode)
  }, [code, resolvedShape, mode, hasError])

  useEffect(() => {
    setHasError(false)
  }, [code, resolvedShape, mode])

  const isRect = resolvedShape === '4x3'
  const width = size ? (isRect ? Math.round((size * 4) / 3) : size) : undefined
  const height = size ? size : undefined

  return (
    <img
      src={src}
      alt={alt ?? `${code.toUpperCase()} flag`}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      onError={() => {
        if (!hasError) setHasError(true)
      }}
      className={cn(
        'shrink-0 object-cover ring-1 ring-border/15 transition-transform select-none',
        resolvedShape === 'circle' && 'rounded-full aspect-square',
        resolvedShape === 'square' && 'rounded-[0.25rem] aspect-square',
        resolvedShape === '4x3' && 'rounded-[0.25rem] aspect-[4/3]',
        className,
      )}
    />
  )
}
