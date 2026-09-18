'use client'

import * as React from 'react'
import { Button, type ButtonProps } from '@/registry/components/spaceui/button-squircle'
import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { tickSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'
import { Loader2 } from 'lucide-react'

interface BuyButtonProps extends Omit<ButtonProps, 'onClick'> {
  productId: string
  label?: string
  price?: string
  successUrl?: string
  onCheckoutStart?: () => void
  /** Wrap the button in the animated liquid-metal border used for primary CTAs. */
  border?: boolean
}

export function BuyButton({
  productId,
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
    if (successUrl) {
      params.set('successUrl', successUrl)
    }

    // Full browser navigation, not router.push: /checkout replies with a 307 to
    // Polar's hosted checkout (an external domain), which only a real navigation follows.
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
          <Loader2 className="size-4 animate-spin mr-2" />
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

  return (
    <LiquidBorder className="flex w-full [&_div]:size-full squircle rounded-full p-0.75 hover:scale-105 transition-all duration-300">
      {button}
    </LiquidBorder>
  )
}
