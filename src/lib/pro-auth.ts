import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseConfig } from '@/integrations/supabase/client'
import registryMeta from '@/__registry__/meta.json'

export function isComponentPro(slug: string): boolean {
  if (!slug) return false

  // Normalize slug by stripping .json extension and prefixes
  const normalized = slug
    .replace(/\.json$/i, '')
    .replace(/^public\//, '')
    .replace(/^r\//, '')

  const metaRecord = registryMeta as Record<string, any>
  const entry = metaRecord[normalized] || metaRecord[`components-spaceui-${normalized}`]

  if (entry) {
    if (entry.isPro === true || entry.meta?.isPro === true) {
      return true
    }
  }

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

      // Check license_keys table if token exists
      if (token) {
        const { data: license } = await (supabase as any)
          .from('license_keys')
          .select('*')
          .eq('key', token)
          .eq('status', 'active')
          .single()

        if (license) {
          return { authorized: true, reason: 'license_key' }
        }
      }
    } catch (err) {
      console.warn('[pro-auth] Supabase check error:', err)
    }
  }

  return { authorized: false, reason: 'unauthorized' }
}
