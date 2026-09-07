'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'
import { Badge } from '@/registry/primitives/badge'
import { Code } from '@/registry/primitives/code'
import { Kbd } from '@/registry/primitives/kbd'
import { bloomSound } from '@/components/providers/sound-provider'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/registry/primitives/select'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/registry/primitives/accordion'
import {
  IconDeviceDesktop,
  IconDeviceTablet,
  IconDeviceMobile,
  IconTypography,
  IconLetterCase,
} from '@tabler/icons-react'
type ViewportMode = 'desktop' | 'tablet' | 'mobile'

export type PlaygroundFont = {
  id: string
  name: string
  category: 'Sans-serif' | 'Serif' | 'Grotesk'
  className: string
  variable?: string
  fontFamily: string
}

export function TypographyPlaygroundClient({ fonts }: { fonts: PlaygroundFont[] }) {
  const [viewport, setViewport] = React.useState<ViewportMode>('desktop')
  const [selectedFontId, setSelectedFontId] = React.useState<string>('open-runde')

  const currentFont = fonts.find((f) => f.id === selectedFontId) ?? fonts[0]
  if (!currentFont) return null

  const containerWidthClass = {
    desktop: 'w-full',
    tablet: 'max-w-[620px] mx-auto',
    mobile: 'max-w-[340px] mx-auto',
  }[viewport]

  return (
    <div
      className={cn(
        'rounded-3xl p-2 bg-muted text-sm my-6 not-prose overflow-hidden',
        ...fonts.map((f) => f.variable).filter(Boolean),
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-2">
        <div className="flex items-center gap-2">
          <Badge square size="lg" className="bg-background text-foreground">
            <IconTypography className="size-3.5" />
          </Badge>
          <span className="font-medium text-muted-foreground">Font :</span>
          <div className="w-42">
            <Select
              value={selectedFontId}
              onValueChange={(val) => {
                if (val) setSelectedFontId(val)
              }}
              // showIcon={false}
            >
              <SelectTrigger size="lg" className="border-0 text-xs">
                <SelectValue>{currentFont.name}</SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                {fonts.map((font) => (
                  <SelectItem key={font.id} value={font.id}>
                    <div className="flex items-center justify-between gap-3 w-full">
                      <span className="font-medium">{font.name}</span>
                      <span className="text-[11px] text-muted-foreground/70">{font.category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={viewport} onValueChange={(val) => setViewport(val as ViewportMode)}>
          <TabsList className="flex items-center rounded-lg bg-background p-1 font-medium relative z-0">
            <TabsTab
              value="desktop"
              onClick={() => bloomSound()}
              className="flex items-center gap-1.5 relative z-10 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted rounded-md"
            >
              <IconDeviceDesktop className="size-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </TabsTab>
            <TabsTab
              value="tablet"
              onClick={() => bloomSound()}
              className="flex items-center gap-1.5 relative z-10 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted rounded-md"
            >
              <IconDeviceTablet className="size-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </TabsTab>
            <TabsTab
              value="mobile"
              onClick={() => bloomSound()}
              className="flex items-center gap-1.5 relative z-10 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted rounded-md"
            >
              <IconDeviceMobile className="size-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-2xl bg-background border border-border/40 overflow-hidden">
        {/* Simulated Preview Canvas with active font */}
        <div
          className={cn(
            'p-5 sm:p-8 bg-background transition-all duration-200 [&_*]:font-[inherit]',
            currentFont.className,
          )}
          style={{ fontFamily: currentFont.fontFamily }}
        >
          <div
            className={cn(
              // containerWidthClass,
              'flex flex-col gap-8 transition-all duration-200',
            )}
          >
            {/* Article Header (Heading 2) */}
            <div className="flex flex-col gap-3 border-b border-border/60 pb-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit px-2 py-0.5 font-mono">
                  Heading 2
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">{currentFont.name} • SemiBold / 600</span>
              </div>
              <h2
                className={cn(
                  'font-semibold text-foreground tracking-tight text-wrap-balance',
                  viewport === 'desktop' && 'text-4xl sm:text-5xl leading-[1.14]',
                  viewport === 'tablet' && 'text-3xl leading-tight',
                  viewport === 'mobile' && 'text-2xl leading-snug',
                )}
                style={{ fontFamily: currentFont.fontFamily }}
              >
                Levy Chronicles : Type Architecture
              </h2>
              <p
                className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-[65ch]"
                style={{ fontFamily: currentFont.fontFamily }}
              >
                In modern product interfaces, typography is the core structural foundation. Space UI combines responsive
                scale ratios, optical line-heights, and strict measure limits to maximize legibility across all screen
                densities.
              </p>
            </div>

            {/* Section 1 (Heading 4) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit px-2 py-0.5 font-mono">
                  Heading 4
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Medium / 500</span>
              </div>
              <h4
                className={cn(
                  'font-semibold text-foreground tracking-tight',
                  viewport === 'desktop' && 'text-2xl leading-snug',
                  viewport === 'tablet' && 'text-xl leading-snug',
                  viewport === 'mobile' && 'text-lg leading-normal',
                )}
                style={{ fontFamily: currentFont.fontFamily }}
              >
                The Practice of Typographic Restraint
              </h4>
              <p
                className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-[65ch]"
                style={{ fontFamily: currentFont.fontFamily }}
              >
                Good typography is mostly restraint. Rather than hundreds of random one-off font sizes, we maintain a
                coherent descending hierarchy with dedicated roles for headings, body copy, and UI controls.
              </p>
            </div>

            {/* Blockquote with clean Space UI border */}
            <blockquote
              className="border-s-2 border-primary ps-4 py-1.5 text-sm sm:text-[15px] italic text-muted-foreground leading-relaxed bg-muted/30 rounded-e-md"
              style={{ fontFamily: currentFont.fontFamily }}
            >
              &ldquo;Every interface begins with text. Every typographic choice must prioritize clarity and reading
              comfort before ornamentation.&rdquo;
            </blockquote>

            {/* Section 2 (Heading 6 & Tabular Metrics) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit px-2 py-0.5 font-mono">
                  Heading 6
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">SemiBold / 600</span>
              </div>
              <h6 className="text-base font-semibold text-foreground" style={{ fontFamily: currentFont.fontFamily }}>
                Core Typography Benchmarks
              </h6>
              <ul
                className="flex flex-col gap-2 text-sm text-muted-foreground list-disc ps-5"
                style={{ fontFamily: currentFont.fontFamily }}
              >
                <li>
                  <strong className="font-medium text-foreground">Headings:</strong> tight line-height (
                  <Code className="text-xs">1.10 – 1.25</Code>) with optical negative tracking.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Body copy:</strong> measure capped at{' '}
                  <Code className="text-xs">60–75ch</Code> and relaxed line-height (
                  <Code className="text-xs">1.50 – 1.60</Code>).
                </li>
                <li>
                  <strong className="font-medium text-foreground">Dynamic figures:</strong> tabular rendering with{' '}
                  <Code className="text-xs">tabular-nums</Code> (
                  <span className="font-mono tabular-nums text-foreground">$1,248.50</span>).
                </li>
                <li>
                  <strong className="font-medium text-foreground">Keyboard shortcuts:</strong> rendered with{' '}
                  <Kbd>⌘</Kbd> + <Kbd>K</Kbd>.
                </li>
              </ul>
            </div>

            {/* Accordion FAQ in standard Space UI style */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit px-2 py-0.5 font-mono">
                  Interactive Accordion
                </Badge>
              </div>
              <Accordion className="w-full" defaultValue={['faq-1']}>
                <AccordionItem value="faq-1">
                  <AccordionTrigger style={{ fontFamily: currentFont.fontFamily }}>
                    How does Space UI adapt typography for mobile viewports?
                  </AccordionTrigger>
                  <AccordionPanel style={{ fontFamily: currentFont.fontFamily }}>
                    Using CSS variables and Tailwind CSS v4 utilities, heading and body sizes scale down smoothly on
                    smaller screens while maintaining optimal line-heights and comfortable reading measures.
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger style={{ fontFamily: currentFont.fontFamily }}>
                    Why use tabular numerals for metric displays?
                  </AccordionTrigger>
                  <AccordionPanel style={{ fontFamily: currentFont.fontFamily }}>
                    Enabling tabular numbers gives every digit an identical width, eliminating layout shifts and jitter
                    during real-time data streaming or countdowns.
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Heading Specs Component (H1 to H6, Space UI squircle containers)
// -----------------------------------------------------------------------------
export function HeadingSpecs() {
  const [viewport, setViewport] = React.useState<ViewportMode>('desktop')

  const headings = [
    {
      level: 'Heading 1',
      tag: 'H1',
      sample: 'Display Headline One',
      specs: {
        desktop: {
          size: '64px / 4.0rem',
          lineHeight: '72px / 1.12',
          tracking: '-0.025em / -1.6px',
          weight: 'SemiBold / 600',
          tw: 'text-5xl lg:text-6xl font-semibold leading-[1.12] tracking-tight',
        },
        tablet: {
          size: '48px / 3.0rem',
          lineHeight: '56px / 1.16',
          tracking: '-0.020em / -1.0px',
          weight: 'SemiBold / 600',
          tw: 'text-4xl sm:text-5xl font-semibold leading-[1.16]',
        },
        mobile: {
          size: '36px / 2.25rem',
          lineHeight: '44px / 1.22',
          tracking: '-0.015em / -0.5px',
          weight: 'SemiBold / 600',
          tw: 'text-3xl font-semibold leading-tight',
        },
      },
    },
    {
      level: 'Heading 2',
      tag: 'H2',
      sample: 'Section Title Two',
      specs: {
        desktop: {
          size: '48px / 3.0rem',
          lineHeight: '56px / 1.16',
          tracking: '-0.020em / -1.0px',
          weight: 'SemiBold / 600',
          tw: 'text-4xl lg:text-5xl font-semibold leading-[1.16] tracking-tight',
        },
        tablet: {
          size: '36px / 2.25rem',
          lineHeight: '44px / 1.22',
          tracking: '-0.015em / -0.5px',
          weight: 'SemiBold / 600',
          tw: 'text-3xl font-semibold leading-tight',
        },
        mobile: {
          size: '28px / 1.75rem',
          lineHeight: '36px / 1.28',
          tracking: '-0.010em / -0.3px',
          weight: 'SemiBold / 600',
          tw: 'text-2xl font-semibold leading-snug',
        },
      },
    },
    {
      level: 'Heading 3',
      tag: 'H3',
      sample: 'Subsection Header Three',
      specs: {
        desktop: {
          size: '36px / 2.25rem',
          lineHeight: '44px / 1.22',
          tracking: '-0.015em / -0.5px',
          weight: 'SemiBold / 600',
          tw: 'text-3xl font-semibold leading-tight tracking-tight',
        },
        tablet: {
          size: '28px / 1.75rem',
          lineHeight: '36px / 1.28',
          tracking: '-0.010em / -0.3px',
          weight: 'SemiBold / 600',
          tw: 'text-2xl font-semibold leading-snug',
        },
        mobile: {
          size: '22px / 1.375rem',
          lineHeight: '30px / 1.36',
          tracking: '-0.005em / -0.1px',
          weight: 'SemiBold / 600',
          tw: 'text-xl font-semibold leading-snug',
        },
      },
    },
    {
      level: 'Heading 4',
      tag: 'H4',
      sample: 'Card & Group Title Four',
      specs: {
        desktop: {
          size: '28px / 1.75rem',
          lineHeight: '36px / 1.28',
          tracking: '-0.010em / -0.3px',
          weight: 'SemiBold / 600',
          tw: 'text-2xl font-semibold leading-snug tracking-tight',
        },
        tablet: {
          size: '24px / 1.5rem',
          lineHeight: '32px / 1.33',
          tracking: '-0.005em / -0.1px',
          weight: 'SemiBold / 600',
          tw: 'text-xl font-semibold leading-snug',
        },
        mobile: {
          size: '20px / 1.25rem',
          lineHeight: '28px / 1.40',
          tracking: '0em / 0px',
          weight: 'SemiBold / 600',
          tw: 'text-lg font-semibold leading-normal',
        },
      },
    },
    {
      level: 'Heading 5',
      tag: 'H5',
      sample: 'Feature Headline Five',
      specs: {
        desktop: {
          size: '22px / 1.375rem',
          lineHeight: '30px / 1.36',
          tracking: '-0.005em / -0.1px',
          weight: 'SemiBold / 600',
          tw: 'text-xl font-semibold leading-snug',
        },
        tablet: {
          size: '20px / 1.25rem',
          lineHeight: '28px / 1.40',
          tracking: '0em / 0px',
          weight: 'SemiBold / 600',
          tw: 'text-lg font-semibold leading-normal',
        },
        mobile: {
          size: '18px / 1.125rem',
          lineHeight: '26px / 1.44',
          tracking: '0em / 0px',
          weight: 'SemiBold / 600',
          tw: 'text-base font-semibold leading-normal',
        },
      },
    },
    {
      level: 'Heading 6',
      tag: 'H6',
      sample: 'Subheading & Label Six',
      specs: {
        desktop: {
          size: '18px / 1.125rem',
          lineHeight: '26px / 1.44',
          tracking: '0em / 0px',
          weight: 'SemiBold / 600',
          tw: 'text-lg font-semibold leading-normal',
        },
        tablet: {
          size: '16px / 1.0rem',
          lineHeight: '24px / 1.50',
          tracking: '0em / 0px',
          weight: 'SemiBold / 600',
          tw: 'text-base font-semibold leading-normal',
        },
        mobile: {
          size: '15px / 0.9375rem',
          lineHeight: '22px / 1.46',
          tracking: '0em / 0px',
          weight: 'SemiBold / 600',
          tw: 'text-[15px] font-semibold leading-normal',
        },
      },
    },
  ]

  return (
    <div className="rounded-3xl p-2 bg-muted text-sm my-6 not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-2">
        <div className="flex items-center gap-2">
          <Badge square size="lg" className="bg-background text-foreground">
            <IconLetterCase className="size-3.5" />
          </Badge>
          <span className="font-medium text-muted-foreground">Heading Specs</span>
        </div>

        {/* Viewport Control via Registry Tabs */}
        <Tabs value={viewport} onValueChange={(val) => setViewport(val as ViewportMode)}>
          <TabsList className="flex items-center rounded-lg bg-background p-1 font-medium relative z-0">
            <TabsTab
              value="desktop"
              onClick={() => bloomSound()}
              className="flex items-center gap-1.5 relative z-10 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted rounded-md"
            >
              <IconDeviceDesktop className="size-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </TabsTab>
            <TabsTab
              value="tablet"
              onClick={() => bloomSound()}
              className="flex items-center gap-1.5 relative z-10 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted rounded-md"
            >
              <IconDeviceTablet className="size-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </TabsTab>
            <TabsTab
              value="mobile"
              onClick={() => bloomSound()}
              className="flex items-center gap-1.5 relative z-10 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted rounded-md"
            >
              <IconDeviceMobile className="size-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-2xl bg-background border border-border/40 p-4 sm:p-6 flex flex-col gap-4">
        {/* Headings List */}
        <div className="flex flex-col gap-3">
          {headings.map((item) => {
            const spec = item.specs[viewport]
            return (
              <div
                key={item.level}
                className={cn(
                  'transition-all duration-200 border-b border-border last:border-0 px-2 py-4 flex flex-col gap-3',
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-fit text-[.6875rem] px-2 py-0.5 font-mono">
                      {item.level}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">{item.tag}</span>
                  </div>
                  <Code className="text-xs">{spec.tw}</Code>
                </div>

                <div
                  className="font-semibold text-foreground text-wrap-balance"
                  style={{
                    fontSize: spec.size.split(' / ')[0],
                    lineHeight: spec.lineHeight.split(' / ')[0],
                    letterSpacing: spec.tracking.split(' / ')[0],
                    fontWeight: 600,
                  }}
                >
                  {item.sample}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: 'Size', key: spec.size },
                    { label: 'Weight', key: spec.weight },
                    { label: 'Line Height', key: spec.lineHeight },
                    { label: 'Tracking', key: spec.tracking },
                  ].map((item) => (
                    <div key={item.key} className="flex flex-wrap items-center gap-2 ">
                      <span className="text-[.8125rem] text-muted-foreground">{item.label} :</span>
                      <Badge
                        variant="secondary"
                        className="w-fit text-[.6875rem] px-2 py-0.5 font-mono font-medium text-foreground"
                      >
                        {item.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Body & UI Specs Component (Space UI squircle containers)
// -----------------------------------------------------------------------------
export function BodySpecs() {
  const [viewport, setViewport] = React.useState<ViewportMode>('desktop')

  const bodyStyles = [
    {
      name: 'Body 18 (Lead / Large)',
      tag: 'text-lg',
      size: '18px / 1.125rem',
      lineHeight: '28px / 1.55',
      tracking: '-0.005em',
      weights: 'Regular / 400 • Medium / 500',
      role: 'Lead paragraphs, excerpts, intro summaries',
      sample: 'Space UI provides accessible, polished primitives built on React and Tailwind CSS v4.',
    },
    {
      name: 'Body 16 (Base / Default)',
      tag: 'text-base',
      size: '16px / 1.0rem',
      lineHeight: '24px / 1.50',
      tracking: '-0.005em',
      weights: 'Regular / 400 • Medium / 500',
      role: 'Standard documentation body copy, blog prose, mobile form inputs',
      sample: 'The quick brown fox jumps over the lazy dog. Comfortable reading measure capped at 65 characters.',
    },
    {
      name: 'Body 14 (UI Small / Controls)',
      tag: 'text-sm',
      size: '14px / 0.875rem',
      lineHeight: '20px / 1.43',
      tracking: '0em',
      weights: 'Regular / 400 • Medium / 500 • SemiBold / 600',
      role: 'Buttons, desktop inputs, menu items, table records, dialog content',
      sample: 'Desktop control labels, table records, and form field descriptions.',
    },
    {
      name: 'Body 13 (Subtext / Captions)',
      tag: 'text-[13px]',
      size: '13px / 0.8125rem',
      lineHeight: '18px / 1.38',
      tracking: '0em',
      weights: 'Regular / 400 • Medium / 500',
      role: 'Helper texts, breadcrumbs, timestamp strings, metadata rows',
      sample: 'Last edited 2 minutes ago • 1.2k stars • Licensed under MIT',
    },
    {
      name: 'Body 12 (Badge / Legal / Micro)',
      tag: 'text-xs',
      size: '12px / 0.75rem',
      lineHeight: '16px / 1.33',
      tracking: '+0.010em',
      weights: 'Medium / 500 • SemiBold / 600',
      role: 'Status badges, kbd shortcuts, legal notices, micro tags',
      sample: 'CTRL + K • PRODUCTION READY • STATUS: ACTIVE',
    },
  ]

  return (
    <div className="rounded-3xl p-2 bg-muted text-sm my-6 not-prose">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-2">
        <div className="flex items-center gap-2">
          <Badge square size="lg" className="bg-background text-foreground">
            <IconTypography className="size-3.5" />
          </Badge>
          <span className="font-medium text-muted-foreground">Body & UI Specs :</span>
        </div>

        {/* Viewport Control via Registry Tabs */}
        <Tabs value={viewport} onValueChange={(val) => setViewport(val as ViewportMode)}>
          <TabsList className="flex items-center rounded-lg bg-background p-1 font-medium relative z-0">
            <TabsTab
              value="desktop"
              onClick={() => bloomSound()}
              className="flex items-center gap-1.5 relative z-10 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted rounded-md"
            >
              <IconDeviceDesktop className="size-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </TabsTab>
            <TabsTab
              value="tablet"
              onClick={() => bloomSound()}
              className="flex items-center gap-1.5 relative z-10 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted rounded-md"
            >
              <IconDeviceTablet className="size-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </TabsTab>
            <TabsTab
              value="mobile"
              onClick={() => bloomSound()}
              className="flex items-center gap-1.5 relative z-10 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted rounded-md"
            >
              <IconDeviceMobile className="size-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-2xl bg-background border border-border/40 p-4 sm:p-6 flex flex-col gap-3">
        {bodyStyles.map((item) => (
          <div
            key={item.name}
            className={cn(
              'transition-all duration-200 border-b border-border last:border-0 p-4 sm:p-5 flex flex-col gap-3',
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-medium text-foreground">{item.name}</span>
              <Code className="text-xs">{item.tag}</Code>
            </div>

            <div
              className="text-foreground"
              style={{
                fontSize: item.size.split(' / ')[0],
                lineHeight: item.lineHeight.split(' / ')[0],
                letterSpacing: item.tracking,
              }}
            >
              {item.sample}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: 'Size', key: item.size },
                { label: 'Weight', key: item.weights },
                { label: 'Line Height', key: item.lineHeight },
                { label: 'Role', key: item.role },
                { label: 'Tracking', key: item.tracking },
              ].map((item) => (
                <div key={item.key} className="flex flex-wrap items-center gap-2 ">
                  <span className="text-[.8125rem] text-muted-foreground">{item.label} :</span>
                  <Badge
                    variant="secondary"
                    className="w-fit text-[.6875rem] px-2 py-0.5 font-mono font-medium text-foreground"
                  >
                    {item.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
