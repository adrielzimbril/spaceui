'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'
import { Link } from '@/registry/primitives/link'
import {
  IconBox,
  IconFolderHeart,
  IconRocket,
  IconFlag,
  IconLayoutGrid,
  IconSparkles,
  IconArrowRight,
  IconBook,
  IconNetwork,
  IconChevronRight,
  IconCpu,
  IconAtom,
  IconUserCircle,
  IconMoodSmile,
  IconFileTypeDoc,
  IconIcons,
  IconPalette,
  IconPhoto,
  IconCrown,
} from '@tabler/icons-react'
import { Badge } from '@/registry/primitives/badge'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuPopup,
  NavigationMenuViewport,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/registry/primitives/navigation-menu'
import { DEFAULT_COLOR_CODE, getColorForegroundClass } from '@/lib/theme-colors'

interface MenuIconProps {
  children: React.ReactNode
  className?: string
  color?: string
  iconColor?: string
}

const MenuIcon = ({ children, className, color = DEFAULT_COLOR_CODE.BLUE, iconColor }: MenuIconProps) => {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center size-8 rounded-sm relative overflow-hidden bg-primary/5',
        className,
      )}
    >
      <div className={cn('flex items-center justify-center [&>svg]:size-4 text-foreground')}>{children}</div>
    </div>
  )
}

import { megaMenuDocs, megaMenuUiKit, megaMenuTools } from '@/config/menu-config'

const docs = megaMenuDocs
const uiKitComponents = megaMenuUiKit
const designTools = megaMenuTools

