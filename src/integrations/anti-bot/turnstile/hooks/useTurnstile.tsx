import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '@/utils'

export interface TurnstileResponse {
  success: boolean
  error_codes?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

export interface TurnstileOptions {
  onLoad?: () => void
  onSuccess?: (token: string) => void
  onError?: (errorCode?: string) => void
  onExpire?: () => void
  onTimeout?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  language?: string
  retry?: 'auto' | 'never'
  'retry-interval'?: number
  'refresh-expired'?: 'auto' | 'manual' | 'never'
  appearance?: 'always' | 'execute' | 'interaction-only'
  execution?: 'render' | 'execute'
}

interface TurnstileWindow extends Window {
  turnstile: {
    ready: (callback: () => void) => void
    render: (container: string | HTMLElement, options: any) => string
    reset: (widgetId?: string) => void
    remove: (widgetId?: string) => void
    getResponse: (widgetId?: string) => string
    execute: (container?: string | HTMLElement, options?: any) => void
  }
}

declare const window: TurnstileWindow

const useTurnstile = (siteKey: string, options: TurnstileOptions = {}) => {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  const {
    theme = 'auto',
    size = 'normal',
    language = 'auto',
    retry = 'auto',
    'retry-interval': retryInterval,
    'refresh-expired': refreshExpired = 'auto',
    appearance = 'always',
    execution = 'render',
    onSuccess: userOnSuccess,
    onError: userOnError,
    onExpire: userOnExpire,
    onTimeout: userOnTimeout,
    onLoad: userOnLoad,
  } = options

  const onSuccess = useCallback(
    (token: string) => {
      setToken(token)
      setError(null)
      setIsLoading(false)
      userOnSuccess?.(token)
    },
    [userOnSuccess],
  )

  const onError = useCallback(
    (errorCode?: string) => {
      setError(errorCode || 'Turnstile verification failed')
      setToken(null)
      setIsLoading(false)
      userOnError?.(errorCode)
    },
    [userOnError],
  )

  const onExpired = useCallback(() => {
    setToken(null)
    setError('Turnstile token expired')
    setIsLoading(false)
    userOnExpire?.()
  }, [userOnExpire])

  const onTimeout = useCallback(() => {
    setError('Turnstile verification timed out')
    setToken(null)
    setIsLoading(false)
    userOnTimeout?.()
  }, [userOnTimeout])

  const renderTurnstile = useCallback(() => {
    if (!window.turnstile || !containerRef.current) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const renderOptions = {
        sitekey: siteKey,
        theme,
        size,
        language,
        retry,
        'retry-interval': retryInterval,
        'refresh-expired': refreshExpired,
        appearance,
        execution,
        callback: onSuccess,
        'error-callback': onError,
        'expired-callback': onExpired,
        'timeout-callback': onTimeout,
      }

      Object.keys(renderOptions).forEach(
        (key) =>
          renderOptions[key as keyof typeof renderOptions] === undefined &&
          delete renderOptions[key as keyof typeof renderOptions],
      )

      const id = window.turnstile.render(containerRef.current, renderOptions)
      setWidgetId(id)
      // Fire the onLoad callback
      userOnLoad?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render Turnstile'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [
    siteKey,
    theme,
    size,
    language,
    retry,
    retryInterval,
    refreshExpired,
    appearance,
    execution,
    onSuccess,
    onError,
    onExpired,
    onTimeout,
    userOnLoad,
  ])

  useEffect(() => {
    if (widgetId) {
      return
    }

    const scriptId = 'cloudflare-turnstile-script'
    const onloadCallbackName = 'cfTurnstileOnload'

    ;(window as any)[onloadCallbackName] = renderTurnstile

    if (document.getElementById(scriptId)) {
      if (window.turnstile) {
        renderTurnstile()
      }
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${onloadCallbackName}`
    script.async = false
    script.defer = false

    script.onerror = () => {
      setError('Failed to load Turnstile script')
      setIsLoading(false)
    }

    document.head.appendChild(script)
    scriptRef.current = script

    return () => {
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId)
        } catch (err) {
          logger.warn('Failed to remove Turnstile widget:', err)
        }
      }
      delete (window as any)[onloadCallbackName]
    }
  }, [renderTurnstile, widgetId])

  const reset = useCallback(() => {
    if (widgetId && window.turnstile) {
      try {
        setToken(null)
        setError(null)
        setIsLoading(true)
        window.turnstile.reset(widgetId)
      } catch (err) {
        setError('Failed to reset Turnstile')
        setIsLoading(false)
      }
    }
  }, [widgetId])

  const execute = useCallback(() => {
    if (containerRef.current && window.turnstile) {
      try {
        setToken(null)
        setError(null)
        setIsLoading(true)
        window.turnstile.execute(containerRef.current)
      } catch (err) {
        setError('Failed to execute Turnstile')
        setIsLoading(false)
      }
    }
  }, [])

  const getResponse = useCallback(() => {
    if (widgetId && window.turnstile) {
      try {
        return window.turnstile.getResponse(widgetId)
      } catch (err) {
        logger.warn('Failed to get Turnstile response:', err)
        return null
      }
    }
    return null
  }, [widgetId])

  return {
    ref: containerRef,
    token,
    error,
    isLoading,
    reset,
    execute,
    getResponse,
    widgetId,
  }
}

export default useTurnstile
