'use client'

import React from 'react'
import type { OgState, ShowcaseLayout, ShowcaseShape, ShowcaseType } from './types'
import { AssetFlag } from '@/tools/flags/asset-flag'
import { Avatar } from '@usespaceui/avatars/react'
import { Squishmoji } from '@usespaceui/squishmoji/react'

export const SHOWCASE_FLAGS = [
  'us', 'gb', 'ca', 'fr', 'de', 'jp', 'br', 'in', 'au', 'es',
  'it', 'nl', 'se', 'kr', 'mx', 'za', 'ch', 'no', 'sg', 'ae',
  'ci', 'cn', 'pt', 'ar', 'ie', 'pl', 'nz', 'dk', 'fi', 'be',
  'gr', 'tr', 'at', 'id', 'ph', 'eg', 'ng', 'ke', 'co', 'cl',
] as const

export const TECH_KEYS = [
  'laravel', 'vue', 'react', 'nextjs', 'ts', 'js',
  'tailwind', 'vite', 'bun', 'astro', 'python', 'figma',
  'supabase', 'docker', 'node',
] as const

export type TechKey = (typeof TECH_KEYS)[number]

export const TECH_LABELS: Record<TechKey, string> = {
  laravel: 'Laravel',
  vue: 'Vue.js',
  react: 'React',
  nextjs: 'Next.js',
  ts: 'TypeScript',
  js: 'JavaScript',
  tailwind: 'Tailwind CSS',
  vite: 'Vite',
  bun: 'Bun',
  astro: 'Astro',
  python: 'Python',
  figma: 'Figma',
  supabase: 'Supabase',
  docker: 'Docker',
  node: 'Node.js',
}

