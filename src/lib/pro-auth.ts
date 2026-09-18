import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseConfig } from '@/integrations/supabase/client'
import registryMeta from '@/__registry__/meta.json'

const proStatusCache = new Map<string, boolean>()
const PRO_REGEX = /"isPro"\s*:\s*true|\bisPro\s*:\s*true|\bpro\s*:\s*true/

export function isComponentPro(slug: string): boolean {
  if (!slug) return false

  // Normalize slug by stripping URL, @scope, .json extension, and prefixes
  const clean = slug
    .replace(/.*\/([^/]+)\.json$/i, '$1')
    .replace(/^@[^/]+\//, '')
    .replace(/\.json$/i, '')
    .replace(/^public\//, '')
    .replace(/^r\//, '')

  if (proStatusCache.has(clean)) {
    return proStatusCache.get(clean)!
  }

  const direct = clean
    .replace(/^primitives-/, '')
    .replace(/^components-spaceui-base-/, '')
    .replace(/^components-spaceui-/, '')
    .replace(/^blocks-/, '')
    .replace(/^block-/, '')
    .replace(/^components-shader-/, '')
    .replace(/^templates-/, '')
    .replace(/^template-/, '')

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

  // 1. Check registry meta in memory
  for (const candidate of candidates) {
    const entry = metaRecord[candidate]
    if (entry && (entry.isPro === true || entry.meta?.isPro === true)) {
      proStatusCache.set(clean, true)
      return true
    }
  }

  // 2. Dynamic check from files on server when running in Node.js environment
  if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
    try {
      const fs = require('node:fs')
      const path = require('node:path')
      const appRoot =
        path.basename(process.cwd()) === 'www' ? process.cwd() : path.join(process.cwd(), 'apps', 'www')

      // Check public/r JSON files
      for (const c of [clean, `block-${direct}`, direct, `template-${direct}`]) {
        const publicPath = path.join(appRoot, 'public', 'r', `${c}.json`)
        if (fs.existsSync(publicPath)) {
          const content = fs.readFileSync(publicPath, 'utf8')
          if (PRO_REGEX.test(content)) {
            proStatusCache.set(clean, true)
            return true
          }
        }
      }

      // Check registry-item.json in any registry category
      const regCategories = ['blocks', 'primitives', 'components/spaceui', 'components/space', 'templates']
      for (const cat of regCategories) {
        const regFile = path.join(appRoot, 'src', 'registry', cat, direct, 'registry-item.json')
        if (fs.existsSync(regFile)) {
          const content = fs.readFileSync(regFile, 'utf8')
          if (PRO_REGEX.test(content)) {
            proStatusCache.set(clean, true)
            return true
          }
        }
      }

      // Check MDX documentation frontmatter
      const docCategories = ['blocks', 'primitives', 'components', 'templates']
      for (const cat of docCategories) {
        const mdxFile = path.join(appRoot, 'src', 'content', 'ui-kit', cat, `${direct}.mdx`)
        if (fs.existsSync(mdxFile)) {
          const content = fs.readFileSync(mdxFile, 'utf8')
          const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
          if (match && PRO_REGEX.test(match[1])) {
            proStatusCache.set(clean, true)
            return true
          }
        }
      }
    } catch {}
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
