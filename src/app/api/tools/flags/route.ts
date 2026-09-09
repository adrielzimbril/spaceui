import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.trim().toLowerCase()
  const rawShape = searchParams.get('shape')?.trim().toLowerCase() || 'circle'
  const mode = searchParams.get('mode')?.trim().toLowerCase() === 'language' ? 'language' : 'country'

  if (!code || !/^[a-z0-9_-]+$/.test(code)) {
    return new NextResponse('Invalid code parameter', { status: 400 })
  }

  const shape = mode === 'language' && rawShape === '4x3' ? 'circle' : rawShape
  const relativeSubpath = mode === 'language' ? `language/${shape}/${code}.svg` : `${shape}/${code}.svg`

  const cdnUrl = `https://cdn.spaceui.one/common/flags/${relativeSubpath}`
  const response = await fetch(cdnUrl, {
    headers: {
      'User-Agent': 'SpaceUI-Flags-API/1.0',
    },
    next: { revalidate: 86400 },
  })

  if (response.ok) {
    const svg = await response.text()
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

  return new NextResponse('Flag SVG not found', { status: 404 })
}