export function TechIcon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  switch (name.toLowerCase()) {
    case 'laravel':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M8.2 3.5 3 6.5v11l10 5.8 8-4.6V7.6l-5.2-3-7.6 4.4v5.8l4.8 2.8 4.8-2.8V12l-4.8 2.8-2.4-1.4V9.2l5.2-3 2.6 1.5v6.5l-5.4 3.1-4.8-2.8V8.2l7.6-4.4"
            fill="#FF2D20"
          />
        </svg>
      )
    case 'vue':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 21.5 1.5 3.3h4.6L12 13.5l5.9-10.2h4.6L12 21.5Z" fill="#41B883" />
          <path d="m12 15.4-4.2-7.3h2.8L12 10.7l1.4-2.6h2.8L12 15.4Z" fill="#34495E" />
        </svg>
      )
    case 'react':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#087EA4" strokeWidth="1.8" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#087EA4" strokeWidth="1.8" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#087EA4" strokeWidth="1.8" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="2" fill="#087EA4" />
        </svg>
      )
    case 'nextjs':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="11" fill="currentColor" />
          <path d="M7 6v12h2.2V9.8l8 9.4A10.9 10.9 0 0 0 19 16.5L8.5 6H7Z" fill="#fff" />
          <path d="M15 6h2.2v8.2L15 11.6V6Z" fill="#fff" />
        </svg>
      )
    case 'ts':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect width="24" height="24" rx="4" fill="#3178C6" />
          <path d="M5.5 10.2h6.2V12H9.3v8H7.3v-8H5.5v-1.8ZM13.2 18.2c.6.6 1.5 1 2.5 1 1.4 0 2.2-.8 2.2-1.8 0-1.2-.8-1.7-2.1-2.2-1.7-.7-2.8-1.5-2.8-3.2 0-1.8 1.4-3.2 3.5-3.2 1.3 0 2.3.4 3 1.1l-1 1.5c-.5-.4-1.2-.7-2-.7-1 0-1.6.6-1.6 1.4 0 1 .7 1.4 2 2 1.9.8 3 1.7 3 3.4 0 2.1-1.6 3.4-4 3.4-1.6 0-2.8-.5-3.7-1.4l1-1.5Z" fill="#fff" />
        </svg>
      )
    case 'js':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect width="24" height="24" rx="4" fill="#F7DF1E" />
          <path d="M6.5 10.5h2.2v6.6c0 1.5-.7 2.3-2.1 2.3-.6 0-1.3-.2-1.7-.5l.4-1.6c.3.2.7.3 1 .3.6 0 .9-.3.9-.9v-6.2ZM12.2 18.2c.6.6 1.5 1 2.5 1 1.4 0 2.2-.8 2.2-1.8 0-1.2-.8-1.7-2.1-2.2-1.7-.7-2.8-1.5-2.8-3.2 0-1.8 1.4-3.2 3.5-3.2 1.3 0 2.3.4 3 1.1l-1 1.5c-.5-.4-1.2-.7-2-.7-1 0-1.6.6-1.6 1.4 0 1 .7 1.4 2 2 1.9.8 3 1.7 3 3.4 0 2.1-1.6 3.4-4 3.4-1.6 0-2.8-.5-3.7-1.4l1-1.5Z" fill="#000" />
        </svg>
      )
    case 'tailwind':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M6.6 6.8c1.3-1.6 2.8-2.3 4.6-2.3 2.6 0 4.1 1.4 4.6 4.1.9-.9 2-1.4 3.2-1.4 2 0 3.2 1.2 3.5 3.5-1.3 1.6-2.8 2.3-4.6 2.3-2.6 0-4.1-1.4-4.6-4.1-.9.9-2 1.4-3.2 1.4-2 0-3.2-1.2-3.5-3.5Zm-5.1 7c1.3-1.6 2.8-2.3 4.6-2.3 2.6 0 4.1 1.4 4.6 4.1.9-.9 2-1.4 3.2-1.4 2 0 3.2 1.2 3.5 3.5-1.3 1.6-2.8 2.3-4.6 2.3-2.6 0-4.1-1.4-4.6-4.1-.9.9-2 1.4-3.2 1.4-2 0-3.2-1.2-3.5-3.5Z"
            fill="#38BDF8"
          />
        </svg>
      )
    case 'vite':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="m20.5 4.5-8.8 17-8.2-17 17 0Z" fill="url(#vite-a)" />
          <path d="M15.4 3.5 8.2 18.2 4 4.5h11.4Z" fill="url(#vite-b)" />
          <path d="m13.2 2.5-6.5 8.2h3.5l-2.2 6.5 7.4-8.8h-3.6l1.4-5.9Z" fill="#FFC920" />
          <defs>
            <linearGradient id="vite-a" x1="4" y1="4.5" x2="20.5" y2="21.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#41D1FF" />
              <stop offset="1" stopColor="#BD34FE" />
            </linearGradient>
            <linearGradient id="vite-b" x1="4" y1="4.5" x2="15.4" y2="18.2" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFEA83" />
              <stop offset="1" stopColor="#FFDD35" />
            </linearGradient>
          </defs>
        </svg>
      )
    case 'bun':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 2C6.5 2 2 6.2 2 11.5c0 4.2 3.1 7.8 7.3 8.8l.4 1.7h4.6l.4-1.7c4.2-1 7.3-4.6 7.3-8.8C22 6.2 17.5 2 12 2Z" fill="#FBF0DF" />
          <ellipse cx="8.5" cy="11.5" rx="1.5" ry="2" fill="#231F20" />
          <ellipse cx="15.5" cy="11.5" rx="1.5" ry="2" fill="#231F20" />
          <circle cx="9" cy="11" r=".6" fill="#fff" />
          <circle cx="16" cy="11" r=".6" fill="#fff" />
          <path d="M12 15.5c-1.8 0-2.8-.8-3-1.5h6c-.2.7-1.2 1.5-3 1.5Z" fill="#E84D3D" />
        </svg>
      )
    case 'astro':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M7.2 17.5c.3-1.8 1.4-3.2 2.8-4.2l2-7.8 2 7.8c1.4 1 2.5 2.4 2.8 4.2H7.2Z" fill="#FF5D01" />
          <path d="m12 5.5-3 12h6l-3-12Z" fill="#fff" />
          <circle cx="12" cy="19.5" r="1.5" fill="#BC52EE" />
        </svg>
      )
    case 'python':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M11.9 2c-3.1 0-5.3.7-5.3 3.1v2.3h5.4v.8H4.4C2 8.2 2 10.6 2 13.1c0 2.7.9 4.3 3.8 4.3h1.8v-2.5c0-2.2 1.9-4.2 4.3-4.2h5.3v-.8c0-2.5-1.9-3.7-4.3-3.7H11c0-1 .9-2 2-2h4V2h-5.1ZM9.2 4a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z" fill="#3776AB" />
          <path d="M12.1 22c3.1 0 5.3-.7 5.3-3.1v-2.3H12v-.8h7.6c2.4 0 2.4-2.4 2.4-4.9 0-2.7-.9-4.3-3.8-4.3h-1.8v2.5c0 2.2-1.9 4.2-4.3 4.2H6.8v.8c0 2.5 1.9 3.7 4.3 3.7H13c0 1-.9 2-2 2H7V22h5.1ZM14.8 20a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Z" fill="#FFD43B" />
        </svg>
      )
    case 'figma':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M7 2h5v5H7a2.5 2.5 0 0 1 0-5Z" fill="#F24E1E" />
          <path d="M12 2h5a2.5 2.5 0 0 1 0 5h-5V2Z" fill="#FF7262" />
          <path d="M12 7h5a2.5 2.5 0 0 1 0 5h-5V7Z" fill="#1ABCFE" />
          <path d="M7 7h5v5H7A2.5 2.5 0 0 1 7 7Z" fill="#A259FF" />
          <path d="M7 12h5v2.5a2.5 2.5 0 1 1-5 0V12Z" fill="#0ACF83" />
        </svg>
      )
    case 'supabase':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M13.4 2.5c.3-.6 1.1-.7 1.6-.2l7.7 8.2c.6.6.1 1.6-.7 1.6h-8.8v9.4c0 .7-.8 1.1-1.3.6l-7.7-8.2c-.6-.6-.1-1.6.7-1.6h8.8V2.5Z" fill="#3ECF8E" />
        </svg>
      )
    case 'docker':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="7.5" y="9.5" width="2" height="2" rx=".3" fill="#2496ED" />
          <rect x="10.5" y="9.5" width="2" height="2" rx=".3" fill="#2496ED" />
          <rect x="13.5" y="9.5" width="2" height="2" rx=".3" fill="#2496ED" />
          <rect x="10.5" y="6.5" width="2" height="2" rx=".3" fill="#2496ED" />
          <rect x="13.5" y="6.5" width="2" height="2" rx=".3" fill="#2496ED" />
          <rect x="16.5" y="9.5" width="2" height="2" rx=".3" fill="#2496ED" />
          <path d="M22.5 12.8c-.8-.2-1.7-.1-2.4.3-.4-1.3-1.4-2.2-2.8-2.4-.2-.8-.8-1.5-1.6-1.8v3.6H4.2c-.2.8-.2 1.6-.1 2.4.6 3.5 3.7 6.1 7.2 6.1 5.3 0 9.8-3.6 11.2-8.2Z" fill="#2496ED" />
        </svg>
      )
    case 'node':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="m12 2.5 9 5.2v10.4l-9 5.2-9-5.2V7.7l9-5.2Z" fill="#5FA04E" />
          <path d="M12 4.8 4.8 9v7.8L12 21l7.2-4.2V9L12 4.8Z" fill="#333" />
          <path d="M12 7.2 7 10v4l5 2.8 5-2.8V10l-5-2.8Z" fill="#5FA04E" />
        </svg>
      )
  }
}

