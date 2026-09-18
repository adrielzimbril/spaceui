/**
 * Integrations Configuration
 * Centralized getters for external service credentials and list IDs (Brevo, Resend, Turnstile).
 */

export const ConfigValue = {
  // Mail & Contacts Providers
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_GENERAL_LIST_ID: process.env.BREVO_GENERAL_LIST_ID || '',

  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID || '',
  RESEND_GENERAL_LIST_ID: process.env.RESEND_GENERAL_LIST_ID || '',

  CONTACTS_PROVIDER: process.env.CONTACTS_PROVIDER || 'brevo',

  // Bot Protection
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
  NEXT_PRIVATE_TURNSTILE_SECRET_KEY: process.env.NEXT_PRIVATE_TURNSTILE_SECRET_KEY || '',
}

/**
 * Get Brevo configuration
 */
export function getBrevoConfig() {
  return {
    apiKey: ConfigValue.BREVO_API_KEY,
    generalListId: ConfigValue.BREVO_GENERAL_LIST_ID,
  }
}

/**
 * Get Resend configuration
 */
export function getResendConfig() {
  return {
    apiKey: ConfigValue.RESEND_API_KEY,
    audienceId: ConfigValue.RESEND_AUDIENCE_ID,
    generalListId: ConfigValue.RESEND_GENERAL_LIST_ID,
  }
}

/**
 * Get Turnstile configuration
 */
export function getTurnstileConfig() {
  return {
    siteKey: ConfigValue.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    secretKey: ConfigValue.NEXT_PRIVATE_TURNSTILE_SECRET_KEY,
  }
}
