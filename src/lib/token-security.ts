import { createHmac } from 'crypto'

const DEFAULT_SECRET =
  process.env.SPACEUI_TOKEN_SECRET || process.env.POLAR_WEBHOOK_SECRET || 'spaceui_default_token_secret'

export interface TokenPayload {
  sub: string // User email or license ID
  plan: 'pro_lifetime' | 'pro_annual' | 'pro_monthly'
  iat: number // Timestamp in ms
}

/**
 * Generates a tamper-proof cryptographically signed Space UI Pro license token.
 * Format: base64(payload).signature
 */
export function generateSignedLicenseToken(payload: TokenPayload, secretKey: string = DEFAULT_SECRET): string {
  const payloadStr = JSON.stringify(payload)
  const encodedPayload = Buffer.from(payloadStr).toString('base64url')

  const signature = createHmac('sha256', secretKey).update(encodedPayload).digest('hex')

  return `spc_${encodedPayload}.${signature}`
}

/**
 * Validates a signed Space UI Pro license token.
 * Returns the decoded payload if the cryptographic signature is valid.
 */
export function verifySignedLicenseToken(
  token: string,
  secretKey: string = DEFAULT_SECRET,
): { valid: boolean; payload?: TokenPayload; error?: string } {
  try {
    if (!token || !token.startsWith('spc_')) {
      return { valid: false, error: 'Invalid token prefix' }
    }

    const cleanToken = token.replace(/^spc_/, '')
    const parts = cleanToken.split('.')

    if (parts.length !== 2) {
      return { valid: false, error: 'Malformed token structure' }
    }

    const [encodedPayload, receivedSignature] = parts

    const expectedSignature = createHmac('sha256', secretKey).update(encodedPayload).digest('hex')

    if (receivedSignature !== expectedSignature) {
      return { valid: false, error: 'Signature mismatch' }
    }

    const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8')
    const payload = JSON.parse(payloadStr) as TokenPayload

    return { valid: true, payload }
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Token verification failed' }
  }
}
