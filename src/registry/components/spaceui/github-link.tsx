'use client'

import { Skeleton } from '@/registry/primitives/skeleton'
import { GitHubLinkClient } from '@/registry/components/spaceui/github-link-client'
import { siteConfig } from '@/config/space-config'
import { logger } from '@/registry/utils/logger'
import * as React from 'react'

let cachedStarsCount: number | null = null
let rateLimitedUntil = 0
const DELAY_MS = 2 * 60 * 1000 // 2 minutes

function formatStars(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toLocaleString()
}

export function StarsCount() {
  const [stars, setStars] = React.useState<number | null>(cachedStarsCount)
  const [loading, setLoading] = React.useState(cachedStarsCount === null)

  React.useEffect(() => {
    if (cachedStarsCount !== null) {
      setStars(cachedStarsCount)
      setLoading(false)
      return
    }

    const now = Date.now()

    if (now < rateLimitedUntil) {
      setLoading(false)
      return
    }

    let isMounted = true
    const repoPath = siteConfig.links.github.replace('https://github.com/', '').replace(/\/$/, '')

    async function fetchStars() {
      try {
        const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        })

        const remainingHeader = res.headers.get('x-ratelimit-remaining')
        const isRateLimited = res.status === 429 || res.status === 403 || remainingHeader === '0'

        if (isRateLimited) {
          const resetHeader = res.headers.get('x-ratelimit-reset')
          const retryAfterHeader = res.headers.get('retry-after')

          let waitDuration = DELAY_MS

          if (resetHeader) {
            const resetMs = parseInt(resetHeader, 10) * 1000
            if (resetMs > now) {
              waitDuration = Math.max(DELAY_MS, resetMs - now)
            }
          } else if (retryAfterHeader) {
            const retryAfterSeconds = parseInt(retryAfterHeader, 10)
            if (retryAfterSeconds > 0) {
              waitDuration = Math.max(DELAY_MS, retryAfterSeconds * 1000)
            }
          }

          rateLimitedUntil = Date.now() + waitDuration
          logger.warn(
            `GitHub API rate limited (status: ${res.status}, remaining: ${remainingHeader ?? 'unknown'}). Cooling down for ${Math.round(waitDuration / 1000)}s.`,
          )
          return
        }

        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status}`)
        }

        const json = await res.json()

        if (
          json?.message &&
          typeof json.message === 'string' &&
          (json.message.includes('abuse detection mechanism') || json.message.includes('rate limit'))
        ) {
          rateLimitedUntil = Date.now() + DELAY_MS
          logger.warn(
            `GitHub API abuse/rate limit detected in response body: ${json.message}. Cooling down for ${Math.round(DELAY_MS / 1000)}s.`,
          )
          return
        }

        const count = json.stargazers_count
        if (typeof count === 'number' && count >= 0) {
          cachedStarsCount = count
          if (isMounted) {
            setStars(count)
          }
        }
      } catch (err) {
        logger.warn('Failed to fetch GitHub stars:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchStars()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <Skeleton className="h-4 w-[25.5px]" />
  }

  if (stars === null) {
    return null
  }

  return <span className="w-8 text-muted-foreground text-xs tabular-nums">{formatStars(stars)}</span>
}

export function GitHubLink() {
  return <GitHubLinkClient stars={<StarsCount />} />
}
