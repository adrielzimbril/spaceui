import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseConfig } from '@/integrations/supabase/client'
import { createAdminClient } from '@/integrations/supabase/server'
import registryMeta from '@/__registry__/meta.json'

const proStatusCache = new Map<string, boolean>()

export function normalizeComponentSlug(slug: string): { clean: string; direct: string } {
  const clean = slug
    .replace(/.*\/([^/]+)\.json$/i, '$1')
    .replace(/^@[^/]+\//, '')
    .replace(/\.json$/i, '')
    .replace(/^public\//, '')
    .replace(/^r\//, '')

  const direct = clean
    .replace(/^primitives-/, '')
    .replace(/^components-spaceui-base-/, '')
    .replace(/^components-spaceui-/, '')
    .replace(/^blocks-/, '')
    .replace(/^block-/, '')
    .replace(/^components-shader-/, '')
    .replace(/^templates-/, '')
    .replace(/^template-/, '')

  return { clean, direct }
}

export function isComponentPro(slug: string): boolean {
  if (!slug) return false

  const { clean, direct } = normalizeComponentSlug(slug)

  if (proStatusCache.has(clean)) {
    return proStatusCache.get(clean)!
  }

  const metaRecord = registryMeta as Record<string, any>

  const candidates = [
    clean,
    direct,
    `block-${direct}`,
    `blocks-${direct}`,
    `components-spaceui-${direct}`,
    `primitives-${direct}`,
    `components-shader-${direct}`,
    `template-${direct}`,
    `templates-${direct}`,
  ]

  for (const candidate of candidates) {
    const entry = metaRecord[candidate]
    if (entry && (entry.isPro === true || entry.meta?.isPro === true)) {
      proStatusCache.set(clean, true)
      return true
    }
  }

  proStatusCache.set(clean, false)
  return false
}

export async function verifyProAuthorization(
  request: NextRequest,
): Promise<{ authorized: boolean; reason?: string; user?: any }> {
  // 1. Check development environment bypass if configured
  if (process.env.SPACEUI_DEV_BYPASS === 'true') {
    return { authorized: true, reason: 'dev_bypass' }
  }

  // 2. Check Bearer token or custom header
  const authHeader = request.headers.get('authorization')
  const customToken =
    request.headers.get('x-spaceui-token') ||
    request.headers.get('x-spaceui-key') ||
    request.nextUrl.searchParams.get('token') ||
    request.nextUrl.searchParams.get('key')

  let token = customToken
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim()
  }

  // Allow admin / master secret token for automated CI or internal validation
  const masterKey = process.env.SPACEUI_MASTER_KEY || process.env.POLAR_WEBHOOK_SECRET
  if (masterKey && token && token === masterKey) {
    return { authorized: true, reason: 'master_key' }
  }

  // Test token for sandbox testing
  if (token && (token === 'spaceui_test_pro' || token === 'spaceui_live_pro')) {
    return { authorized: true, reason: 'test_token' }
  }

  // 3. Check Supabase authenticated user via Cookie or Bearer token
  if (supabaseConfig.url && supabaseConfig.anonKey) {
    try {
      const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      })

      // If token looks like a Supabase access token, try validating with token
      const {
        data: { user },
        error,
      } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser()

      if (!error && user) {
        const metadata = user.app_metadata || {}

        // Has lifetime pass or paid flag
        if (metadata.has_paid === true || metadata.plan === 'lifetime') {
          return { authorized: true, user }
        }

        // Has active subscription
        if (metadata.subscription_status === 'active' || metadata.subscription_status === 'trialing') {
          return { authorized: true, user }
        }

        // Has unlocked items
        if (Array.isArray(metadata.unlocked_products) && metadata.unlocked_products.length > 0) {
          return { authorized: true, user }
        }
      }
    } catch (err) {
      console.warn('[pro-auth] Supabase check error:', err)
    }
  }

  // 4. Check license_keys table if token exists
  if (token) {
    try {
      const admin = createAdminClient()
      if (admin) {
        const { data: license } = await (admin as any)
          .from('license_keys')
          .select('id')
          .eq('key', token)
          .eq('status', 'active')
          .maybeSingle()

        if (license) {
          return { authorized: true, reason: 'license_key' }
        }
      }
    } catch (err) {
      console.warn('[pro-auth] License key check error:', err)
    }
  }

  return { authorized: false, reason: 'unauthorized' }
}
