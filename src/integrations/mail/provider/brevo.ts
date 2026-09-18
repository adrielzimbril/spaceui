import { logger } from '@/registry/utils/logger'
import type { SendEmailHandler } from '@/integrations/mail/types/types'
import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } from '@getbrevo/brevo'
import { siteConfig } from '@/config/space-config'
import { getBrevoConfig } from '@/config/integrations'

const fromEmail = siteConfig.email
const replyToEmail = siteConfig.email
const senderName = siteConfig.appName

const { apiKey: MAIL_PROVIDER_API_KEY } = getBrevoConfig()

const provider = new TransactionalEmailsApi()
if (MAIL_PROVIDER_API_KEY) {
  provider.setApiKey(TransactionalEmailsApiApiKeys.apiKey, MAIL_PROVIDER_API_KEY)
}

export const send: SendEmailHandler = async ({ to, subject, body, text }) => {
  if (!MAIL_PROVIDER_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('[Brevo] Missing BREVO_API_KEY env var. Email simulated to:', to)
      return { success: true, simulated: true }
    }
    throw new Error('Missing BREVO_API_KEY env var')
  }

  try {
    const message = new SendSmtpEmail()
    message.subject = subject || siteConfig.title
    message.htmlContent = body?.html ?? body?.react
    if (text) {
      message.textContent = text
    }
    message.sender = { email: fromEmail, name: senderName }
    message.to = to.map((t) => ({ email: t.email, name: t.name || t.email }))
    message.replyTo = { email: replyToEmail, name: senderName }

    const res = await provider.sendTransacEmail(message)
    logger.info('[Brevo] Email sent successfully', res)
    return res
  } catch (err: unknown) {
    const message =
      (err as { body?: { message: string } })?.body?.message ||
      (err as { message: string })?.message ||
      'Unknown Brevo error'

    if (typeof message === 'string' && message.toLowerCase().includes('exists')) {
      logger.info('[Brevo] Sent message already exists', { email: fromEmail })
    }
    logger.error('[Brevo] Send message failed', err)
    throw new Error(message, { cause: err })
  }
}
