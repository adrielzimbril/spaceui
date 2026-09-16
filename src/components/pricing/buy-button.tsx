'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button, type ButtonProps } from '@/registry/components/spaceui/button-squircle'
import { tickSound } from '@/components/providers/sound-provider'
import { Loader2, ShoppingCart } from 'lucide-react'

interface BuyButtonProps extends Omit<ButtonProps, 'onClick'> {
  productId: string
  label?: string
  price?: string
  successUrl?: string
  onCheckoutStart?: () => void
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
  ...props
}: BuyButtonProps) {
  const router = useRouter()
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

    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCheckout}
      disabled={isLoading || !productId}
      className={className}
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
          <ShoppingCart className="size-4 mr-1.5 opacity-80" />
          <span>{label}</span>
          {price && <span className="ml-1.5 font-semibold opacity-90">({price})</span>}
        </>
      )}
    </Button>
  )
}
