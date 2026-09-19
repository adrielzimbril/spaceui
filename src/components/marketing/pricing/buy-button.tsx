'use client'

import * as React from 'react'
import { Button, type ButtonProps } from '@/registry/components/spaceui/button-squircle'
import { LiquidBorder, type LiquidPreset } from '@/registry/components/spaceui/liquid-metal-border'
import { tickSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'
import { IconLoader2 } from '@tabler/icons-react'

interface BuyButtonProps extends Omit<ButtonProps, 'onClick'> {
  productId: string
  /** Discount id to apply automatically at checkout (e.g. the current tier's early-bird discount). */
  discountId?: string | null
  label?: string
  price?: string
  successUrl?: string
  onCheckoutStart?: () => void
  /** Wrap the button in the animated liquid-metal border used for primary CTAs. Pass a preset name to pick its color, or `true` for the default. */
  border?: boolean | LiquidPreset
}

export function BuyButton({
  productId,
  discountId,
  label = 'Buy now',
  price,
  successUrl,
  variant = 'primary',
  size = 'default',
  onCheckoutStart,
  className,
  border = false,
  ...props
}: BuyButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleCheckout = () => {
    try {
      tickSound()
    } catch {
      // Sound optional
    }

    setIsLoading(true)
    onCheckoutStart?.()

    const params = new URLSearchParams()
    params.set('products', productId)
    if (discountId) {
      params.set('discountId', discountId)
    }
    if (successUrl) {
      params.set('successUrl', successUrl)
    }

    window.location.href = `/checkout?${params.toString()}`
  }

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleCheckout}
      disabled={isLoading || !productId}
      className={cn(variant === 'primary' && 'bg-primary!', className)}
      pointer
      squircle
      {...props}
    >
      {isLoading ? (
        <>
          <IconLoader2 className="size-4 animate-spin mr-2" />
          <span>Redirecting...</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          {price && <span className="ml-1.5 font-semibold opacity-90">({price})</span>}
        </>
      )}
    </Button>
  )

  if (!border) return button

  const preset = typeof border === 'string' ? border : undefined

  return (
    <LiquidBorder
      preset={preset}
      className="flex w-full [&_div]:size-full squircle rounded-7xl p-0.75 hover:scale-105 transition-all duration-300"
    >
      {button}
    </LiquidBorder>
  )
}