export function MegaMenu({ className }: { className?: string }) {
  const [value, setValue] = React.useState<string | null>(null)
  const isClickTriggered = React.useRef<boolean>(false)

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
      // Si ouvert par clic, on ne ferme pas au clic extérieur (permet d'inspecter dans les DevTools tranquillement)
      if (isClickTriggered.current) {
        return
      }
      handleClose()
      return
    }

    if (reason === 'trigger-hover') {
      // Si le menu a été verrouillé par un clic, le pointeur qui sort ne le ferme pas
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
          {/* Docs Menu */}
          <NavigationMenuItem value="docs">
            <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 focus:bg-muted/50">
              Docs
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-100 p-2">
              <div className="grid gap-1">
                {docs.map((doc) => (
                  <Link
                    key={doc.title}
                    className="group/row rounded-xl flex flex-row items-center gap-3 p-2.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted data-[active=true]:bg-muted dark:hover:bg-muted/50 dark:focus-visible:bg-muted/50 dark:data-[active=true]:bg-muted/50"
                    href={doc.href}
                    onClick={handleClose}
                  >
                    <MenuIcon color={doc.color}>
                      <doc.icon className="size-5" />
                    </MenuIcon>
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
                <div className="bg-border/70 -mx-2 my-1.5 h-px" aria-hidden="true" />
                <Link
                  href="#"
                  onClick={handleClose}
                  className="group/cta relative overflow-hidden rounded-xl border border-amber-500/25 bg-linear-to-r from-amber-100/10 via-amber-300/5 to-orange-500/10 p-2.5 flex items-center gap-3 transition-all duration-200 hover:border-amber-500/45 cursor-pointer outline-none select-none"
                >
                  <Badge
                    square
                    variant="warning"
                    size="lg"
                    className="flex shrink-0 items-center justify-center size-auto! rounded-lg group-hover/cta:scale-105 transition-transform duration-200"
                  >
                    <IconCrown className="size-4.5" />
                  </Badge>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className="text-foreground text-sm leading-none font-semibold">Get All-Access</span>
                      <Badge variant="warning" size="sm">
                        Coming Soon
                      </Badge>
                    </span>
                    <span className="text-muted-foreground truncate text-xs leading-snug">
                      Every Pro block, template, and update.
                    </span>
                  </span>
                  <span className="text-muted-foreground group-hover/cta:text-foreground group-hover/cta:translate-x-0.5 transition-all duration-200 ml-1 shrink-0">
                    <IconArrowRight className="size-4" />
                  </span>
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* UI Kit Menu */}
          <NavigationMenuItem value="ui-kit">
            <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 focus:bg-muted/50">
              UI Kit
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2 lg:w-150">
                <li className="row-span-4 flex flex-col justify-between gap-2.5">
                  <Link
                    className="flex flex-1 w-full select-none flex-col items-start justify-end rounded-xl bg-linear-to-b from-muted/50 to-muted p-6 outline-none group/card"
                    href="/ui-kit"
                    onClick={handleClose}
                  >
                    <IconRocket className="size-7 text-primary group-hover/card:scale-110 transition-transform" />
                    <div className="mb-2 mt-4 text-lg font-medium">Space UI</div>
                    <span className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components built with Tailwind CSS and Framer Motion.
                    </span>
                  </Link>
                  <ListItem
                    key="Templates"
                    title="Templates"
                    href="/ui-kit/templates"
                    icon={IconLayoutGrid}
                    color={DEFAULT_COLOR_CODE.ORANGE}
                    className="bg-muted"
                    onClick={handleClose}
                  >
                    Full-page starter templates
                  </ListItem>
                </li>
                {uiKitComponents.map((component) => (
                  <li key={component.title}>
                    <ListItem
                      title={component.title}
                      href={component.href}
                      icon={component.icon}
                      color={component.color}
                      onClick={handleClose}
                    >
                      {component.description}
                    </ListItem>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Tools Menu */}
          <NavigationMenuItem value="tools">
            <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 focus:bg-muted/50">
              Tools
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-175 p-3">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground p-2 text-xs font-medium uppercase">Design Tools</span>
                <div className="grid grid-cols-2 gap-2">
                  {designTools.map((tool) => {
                    const ToolIcon = tool.icon
                    const isExternal = tool.href?.startsWith('http')
                    const isInactive = tool.upcoming && (tool.href === '#' || !tool.href)
                    const isComingSoon = tool.upcoming || tool.release === 'coming-soon'

                    return (
                      <Link
                        key={tool.title}
                        href={tool.href ?? '#'}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        onClick={isInactive ? (e) => e.preventDefault() : handleClose}
                        className={cn(
                          'flex min-h-16 flex-row gap-3 rounded-xl p-3 hover:bg-muted transition-colors',
                          isInactive && 'cursor-default opacity-85 hover:bg-transparent',
                        )}
                      >
                        <MenuIcon color={tool.color}>
                          <ToolIcon className="size-5" />
                        </MenuIcon>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'text-sm font-medium',
                                isComingSoon ? 'text-muted-foreground' : 'text-foreground',
                              )}
                            >
                              {tool.title}
                            </span>
                            {isComingSoon ? (
                              <Badge variant="warning" size="sm" className="rounded-sm">
                                <span aria-hidden="true">Coming Soon</span>
                              </Badge>
                            ) : tool.release === 'beta' ? (
                              <Badge variant="secondary" size="sm" className="rounded-sm">
                                <span aria-hidden="true">Beta</span>
                              </Badge>
                            ) : null}
                          </div>
                          <span className="text-muted-foreground text-sm font-normal">{tool.description}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>

        {/* Base UI Animated Viewport & Positioner Portal */}
        <NavigationMenuPortal>
          <NavigationMenuPositioner sideOffset={8}>
            <NavigationMenuPopup>
              <NavigationMenuViewport />
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
    icon?: React.ElementType
    color?: string
    iconColor?: string
  }
>(({ className, title, children, icon: Icon, color, iconColor, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      className={cn(
        'block select-none space-y-1 rounded-xl p-3 leading-none no-underline outline-none transition-colors hover:bg-muted',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <MenuIcon color={color} iconColor={iconColor} className="size-6">
            <Icon />
          </MenuIcon>
        )}
        <span className="text-sm font-medium leading-none">{title}</span>
      </div>
      <span className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">{children}</span>
    </Link>
  )
})
ListItem.displayName = 'ListItem'
