'use client'

import React, { useEffect, useState } from 'react'
import type { OgState, Chip, ChipKey, AnimType } from './types'
import { easeOut, easeSmooth, clamp01 } from './presets'
import { SpaceLogo } from './brand/space-logo'
import { ShowcaseGallery, TechBadgesRow, WaveDivider, parseAccentTitle } from './showcase-gallery'

const ANIM_SLOTS = 6

export function elemWindow(s: OgState) {
  const spread = Math.min(s.animStagger * (ANIM_SLOTS - 1), s.animDuration * 0.7)
  return {
    step: spread / Math.max(1, ANIM_SLOTS - 1),
    dur: Math.max(0.15, s.animDuration - spread),
  }
}

export function chipStyle(c: Chip): React.CSSProperties {
  if (!c.on) return {}
  return {
    background: c.bg,
    border: `1px solid ${c.border}`,
    color: c.text,
    borderRadius: c.radius,
    padding: `${c.padY}px ${c.padX}px`,
    backdropFilter: c.blur > 0 ? `blur(${c.blur}px)` : undefined,
    WebkitBackdropFilter: c.blur > 0 ? `blur(${c.blur}px)` : undefined,
  }
}

export function animStyle(type: AnimType, t: number): React.CSSProperties {
  const e = easeSmooth(clamp01(t))
  switch (type) {
    case 'zoom':
      return { opacity: e, transform: `scale(${0.92 + 0.08 * e})` }
    case 'blur-in':
      return { opacity: e, filter: `blur(${(1 - e) * 16}px)` }
    case 'slide':
      return { opacity: e, transform: `translateX(${(1 - e) * -64}px)` }
    case 'reveal':
      return { opacity: t <= 0 ? 0 : 1, clipPath: `inset(0 ${(1 - e) * 100}% 0 0)` }
    case 'pop':
      return { opacity: clamp01(e * 1.4), transform: `scale(${0.7 + 0.3 * e})` }
    case 'fade-up':
    default:
      return { opacity: e, transform: `translateY(${(1 - e) * 32}px)` }
  }
}

export function Editable({
  value,
  on,
  editing,
  rev,
  style,
  className,
  block,
}: {
  value: string
  on: (v: string) => void
  editing: boolean
  rev: number
  style?: React.CSSProperties
  className?: string | undefined
  block?: boolean
}) {
  const Tag = block ? 'div' : 'span'
  return (
    <Tag
      key={`${rev}-${block ? 'b' : 'i'}`}
      contentEditable={editing}
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(e: React.FocusEvent<HTMLElement>) => on(e.currentTarget.innerText)}
      className={className}
      style={{
        outline: 'none',
        whiteSpace: 'pre-wrap',
        ...(editing ? { boxShadow: 'inset 0 0 0 1px rgba(127,127,127,0.35)', borderRadius: 6 } : null),
        ...style,
      }}
    >
      {value}
    </Tag>
  )
}

