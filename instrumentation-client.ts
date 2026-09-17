import posthog from 'posthog-js'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
const hostname = window.location.hostname
const isLocal =
  process.env.NODE_ENV === 'development' || hostname === 'localhost' || hostname === '127.0.0.1'

if (!isLocal && posthogKey && posthogHost) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2026-01-30',
    capture_exceptions: true,
    debug: false,
  })
}
