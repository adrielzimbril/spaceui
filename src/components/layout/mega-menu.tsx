'use client'

import { ToolAssetIcon } from '@/components/marketing/tools/tool-asset-icon'
import { megaMenuDocs, megaMenuTools } from '@/config/menu-config'
import { cn } from '@/registry/lib/utils'
import { Badge } from '@/registry/primitives/badge'
import { Link } from '@/registry/primitives/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/registry/primitives/navigation-menu'
import { IconArrowRight, IconChevronRight } from '@tabler/icons-react'
import { Avatar } from '@usespaceui/avatars/react'
import * as React from 'react'

const docs = megaMenuDocs
const designTools = megaMenuTools

function clampRadius(radius: number, width: number, height: number): number {
  return Math.max(0, Math.min(radius, width / 2, height / 2))
}

function createInverseTopPath(
  width: number,
  height: number,
  topRadius: number,
  yOffset: number = 0,
  bottomRadius?: number,
): string {
  const topR = clampRadius(topRadius, width, height)
  const botR = clampRadius(bottomRadius ?? topR, width, height)
  const l = yOffset + topR
  return `M ${-topR} ${yOffset} H ${width + topR} A ${topR} ${topR} 0 0 0 ${width} ${l} V ${height - botR} A ${botR} ${botR} 0 0 1 ${width - botR} ${height} H ${botR} A ${botR} ${botR} 0 0 1 0 ${height - botR} V ${l} A ${topR} ${topR} 0 0 0 ${-topR} ${yOffset} Z`
}

function createInverseTopStrokePath(
  width: number,
  height: number,
  topRadius: number,
  yOffset: number = 0,
  bottomRadius?: number,
): string {
  const topR = clampRadius(topRadius, width, height)
  const botR = clampRadius(bottomRadius ?? topR, width, height)
  const l = yOffset + topR
  return `M ${width + topR} ${yOffset} A ${topR} ${topR} 0 0 0 ${width} ${l} V ${height - botR} A ${botR} ${botR} 0 0 1 ${width - botR} ${height} H ${botR} A ${botR} ${botR} 0 0 1 0 ${height - botR} V ${l} A ${topR} ${topR} 0 0 0 ${-topR} ${yOffset}`
}

function SpaceMenuShell() {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const fillPathRef = React.useRef<SVGPathElement>(null)
  const strokePathRef = React.useRef<SVGPathElement>(null)

  React.useLayoutEffect(() => {
    const svg = svgRef.current
    const popupEl = svg?.parentElement
    if (!svg || !popupEl) return

    const topRadius = 16
    const bottomRadius = 24

    const drawPaths = (w: number, h: number) => {
      w = Math.round(w)
      h = Math.round(h)
      if (w <= 0 || h <= 0) return

      const fill = createInverseTopPath(w, h + 1, topRadius, -1, bottomRadius)
      const stroke = createInverseTopStrokePath(w, h, topRadius, -1, bottomRadius)

      svg.setAttribute('width', `${w}`)
      svg.setAttribute('height', `${h}`)
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)

      if (fillPathRef.current) fillPathRef.current.setAttribute('d', fill)
      if (strokePathRef.current) strokePathRef.current.setAttribute('d', stroke)
    }

    // Initial sync
    drawPaths(popupEl.offsetWidth, popupEl.offsetHeight)

    const ro = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0]
      if (box) {
        drawPaths(box.inlineSize, box.blockSize)
      } else {
        drawPaths(entry.contentRect.width, entry.contentRect.height)
      }
    })
    ro.observe(popupEl)

    return () => {
      ro.disconnect()
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute  top-[.0875rem] left-0 overflow-visible z-0"
    >
      <path ref={fillPathRef} className="fill-background" />
      <path ref={strokePathRef} className="fill-none stroke-border" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

interface MenuAvatarIconProps {
  seed: string
  className?: string
  variant?: string
}

export function MenuAvatarIcon({ seed, className, variant }: MenuAvatarIconProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center size-8 squircle rounded-full relative overflow-hidden border border-muted',
        className,
      )}
    >
      <Avatar name={seed} variant={(variant as any) || 'shaula'} size={32} circle={false} />
    </div>
  )
}

export function ToolMenuIcon({
  tool,
  size = 32,
  className,
}: {
  tool: (typeof designTools)[number]
  size?: number
  className?: string
}) {
  const isAllTools = tool.label === 'all-tools' || tool.title.toLowerCase().includes('all tools')
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center squircle rounded-full relative overflow-hidden border border-muted',
        isAllTools ? 'bg-background' : 'bg-muted',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <ToolAssetIcon label={tool.title || tool.label} size={size} />
    </div>
  )
}

