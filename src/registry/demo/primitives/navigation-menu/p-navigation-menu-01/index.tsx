'use client'

import * as React from 'react'
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
} from '@/registry/primitives/navigation-menu'
import { IconStar, IconBook, IconTerminal, IconSparkles, IconPackage, IconArrowRight } from '@tabler/icons-react'

export default function Demo() {
  return (
    <div className="flex w-full justify-center p-8">
      <NavigationMenu>
        <NavigationMenuList>
          {/* Getting Started Item */}
          <NavigationMenuItem value="getting-started">
            <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[420px] gap-2 p-3">
                <NavigationMenuLink
                  href="/docs"
                  className="flex flex-row items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconBook className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                      Introduction <IconArrowRight className="size-3 text-muted-foreground" />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Learn the core concepts and architecture of Space UI.
                    </span>
                  </div>
                </NavigationMenuLink>

                <NavigationMenuLink
                  href="/docs/installation"
                  className="flex flex-row items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <IconTerminal className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                      Installation <IconArrowRight className="size-3 text-muted-foreground" />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Add components to your Next.js and React applications.
                    </span>
                  </div>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Components Item */}
          <NavigationMenuItem value="components">
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[500px] grid-cols-2 gap-2 p-3">
                <NavigationMenuLink
                  href="/primitives"
                  className="flex flex-col gap-1 rounded-xl p-2.5 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <IconPackage className="size-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Primitives</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Accessible, unstyled UI primitives powered by Base UI.
                  </span>
                </NavigationMenuLink>

                <NavigationMenuLink
                  href="/components"
                  className="flex flex-col gap-1 rounded-xl p-2.5 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <IconSparkles className="size-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Animations</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Micro-interactions and fluid motion components.</span>
                </NavigationMenuLink>

                <NavigationMenuLink
                  href="/hooks"
                  className="flex flex-col gap-1 rounded-xl p-2.5 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <IconStar className="size-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">React Hooks</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Over 80+ reactive, sensory, and DOM utility hooks.
                  </span>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Direct Link Item */}
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/pricing"
              className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>

        {/* Floating animated popup portal & viewport */}
        <NavigationMenuPortal>
          <NavigationMenuPositioner sideOffset={10}>
            <NavigationMenuPopup>
              <NavigationMenuViewport />
            </NavigationMenuPopup>
          </NavigationMenuPositioner>
        </NavigationMenuPortal>
      </NavigationMenu>
    </div>
  )
}
