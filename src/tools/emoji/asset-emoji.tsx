'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  EmojiFormat,
  resolveEmojiUrl,
  type EmojiFormat as EmojiFormatType,
  type EmojiSource,
  type EmojiType,
} from '@usespaceui/emoji'
import { LottieEmoji } from './lottie-emoji'

export function AssetEmoji({
  codepoint,
  source,
  type,
  format,
  size,
  lazy = true,
}: {
  codepoint: string
  source: EmojiSource
  type: EmojiType
  format?: EmojiFormatType
  size: number
  lazy?: boolean
}) {
  const src = useMemo(() => {
    try {
      return resolveEmojiUrl(codepoint, { source, type, format } as never)
    } catch {
      return ''
    }
  }, [codepoint, source, type, format])
  const [ok, setOk] = useState(true)
  useEffect(() => {
    setOk(true)
  }, [src])
  if (!src || !ok) return null
  if (format === EmojiFormat.Lottie) {
    return <LottieEmoji src={src} size={size} alt="" />
  }
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={lazy ? 'size-full object-contain' : 'object-contain'}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      onError={() => setOk(false)}
    />
  )
}
