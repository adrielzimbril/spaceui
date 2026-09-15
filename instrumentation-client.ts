import posthog from 'posthog-js'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

if (!posthogKey || !posthogHost) {
  const missingVariable = posthogKey ? 'NEXT_PUBLIC_POSTHOG_HOST' : 'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN'

  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    )
  }
} else {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2026-01-30',
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
  })
}