const DEFAULT_MENU_SIZES: Record<string, { width: number; height: number }> = {
  docs: { width: 420, height: 382 },
  library: { width: 560, height: 300 },
  tools: { width: 760, height: 526 },
}

function MenuContentMeasurer({
  id,
  onMeasured,
  children,
}: {
  id: string
  onMeasured: (id: string, width: number, height: number) => void
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const parent = el.parentElement
      if (!parent) return
      const w = Math.round(parent.offsetWidth)
      const h = Math.round(parent.offsetHeight)
      if (w > 0 && h > 0) {
        onMeasured(id, w, h)
      }
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.parentElement) {
      ro.observe(el.parentElement)
    }

    return () => ro.disconnect()
  }, [id, onMeasured])

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  )
}

export function MegaMenu({ className }: { className?: string }) {
  const [value, setValue] = React.useState<string | null>(null)
  const isClickTriggered = React.useRef<boolean>(false)
  const [menuSizes, setMenuSizes] = React.useState(DEFAULT_MENU_SIZES)
  const lastValueRef = React.useRef<string>('library')

  if (value && menuSizes[value]) {
    lastValueRef.current = value
  }

  const activeSize = value && menuSizes[value] ? menuSizes[value] : menuSizes[lastValueRef.current]

  const handleMeasured = React.useCallback((id: string, width: number, height: number) => {
    setMenuSizes((prev) => {
      const existing = prev[id]
      if (existing && existing.width === width && Math.abs(existing.height - height) <= 1) {
        return prev
      }
      return {
        ...prev,
        [id]: { width, height },
      }
    })
  }, [])

  const handleClose = () => {
    setValue(null)
    isClickTriggered.current = false
  }

  const handleValueChange = (
    nextValue: string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventDetails?: any,
  ) => {
    const reason = eventDetails?.reason

    if (reason === 'trigger-press') {
      if (value === nextValue && isClickTriggered.current) {
        handleClose()
      } else {
        setValue(nextValue)
        isClickTriggered.current = !!nextValue
      }
      return
    }

    if (reason === 'outside-press') {
      if (isClickTriggered.current) {
        return
      }
      handleClose()
      return
    }

    if (reason === 'trigger-hover') {
      if (nextValue === null && isClickTriggered.current) {
        return
      }
      setValue(nextValue)
      return
    }

    setValue(nextValue)
  }

  return (
    <div className="relative">
      <NavigationMenu
        value={value}
        onValueChange={handleValueChange}
        delay={120}
        closeDelay={300}
        className={className}
      >
        <NavigationMenuList className="flex items-center gap-1 text-sm font-medium">
          {/* Components Link */}
          <NavigationMenuItem value="components">
            <Link
              href="/components"
              className={cn(
                navigationMenuTriggerStyle(),
                'bg-transparent hover:bg-muted focus:bg-muted no-underline gap-1.5',
              )}
            >
              <span
                aria-hidden="true"
                className="hidden size-1.5 rounded-full bg-current opacity-40 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 shrink-0"
              />
              Components
            </Link>
          </NavigationMenuItem>
          {/* Primitives Link */}
          {/* <NavigationMenuItem value="components">
            <Link
              href="/Primitives"
              className={cn(
                navigationMenuTriggerStyle(),
                'bg-transparent hover:bg-muted focus:bg-muted no-underline gap-1.5',
              )}
            >
              <span
                aria-hidden="true"
                className="hidden size-1.5 rounded-full bg-current opacity-40 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 shrink-0"
              />
              Primitives
            </Link>
          </NavigationMenuItem> */}

          {/* Docs Menu */}
          <NavigationMenuItem value="docs">
            <NavigationMenuTrigger className="bg-transparent hover:bg-muted focus:bg-muted gap-1.5">
              <span
                aria-hidden="true"
                className="hidden size-1.5 rounded-full bg-current opacity-40 transition-all duration-300 group-hover:opacity-100 group-data-[state=open]:opacity-100 group-data-popup-open:opacity-100 group-data-[state=open]:scale-125 group-data-popup-open:scale-125 shrink-0"
              />
              Docs
            </NavigationMenuTrigger>
            <NavigationMenuContent keepMounted className="w-105 shrink-0 max-w-none p-5 pt-3.5">
              <MenuContentMeasurer id="docs" onMeasured={handleMeasured}>
                <div className="hidden text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 mb-2">
                  Documentation
                </div>
                <div className="grid gap-1">
                  {docs.map((doc) => (
                    <Link
                      key={doc.title}
                      className="group/row rounded-xl flex flex-row items-center gap-3 p-2.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted data-[active=true]:bg-muted dark:hover:bg-muted dark:focus-visible:bg-muted dark:data-[active=true]:bg-muted"
                      href={doc.href}
                      onClick={handleClose}
                    >
                      <MenuAvatarIcon seed={doc.title.toLowerCase()} />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-foreground flex items-center gap-2 text-sm leading-none font-medium">
                          {doc.title}
                          {doc.badge && (
                            <Badge className="rounded-sm px-1.5" variant="info">
                              <span aria-hidden="true">{doc.badge}</span>
                              <span className="sr-only">New feature</span>
                            </Badge>
                          )}
                        </span>
                        <span className="text-muted-foreground truncate text-xs leading-snug">{doc.description}</span>
                      </span>
                      <IconChevronRight className="size-4 text-muted-foreground/0 group-hover/row:text-muted-foreground/60 group-focus-visible/row:text-muted-foreground/60 ml-2 shrink-0 -translate-x-1 transition-all duration-200 group-hover/row:translate-x-0 group-focus-visible/row:translate-x-0" />
                    </Link>
                  ))}
                  <div className="bg-border -mx-1 my-2 h-px" aria-hidden="true" />
                  <Link
                    href="/pricing"
                    onClick={handleClose}
                    className="group/cta relative overflow-hidden rounded-xl border border-muted bg-muted hover:bg-accent p-2.5 flex items-center gap-3 transition-colors cursor-pointer outline-none select-none"
                  >
                    <MenuAvatarIcon
                      seed="Space Pro"
                      variant="lumina"
                      className="border-blue-400 group-hover/cta:scale-105 transition-transform duration-200"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-foreground text-sm leading-none font-semibold">Get All-Access</span>
                      <span className="text-muted-foreground truncate text-xs leading-snug">
                        Every Pro block, template, and update.
                      </span>
                    </span>
                    <span className="text-muted-foreground group-hover/cta:text-foreground group-hover/cta:translate-x-0.5 transition-all duration-200 ml-1 shrink-0">
                      <IconArrowRight className="size-4" />
                    </span>
                  </Link>
                </div>
              </MenuContentMeasurer>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem value="library">
            <NavigationMenuTrigger className="bg-transparent hover:bg-muted focus:bg-muted gap-1.5">
              <span
                aria-hidden="true"
                className="hidden size-1.5 rounded-full bg-current opacity-40 transition-all duration-300 group-hover:opacity-100 group-data-[state=open]:opacity-100 group-data-popup-open:opacity-100 group-data-[state=open]:scale-125 group-data-popup-open:scale-125 shrink-0"
              />
              Library
            </NavigationMenuTrigger>
            <NavigationMenuContent keepMounted className="w-140 shrink-0 max-w-none p-5 pt-3.5">
              <MenuContentMeasurer id="library" onMeasured={handleMeasured}>
                <div className="hidden text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 mb-2">
                  Library & Primitives
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ListItem title="Primitives" href="/primitives" seed="Primitives" onClick={handleClose}>
                    Basic accessible UI elements like Buttons, Inputs, Dialogs.
                  </ListItem>
                  <ListItem title="Blocks" href="/blocks" seed="Blocks" onClick={handleClose}>
                    Ready-to-use section blocks and page sections.
                  </ListItem>
                  <ListItem title="Hooks & Utils" href="/hooks" seed="Hooks & Utils" onClick={handleClose}>
                    Sensory React hooks, flow-control and pure DX utilities.
                  </ListItem>
                  <ListItem title="Templates" href="/templates" seed="Templates" onClick={handleClose}>
                    Full-page starter templates for your next app.
                  </ListItem>
                  <ListItem title="Interactions" href="/interactions" seed="Interactions" onClick={handleClose}>
                    Living components that move, respond and never sit still.
                  </ListItem>
                  <ListItem title="AI Showcase" href="/showcase" seed="AI Showcase" onClick={handleClose}>
                    Real sites and starters built with Space UI.
                  </ListItem>
                </div>
              </MenuContentMeasurer>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Tools Menu */}
          <NavigationMenuItem value="tools">
            <NavigationMenuTrigger className="bg-transparent hover:bg-muted focus:bg-muted gap-1.5">
              <span
                aria-hidden="true"
                className="hidden size-1.5 rounded-full bg-current opacity-40 transition-all duration-300 group-hover:opacity-100 group-data-[state=open]:opacity-100 group-data-popup-open:opacity-100 group-data-[state=open]:scale-125 group-data-popup-open:scale-125 shrink-0"
              />
              Tools
            </NavigationMenuTrigger>
            <NavigationMenuContent keepMounted className="w-190 shrink-0 max-w-none p-5 pt-3.5">
              <MenuContentMeasurer id="tools" onMeasured={handleMeasured}>
                <div className="flex flex-col gap-1">
                  <div className="hidden text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 mb-2">
                    Design Tools
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {designTools.map((tool) => {
                      const isExternal = tool.href?.startsWith('http')
                      const isInactive = tool.upcoming && (tool.href === '#' || !tool.href)
                      const isComingSoon = tool.upcoming || tool.release === 'coming-soon'
                      const isAllTools = tool.label === 'all-tools' || tool.title.toLowerCase().includes('all tools')

                      return (
                        <Link
                          key={tool.title}
                          href={tool.href ?? '#'}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          onClick={isInactive ? (e) => e.preventDefault() : handleClose}
                          className={cn(
                            'flex flex-row items-start gap-3 rounded-xl p-2.5 transition-colors select-none min-w-0',
                            isAllTools
                              ? 'bg-muted hover:bg-accent border border-muted'
                              : 'hover:bg-muted border border-transparent',
                            isInactive && 'cursor-default opacity-75 hover:bg-transparent',
                          )}
                        >
                          <ToolMenuIcon tool={tool} />
                          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={cn(
                                  'text-sm font-medium leading-none truncate',
                                  isComingSoon ? 'text-muted-foreground' : 'text-foreground',
                                )}
                              >
                                {tool.title}
                              </span>
                              {isComingSoon ? (
                                <Badge variant="warning" size="sm" className="rounded-sm shrink-0">
                                  <span aria-hidden="true">Coming Soon</span>
                                </Badge>
                              ) : tool.release === 'beta' ? (
                                <Badge variant="secondary" size="sm" className="rounded-sm shrink-0">
                                  <span aria-hidden="true">Beta</span>
                                </Badge>
                              ) : null}
                            </div>
                            <span className="text-muted-foreground line-clamp-2 text-xs leading-snug mt-0.5">
                              {tool.description}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </MenuContentMeasurer>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Showcase Link */}
          {/* <NavigationMenuItem value="showcase">
            <Link
              href="/showcase"
              className={cn(
                navigationMenuTriggerStyle(),
                'bg-transparent hover:bg-muted focus:bg-muted no-underline gap-1.5',
              )}
            >
              <span
                aria-hidden="true"
                className="hidden size-1.5 rounded-full bg-current opacity-40 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 shrink-0"
              />
              AI Showcase
            </Link>
          </NavigationMenuItem> */}

          {/* Pricing Link */}
          <NavigationMenuItem value="pricing">
            <Link
              href="/pricing"
              className={cn(
                navigationMenuTriggerStyle(),
                'bg-transparent hover:bg-muted focus:bg-muted no-underline gap-1.5',
              )}
            >
              <span
                aria-hidden="true"
                className="hidden size-1.5 rounded-full bg-current opacity-40 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 shrink-0"
              />
              Pricing
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>

        {/* Base UI Animated Viewport & Positioner Portal */}
        <NavigationMenuPortal>
          <NavigationMenuPositioner sideOffset={9}>
            <NavigationMenuPopup
              style={{
                ...(activeSize
                  ? {
                      width: `${activeSize.width}px`,
                      height: `${activeSize.height}px`,
                    }
                  : {}),
              }}
              className="border-0! bg-transparent! shadow-none! rounded-none! backdrop-blur-none! overflow-visible! data-starting-style:scale-100! data-ending-style:scale-100!"
            >
              <SpaceMenuShell />
              <NavigationMenuViewport className="relative z-10 h-full w-full overflow-hidden rounded-b-3xl" />
            </NavigationMenuPopup>
          </NavigationMenuPositioner>
        </NavigationMenuPortal>
      </NavigationMenu>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ComponentRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    seed: string
  }
>(({ className, title, children, seed, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      className={cn(
        'group/item flex flex-row items-start gap-3 rounded-xl p-2.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted select-none',
        className,
      )}
      {...props}
    >
      <MenuAvatarIcon seed={seed} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-foreground text-sm leading-none font-medium">{title}</span>
        <span className="text-muted-foreground line-clamp-2 text-xs leading-snug mt-0.5">{children}</span>
      </span>
    </Link>
  )
})
ListItem.displayName = 'ListItem'
