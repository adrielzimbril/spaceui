import { NextRequest, NextResponse } from 'next/server'
import { isComponentPro, verifyProAuthorization } from '@/lib/pro-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Intercept /public/r/... and normalize to /r/...
  if (pathname.startsWith('/public/r/')) {
    const normalizedPath = pathname.replace('/public/r/', '/r/')
    const url = request.nextUrl.clone()
    url.pathname = normalizedPath
    return NextResponse.redirect(url, 301)
  }

  // 2. Only handle /r/ requests
  if (pathname.startsWith('/r/')) {
    const filename = pathname.split('/').filter(Boolean).pop() || ''
    const isPro = isComponentPro(filename)

    // Free component: allow direct public delivery
    if (!isPro) {
      return NextResponse.next()
    }

    // Pro component: verify license or subscription authorization
    const authResult = await verifyProAuthorization(request)

    if (authResult.authorized) {
      return NextResponse.next()
    }

    // Unauthorized access:
    const acceptHeader = request.headers.get('accept') || ''
    const isBrowserHtml = acceptHeader.includes('text/html')

    if (isBrowserHtml) {
      // Direct browser navigation: redirect to pricing page
      const cleanName = filename.replace(/\.json$/i, '')
      const pricingUrl = new URL('/pricing', request.url)
      pricingUrl.searchParams.set('locked', cleanName)
      return NextResponse.redirect(pricingUrl)
    }

    // CLI or API request (npx shadcn add / curl / fetch): return 401 with pricing details
    return NextResponse.json(
      {
        error: 'pro_component_locked',
        message:
          'This component is part of Space UI Pro. Please subscribe or configure your license key to access it via CLI.',
        pricingUrl: 'https://www.spaceui.one/pricing',
        help: 'Add Authorization: Bearer <YOUR_SPACEUI_TOKEN> to your components.json or request headers.',
      },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Bearer realm="Space UI Pro Registry"',
        },
      },
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/r/:path*', '/public/r/:path*'],
}
