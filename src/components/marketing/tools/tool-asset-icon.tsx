'use client'

import * as React from 'react'
import { Avatar } from '@usespaceui/avatars/react'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { AssetFlag } from '@/tools/flags/asset-flag'
import { resolveEmojiUrl, EmojiFormat, EmojiSource, EmojiType } from '@usespaceui/emoji'
import { AssetEmoji } from '@/tools/emoji/asset-emoji'
import { cn } from '@/registry/lib/utils'

export interface ToolAssetIconProps {
  label?: string
  size?: number
  className?: string
}

export function ToolAssetIcon({ label, size = 32, className }: ToolAssetIconProps) {
  const norm = (label || '').toLowerCase().trim()

  if (norm === 'squishmoji') {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <Squishmoji
          seed="squishmoji"
          size={Math.round(size * 0.85)}
          shape="all"
          expression="all"
          backgroundStyle="all"
        />
      </div>
    )
  }

  if (norm === 'avatars' || norm.includes('avatars')) {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <Avatar name="c" variant="pebble" size={size} circle={false} />
      </div>
    )
  }

  if (norm === 'flags') {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <AssetFlag code="ci" shape="circle" size={Math.round(size * 0.72)} alt="Flag" className="ring-0" />
      </div>
    )
  }

  if (norm === 'emoji') {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <AssetEmoji
          codepoint="1f60e"
          source={EmojiSource.Fluent}
          type={EmojiType.Anim}
          size={Math.round(size * 0.75)}
          lazy={false}
        />
      </div>
    )
  }

  if (norm === 'plush') {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <Avatar name="plush" variant="glitch" size={size} circle={false} />
      </div>
    )
  }

  if (norm === 'sounds') {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <Avatar name="sounds" variant="doodle" size={size} circle={false} />
      </div>
    )
  }

  if (norm === 'imagesplit' || norm.includes('split')) {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <Avatar name="imagesplit" variant="invader" size={size} circle={false} />
      </div>
    )
  }

  if (norm === 'shaders' || norm.includes('shader')) {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <Avatar name="shaders" variant="singularity" size={size} circle={false} />
      </div>
    )
  }

  if (norm === 'icons' || norm === 'icon') {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <Avatar name="icons" variant="bored" size={size} circle={false} />
      </div>
    )
  }

  if (norm === 'gradients' || norm.includes('gradient')) {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <Avatar name="gradients" variant="titan" size={size} circle={false} />
      </div>
    )
  }

  if (norm === 'og-image' || norm.includes('og')) {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <Avatar name="og-image" variant="shaula" size={size} circle={false} />
      </div>
    )
  }

  if (norm === 'squircle') {
    return (
      <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
        <Avatar name="squircle" variant="lumina" size={size} circle={false} />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center squircle rounded-full justify-center overflow-hidden', className)}>
      <Avatar name={label || norm || 'tool'} variant="shaula" size={size} circle={false} />
    </div>
  )
}
