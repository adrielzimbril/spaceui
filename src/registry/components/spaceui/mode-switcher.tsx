'use client'

import { Button, type ButtonProps } from '@/registry/primitives/button'
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { cn } from '@/registry/lib/utils'
import { flushSync } from 'react-dom'
import { bloomSound } from '@/components/providers/sound-provider'
import { useThemeLock } from '@/components/providers/theme-lock-provider'

export type ThemeValue = 'system' | 'light' | 'dark'

export async function triggerThemeTransition(buttonEl: HTMLElement | null, updateFn: () => void | Promise<void>) {
  bloomSound()

  if (typeof document === 'undefined' || !document.startViewTransition || !buttonEl) {
    await updateFn()
    return
  }

  const { top, left, width, height } = buttonEl.getBoundingClientRect()
  const y = top + height / 2
  const x = left + width / 2

  const right = window.innerWidth - left
  const bottom = window.innerHeight - top
  const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom))

  const transition = document.startViewTransition(async () => {
    flushSync(() => {
      updateFn()
    })
  })

  await transition.ready

  document.documentElement.animate(
    {
      clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRad}px at ${x}px ${y}px)`],
    },
    {
      duration: 700,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)',
    },
  )
}

export interface ModeSwitcherProps extends Omit<ButtonProps, 'value' | 'onChange'> {
  value?: ThemeValue
  onValueChange?: (theme: ThemeValue) => void
  iconSize?: string
  enableTransition?: boolean
  showSystemIcon?: boolean
}

export function ModeSwitcher({
  className,
  size = 'icon',
  variant = 'secondary',
  value: controlledValue,
  onValueChange,
  iconSize,
  enableTransition = true,
  showSystemIcon,
  title,
  ...props
}: ModeSwitcherProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { isThemeLocked } = useThemeLock()
  const [mounted, setMounted] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isControlled = controlledValue !== undefined
  const currentTheme = (isControlled ? controlledValue : mounted ? (theme as ThemeValue) : 'system') ?? 'system'
  const resolved = (resolvedTheme as 'light' | 'dark') || 'light'

  // When showSystemIcon is not explicitly set, controlled previews (e.g. cards)
  // visually display the resolved theme icon (Sun/Moon) so the icon morphs when global theme changes.
  const displaySystemIcon = showSystemIcon !== undefined ? showSystemIcon : !isControlled
  const activeIconKey = !displaySystemIcon && currentTheme === 'system' ? resolved : currentTheme

  const cycleTheme = React.useCallback(async () => {
    if (isThemeLocked && !isControlled) {
      return
    }

    const nextTheme: ThemeValue =
      currentTheme === 'system'
        ? resolved === 'light'
          ? 'dark'
          : 'light'
        : currentTheme === 'light'
          ? 'dark'
          : 'system'

    if (isControlled) {
      if (enableTransition && buttonRef.current) {
        await triggerThemeTransition(buttonRef.current, () => {
          onValueChange?.(nextTheme)
        })
      } else {
        bloomSound()
        onValueChange?.(nextTheme)
      }
      return
    }

    if (enableTransition && buttonRef.current) {
      await triggerThemeTransition(buttonRef.current, () => {
        setTheme(nextTheme)
      })
    } else {
      bloomSound()
      setTheme(nextTheme)
    }
  }, [currentTheme, isControlled, enableTransition, onValueChange, setTheme, resolved])

  const calculatedIconClass = iconSize || (size === 'icon-xs' || size === 'xs' ? 'size-3.5' : 'size-4')

  if (!mounted && !isControlled) {
    return (
      <Button
        className={cn('relative overflow-hidden cursor-pointer', className)}
        size={size}
        title="Toggle theme"
        variant={variant}
        suppressHydrationWarning
        {...props}
      >
        <IconSun className={cn(calculatedIconClass, 'dark:hidden')} />
        <IconMoon className={cn(calculatedIconClass, 'hidden dark:block')} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const tooltipTitle =
    title ||
    (isThemeLocked && !isControlled
      ? 'Theme locked to dark on Showcase'
      : currentTheme === 'system'
        ? `Theme: system (${resolved}) (click to switch)`
        : `Theme: ${currentTheme} (click to switch)`)

  return (
    <Button
      ref={buttonRef}
      onClick={cycleTheme}
      size={size}
      variant={variant}
      className={cn(
        'relative overflow-hidden',
        isThemeLocked && !isControlled ? 'cursor-default opacity-80' : 'cursor-pointer',
        className,
      )}
      title={tooltipTitle}
      aria-label={tooltipTitle}
      suppressHydrationWarning
      {...props}
    >
      <MorphIcon activeKey={activeIconKey} variant="blur-scale">
        {activeIconKey === 'light' && <IconSun className={calculatedIconClass} />}
        {activeIconKey === 'dark' && <IconMoon className={calculatedIconClass} />}
        {activeIconKey === 'system' && <IconDeviceDesktop className={calculatedIconClass} />}
      </MorphIcon>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