export function OgCard({
  s,
  set,
  cardRef,
  editing,
  rev,
  clock,
}: {
  s: OgState
  set: <K extends keyof OgState>(k: K, v: OgState[K]) => void
  cardRef: React.RefObject<HTMLDivElement | null>
  editing: boolean
  rev: number
  clock: number | null
}) {
  const drift =
    clock === null || !s.animOn ? 0 : (1 - easeOut(clamp01(clock / Math.max(0.2, s.animDuration)))) * s.animBgDrift

  const orb = (color: string, size: number, pos: React.CSSProperties, opacity: number): React.CSSProperties => ({
    position: 'absolute',
    borderRadius: '50%',
    width: size * (s.orbSize / 100),
    height: size * (s.orbSize / 100),
    background: color,
    filter: `blur(${s.orbBlur}px)`,
    opacity,
    transform: drift ? `translate3d(${drift}px, ${-drift * 0.6}px, 0)` : undefined,
    ...pos,
  })

  const o = s.orbOpacity / 100

  return (
    <div
      ref={cardRef}
      className={s.radius > 0 ? 'squircle-[var(--og-r)]' : undefined}
      style={{
        // @ts-expect-error custom property
        '--og-r': `${s.radius}px`,
        width: s.width,
        height: s.height,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: s.radius,
        boxShadow: '0 0 0 1px rgba(127, 127, 127, 0.15)',
        background:
          s.bgMode === 'gradient'
            ? `linear-gradient(${s.angle}deg, ${s.bgFrom} 0%, ${s.bgVia} 52%, ${s.bgTo} 100%)`
            : s.bgBase,
        fontFamily: 'var(--font-open-runde), var(--font-inter), system-ui, sans-serif',
      }}
    >
      {s.bgMode === 'image' && s.bgImage && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${s.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${s.bgScale / 100 + drift / 900})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: s.bgBase,
              opacity: s.bgImageDim / 100,
            }}
          />
        </>
      )}

      {s.bgMode === 'orbs' && (
        <>
          <div style={orb(s.bgFrom, 820, { top: -240, left: -140 }, o * 0.95)} />
          <div style={orb(s.glow, 720, { top: -180, right: -120 }, o * 0.85)} />
          <div style={orb(s.bgVia, 900, { bottom: -320, left: '20%' }, o * 0.8)} />
          <div style={orb(s.bgTo, 650, { bottom: -180, right: -80 }, o * 0.9)} />
        </>
      )}

      {s.bgMode === 'blur' && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: s.bgInset,
            left: s.bgInset,
            backgroundImage: `linear-gradient(${s.angle}deg, ${s.bgFrom} 0%, ${s.bgVia} 40%, ${s.glow} 70%, ${s.bgTo} 90%, ${s.bgFrom} 100%)`,
            filter: `blur(${s.bgBlur}px)`,
            transform: `scale(${s.bgScale / 100 + drift / 900})`,
          }}
        />
      )}

      {s.bgMode === 'gradient' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(120% 90% at 88% 78%, ${s.glow}66 0%, transparent 60%)`,
          }}
        />
      )}

      {s.showcaseWave && s.showcaseOn && s.showcaseLayout === 'shelf' && (
        <WaveDivider
          color={
            s.bgBase === 'rgb(255, 255, 255)' || s.bgBase === 'rgb(248, 250, 252)'
              ? 'rgba(226, 232, 240, 0.65)'
              : 'rgba(255, 255, 255, 0.06)'
          }
        />
      )}
      <ShowcaseGallery s={s} />

      <CardContent s={s} set={set} editing={editing} rev={rev} clock={clock} />
    </div>
  )
}

const ORDER: ChipKey[] = ['brand', 'tags', 'badge', 'title', 'subtitle', 'footer']

function CardContent({
  s,
  set,
  editing,
  rev,
  clock,
}: {
  s: OgState
  set: <K extends keyof OgState>(k: K, v: OgState[K]) => void
  editing: boolean
  rev: number
  clock: number | null
}) {
  const enter = (key: ChipKey): React.CSSProperties => {
    if (clock === null || !s.animOn) return {}
    const idx = ORDER.indexOf(key)
    const win = elemWindow(s)
    const t = (clock - idx * win.step) / win.dur
    return animStyle(s.animType, t)
  }

  const E = (key: ChipKey, style: React.CSSProperties, opts?: { block?: boolean; className?: string }) => {
    const chip = s.chips[key]
    return (
      <Editable
        rev={rev}
        editing={editing}
        value={String(s[key])}
        on={(v) => set(key as never, v as never)}
        block={opts?.block ?? false}
        className={opts?.className}
        style={{
          ...chipStyle(chip),
          color: chip.on && chip.text ? chip.text : undefined,
          ...style,
        }}
      />
    )
  }

  const brandRow =
    s.showBrand || s.showLogo ? (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: s.logoGap,
          ...enter('brand'),
        }}
      >
        {s.showLogo &&
          (s.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoUrl} alt="Logo" style={{ width: s.logoSize, height: s.logoSize, objectFit: 'contain' }} />
          ) : (
            <SpaceLogo size={s.logoSize} />
          ))}
        {s.showBrand &&
          E('brand', {
            fontSize: s.brandSize,
            fontWeight: 600,
            color: s.titleColor,
            letterSpacing: '-0.02em',
            width: 'fit-content',
          })}
      </div>
    ) : null

  const badgeChip = s.chips.badge
  const badge = s.showBadge ? (
    <div
      style={{
        ...enter('badge'),
        display: 'inline-flex',
        width: 'fit-content',
      }}
    >
      <Editable
        rev={rev}
        editing={editing}
        value={s.badge}
        on={(v) => set('badge', v)}
        className={s.badgeStyle === 'squircle' && badgeChip.on ? 'squircle-[var(--badge-r)]' : undefined}
        style={{
          // @ts-expect-error custom property
          '--badge-r': `${badgeChip.radius}px`,
          fontSize: s.badgeSize,
          fontWeight: 600,
          fontFamily: s.badgeMono ? 'var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace' : 'inherit',
          borderRadius: s.badgeStyle === 'pill' ? 999 : badgeChip.radius,
          ...chipStyle(badgeChip),
          color: badgeChip.on && badgeChip.text ? badgeChip.text : s.titleColor,
          width: 'fit-content',
        }}
      />
    </div>
  ) : null

  const tags = s.showTags
    ? E('tags', {
        fontSize: s.tagsSize,
        color: s.mutedColor,
        fontWeight: 500,
        letterSpacing: '-0.01em',
        ...enter('tags'),
        width: 'fit-content',
      })
    : null

  const footer = s.showFooter
    ? E('footer', {
        fontSize: s.footerSize,
        color: s.mutedColor,
        fontFamily: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace',
        fontWeight: 500,
        letterSpacing: '-0.02em',
        ...enter('footer'),
        width: 'fit-content',
      })
    : null

  const align = s.align

  const titleParts = parseAccentTitle(s.title)
  const hasAccent = !editing && titleParts.some((p) => p.isAccent)

  const title = (
    <div
      style={{
        ...enter('title'),
        textAlign: align,
      }}
    >
      {hasAccent ? (
        <div
          style={{
            color: s.titleColor,
            fontSize: s.titleSize,
            fontWeight: s.titleWeight,
            lineHeight: s.titleLeading,
            letterSpacing: `${s.titleTracking / 100}em`,
            textAlign: align,
            whiteSpace: 'pre-wrap',
            ...chipStyle(s.chips.title),
          }}
        >
          {titleParts.map((part, i) => (
            <span
              key={i}
              style={{
                color: part.isAccent ? (s.titleAccentColor || s.bgFrom) : undefined,
              }}
            >
              {part.text}
            </span>
          ))}
        </div>
      ) : (
        E(
          'title',
          {
            color: s.titleColor,
            fontSize: s.titleSize,
            fontWeight: s.titleWeight,
            lineHeight: s.titleLeading,
            letterSpacing: `${s.titleTracking / 100}em`,
            textAlign: align,
          },
          { block: true },
        )
      )}
    </div>
  )

  const subtitle = s.showSubtitle
    ? E(
        'subtitle',
        {
          ...enter('subtitle'),
          color: s.subtitleColor,
          fontSize: s.subtitleSize,
          lineHeight: 1.35,
          letterSpacing: '-0.02em',
          maxWidth: s.layout === 'split' ? 520 : 780,
          marginTop: 28,
          marginLeft: align === 'center' ? 'auto' : undefined,
          marginRight: align === 'center' ? 'auto' : undefined,
          textAlign: align,
        },
        { block: true },
      )
    : null

  const techBadges = s.showTechBadges ? (
    <TechBadgesRow
      badges={s.techBadges}
      size={Math.max(32, Math.round(s.subtitleSize * 1.5))}
      style={{
        marginTop: 22,
        marginLeft: align === 'center' ? 'auto' : undefined,
        marginRight: align === 'center' ? 'auto' : undefined,
        justifyContent: align === 'center' ? 'center' : 'flex-start',
      }}
    />
  ) : null

  const frame: React.CSSProperties = {
    position: 'relative',
    height: '100%',
    padding: s.padding,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  }

  const row = (extra?: React.CSSProperties): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    ...extra,
  })

  switch (s.layout) {
    case 'centered': {
      const isShelf = s.showcaseOn && s.showcaseLayout === 'shelf'
      return (
        <div
          style={{
            ...frame,
            alignItems: 'center',
            justifyContent: isShelf ? 'flex-start' : 'space-between',
            gap: isShelf ? 28 : undefined,
          }}
        >
          {isShelf ? (
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
              {brandRow ?? <span />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                {footer}
                {tags}
              </div>
            </div>
          ) : (
            brandRow ?? <span />
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              zIndex: 2,
              marginTop: isShelf ? 8 : 0,
            }}
          >
            {badge}
            <div style={{ marginTop: badge ? 24 : 0 }}>{title}</div>
            {subtitle}
            {techBadges}
          </div>
          {!isShelf && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, zIndex: 2 }}>
              {footer}
              {tags}
            </div>
          )}
        </div>
      )
    }

    case 'split':
      return (
        <div style={{ ...frame, display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {brandRow ?? <span />}
            <div>
              {title}
              {subtitle}
              {techBadges}
            </div>
            {footer ?? <span />}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            {tags ?? <span />}
            {badge ?? <span />}
          </div>
        </div>
      )

    case 'bottom':
      return (
        <div style={{ ...frame, justifyContent: 'flex-end', gap: 24 }}>
          <div style={{ position: 'absolute', top: s.padding, left: s.padding }}>{brandRow}</div>
          <div style={{ position: 'absolute', top: s.padding, right: s.padding }}>{tags}</div>
          {badge}
          {title}
          {subtitle}
          {techBadges}
          <div style={{ marginTop: 8 }}>{footer}</div>
        </div>
      )

    case 'panel':
      return (
        <div style={{ ...frame, justifyContent: 'space-between' }}>
          <div style={row()}>
            {brandRow ?? <span />}
            {tags}
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 32,
              padding: 44,
              backdropFilter: 'blur(18px)',
            }}
          >
            {badge}
            <div style={{ marginTop: badge ? 24 : 0 }}>{title}</div>
            {subtitle}
            {techBadges}
          </div>
          <div style={row()}>{footer ?? <span />}</div>
        </div>
      )

    case 'banner':
      return (
        <div style={{ ...frame, justifyContent: 'center', gap: 26 }}>
          <div style={{ position: 'absolute', top: s.padding, left: s.padding, right: s.padding, ...row() }}>
            {brandRow ?? <span />}
            {tags}
          </div>
          {badge}
          {title}
          {subtitle}
          {techBadges}
          <div style={{ position: 'absolute', bottom: s.padding, left: s.padding }}>{footer}</div>
        </div>
      )

    case 'poster':
      return (
        <div style={{ ...frame, alignItems: 'center', justifyContent: 'center', gap: 22, textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: s.padding, left: s.padding, right: s.padding, ...row() }}>
            {brandRow ?? <span />}
            {tags}
          </div>
          {title}
          {subtitle}
          {techBadges}
          <div style={{ marginTop: 10 }}>{badge}</div>
          <div
            style={{
              position: 'absolute',
              bottom: s.padding,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {footer}
          </div>
        </div>
      )

    case 'sidebar':
      return (
        <div style={{ ...frame, display: 'grid', gridTemplateColumns: '0.32fr 1fr', gap: 44 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRight: '1px solid rgba(127,127,127,0.25)',
              paddingRight: 28,
            }}
          >
            {brandRow ?? <span />}
            {tags}
            {footer ?? <span />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
            {badge}
            {title}
            {subtitle}
            {techBadges}
          </div>
        </div>
      )

    case 'quote':
      return (
        <div style={{ ...frame, justifyContent: 'center', gap: 20 }}>
          <div style={{ position: 'absolute', top: s.padding, left: s.padding, right: s.padding, ...row() }}>
            {brandRow ?? <span />}
            {badge}
          </div>
          <div style={{ display: 'flex', gap: 26, alignItems: 'flex-start' }}>
            <span
              style={{
                color: s.titleColor,
                fontSize: s.titleSize * 1.6,
                lineHeight: 0.8,
                opacity: 0.35,
              }}
            >
              “
            </span>
            <div>
              {title}
              {subtitle}
              {techBadges}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: s.padding, left: s.padding, right: s.padding, ...row() }}>
            {footer ?? <span />}
            {tags}
          </div>
        </div>
      )

    case 'ticket':
      return (
        <div style={{ ...frame, justifyContent: 'space-between' }}>
          <div style={row()}>
            {brandRow ?? <span />}
            {tags}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: 36,
              borderTop: '1px dashed rgba(127,127,127,0.4)',
              borderBottom: '1px dashed rgba(127,127,127,0.4)',
              padding: '34px 0',
            }}
          >
            <div>
              {title}
              {subtitle}
              {techBadges}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
              {badge}
              {footer}
            </div>
          </div>
          <div style={{ height: 1 }} />
        </div>
      )

    case 'corners':
      return (
        <div style={{ ...frame, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: s.padding, left: s.padding }}>{brandRow}</div>
          <div style={{ position: 'absolute', top: s.padding, right: s.padding }}>{tags}</div>
          <div style={{ position: 'absolute', bottom: s.padding, left: s.padding }}>{footer}</div>
          <div style={{ position: 'absolute', bottom: s.padding, right: s.padding }}>{badge}</div>
          <div style={{ textAlign: align, maxWidth: 940 }}>
            {title}
            {subtitle}
            {techBadges}
          </div>
        </div>
      )

    case 'stack':
      return (
        <div
          style={{
            ...frame,
            justifyContent: 'center',
            alignItems: align === 'center' ? 'center' : 'flex-start',
            gap: 18,
          }}
        >
          {brandRow}
          {badge}
          {title}
          {subtitle}
          {techBadges}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {tags}
            {footer}
          </div>
        </div>
      )

    case 'editorial':
    default:
      return (
        <div style={{ ...frame, justifyContent: 'space-between' }}>
          <div style={row()}>
            {brandRow ?? <span />}
            {tags}
          </div>
          <div>
            {title}
            {subtitle}
            {techBadges}
          </div>
          <div style={row()}>
            {footer ?? <span />}
            {badge}
          </div>
        </div>
      )
  }
}