export function TechBadgesRow({
  badges,
  size = 40,
  className,
  style,
}: {
  badges: string[]
  size?: number
  className?: string
  style?: React.CSSProperties
}) {
  if (!badges || badges.length === 0) return null

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: Math.round(size * 0.28),
        ...style,
      }}
    >
      {badges.map((key) => (
        <div
          key={key}
          style={{
            width: size,
            height: size,
            borderRadius: Math.round(size * 0.28),
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(127, 127, 127, 0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <TechIcon name={key} size={Math.round(size * 0.58)} />
        </div>
      ))}
    </div>
  )
}

export function parseAccentTitle(text: string): { text: string; isAccent: boolean }[] {
  if (!text) return []
  const parts: { text: string; isAccent: boolean }[] = []
  const regex = /\{([^}]+)\}/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isAccent: false })
    }
    parts.push({ text: match[1], isAccent: true })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isAccent: false })
  }
  return parts.length > 0 ? parts : [{ text, isAccent: false }]
}

export function ShowcaseItem({
  type,
  index,
  shape,
  size,
}: {
  type: ShowcaseType
  index: number
  shape: ShowcaseShape
  size: number
}) {
  const borderRadius =
    shape === 'circle' ? '50%' : shape === 'squircle' ? Math.round(size * 0.28) : Math.round(size * 0.16)

  const isRect = shape === 'rect'
  const width = isRect ? Math.round((size * 4) / 3) : size
  const height = size

  if (type === 'flags') {
    const code = SHOWCASE_FLAGS[index % SHOWCASE_FLAGS.length]
    return (
      <div
        style={{
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          border: '1px solid rgba(127, 127, 127, 0.12)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <AssetFlag
          code={code}
          shape={shape === 'circle' ? 'circle' : shape === 'rect' ? '4x3' : 'square'}
          size={size}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  if (type === 'avatars') {
    const seed = `avatar-${index}`
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius,
          overflow: 'hidden',
          border: '1px solid rgba(127, 127, 127, 0.14)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <Avatar name={seed} size={size} variant="all" circle={shape === 'circle'} />
      </div>
    )
  }

  if (type === 'squishmoji') {
    const seed = `squish-${index}`
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius,
          overflow: 'hidden',
          border: '1px solid rgba(127, 127, 127, 0.14)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <Squishmoji seed={seed} size={size} shape="all" expression="all" animate={false} />
      </div>
    )
  }

  // Tech Icons
  const tech = TECH_KEYS[index % TECH_KEYS.length]
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        border: '1px solid rgba(127, 127, 127, 0.12)',
        background: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <TechIcon name={tech} size={Math.round(size * 0.58)} />
    </div>
  )
}

export function WaveDivider({
  color = 'rgba(255, 255, 255, 0.85)',
}: {
  color?: string
}) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '46%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        background: `linear-gradient(to top, ${color} 0%, transparent 100%)`,
      }}
    />
  )
}

