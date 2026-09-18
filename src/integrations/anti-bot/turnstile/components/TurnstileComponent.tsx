'use client'
import React, { forwardRef, useImperativeHandle } from 'react'
import useTurnstile, { TurnstileOptions } from '@/integrations/anti-bot/turnstile/hooks/useTurnstile'

export interface TurnstileComponentProps extends TurnstileOptions {
  siteKey: string
  className?: string
  style?: React.CSSProperties
}

export interface TurnstileComponentRef {
  reset: () => void
  execute: () => void
  getResponse: () => string | null
}

export const TurnstileComponent = forwardRef<TurnstileComponentRef, TurnstileComponentProps>(
  ({ siteKey, className, style, ...options }, ref) => {
    const { ref: turnstileRef, reset, execute, getResponse } = useTurnstile(siteKey, options)

    useImperativeHandle(
      ref,
      () => ({
        reset,
        execute,
        getResponse,
      }),
      [reset, execute, getResponse],
    )

    return <div ref={turnstileRef} className={className} style={style} />
  },
)

TurnstileComponent.displayName = 'TurnstileComponent'
