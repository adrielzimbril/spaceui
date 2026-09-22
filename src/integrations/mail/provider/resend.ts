import { Resend } from 'resend'
import { siteConfig } from '@/config/space-config'
import { logger } from '@/registry/utils/logger'

const resendApiKey = process.env.RESEND_API_KEY

export const resend = resendApiKey ? new Resend(resendApiKey) : null

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  react?: React.ReactElement
  html?: string
  text?: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  react,
  html,
  text,
  from = `Space UI <${siteConfig.email}>`,
  replyTo = siteConfig.email,
}: SendEmailOptions) {
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('[Mail:Resend] RESEND_API_KEY is not defined. Email simulated to:', to)
      return { success: true, simulated: true }
    }
    throw new Error('Missing RESEND_API_KEY environment variable')
  }

  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    replyTo,
    ...(react && { react }),
    ...(html && { html }),
    ...(text && { text }),
  })

  if (error) {
    logger.error('[Mail:Resend] Error sending email:', error)
    throw new Error(error.message)
  }

  return { success: true, data }
}