export function ShowcaseGallery({ s }: { s: OgState }) {
  if (!s.showcaseOn) return null

  const size = s.showcaseSize || 56
  const gap = s.showcaseGap || 16
  const count = s.showcaseCount || 20

  if (s.showcaseLayout === 'shelf') {
    const rows = 3
    const perRow = Math.ceil(count / rows) + 3

    return (
      <div
        style={{
          position: 'absolute',
          bottom: Math.round(s.padding * 0.4),
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: gap * 0.85,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          zIndex: 1,
          maskImage:
            'radial-gradient(ellipse 90% 85% at 50% 95%, black 45%, rgba(0, 0, 0, 0.5) 75%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 85% at 50% 95%, black 45%, rgba(0, 0, 0, 0.5) 75%, transparent 100%)',
        }}
      >
        {Array.from({ length: rows }).map((_, rowIndex) => {
          const shift = rowIndex % 2 === 1 ? size * 0.5 : 0
          return (
            <div
              key={rowIndex}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap,
                transform: `translateX(${shift}px)`,
              }}
            >
              {Array.from({ length: perRow }).map((_, colIndex) => {
                const idx = rowIndex * perRow + colIndex
                return (
                  <ShowcaseItem
                    key={idx}
                    type={s.showcaseType}
                    index={idx}
                    shape={s.showcaseShape}
                    size={size}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  if (s.showcaseLayout === 'grid') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))`,
          gap,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          position: 'relative',
          maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
        }}
      >
        {Array.from({ length: count }).map((_, idx) => (
          <ShowcaseItem
            key={idx}
            type={s.showcaseType}
            index={idx}
            shape={s.showcaseShape}
            size={size}
          />
        ))}
      </div>
    )
  }

  // 'cloud': Honeycomb / Staggered floating cluster on right or left side
  const cloudCols = 5
  const cloudRows = Math.ceil(count / cloudCols)
  const isRightSide = s.align !== 'right'

  return (
    <div
      style={{
        position: 'absolute',
        ...(isRightSide ? { right: s.padding * 0.6 } : { left: s.padding * 0.6 }),
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: gap * 0.75,
        alignItems: isRightSide ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        zIndex: 1,
        maskImage: isRightSide
          ? 'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.05) 10%, rgba(0, 0, 0, 0.5) 35%, black 65%)'
          : 'linear-gradient(to left, transparent 0%, rgba(0, 0, 0, 0.05) 10%, rgba(0, 0, 0, 0.5) 35%, black 65%)',
        WebkitMaskImage: isRightSide
          ? 'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.05) 10%, rgba(0, 0, 0, 0.5) 35%, black 65%)'
          : 'linear-gradient(to left, transparent 0%, rgba(0, 0, 0, 0.05) 10%, rgba(0, 0, 0, 0.5) 35%, black 65%)',
        pointerEvents: 'none',
      }}
    >

      {Array.from({ length: cloudRows }).map((_, r) => {
        const rowShift = r % 2 === 1 ? -(size + gap) * 0.5 : 0
        return (
          <div
            key={r}
            style={{
              display: 'flex',
              gap,
              alignItems: 'center',
              transform: `translateX(${rowShift}px)`,
            }}
          >
            {Array.from({ length: cloudCols }).map((_, c) => {
              const idx = r * cloudCols + c
              if (idx >= count) return null
              return (
                <ShowcaseItem
                  key={idx}
                  type={s.showcaseType}
                  index={idx}
                  shape={s.showcaseShape}
                  size={size}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
