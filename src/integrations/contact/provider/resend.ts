import { logger } from '@/registry/utils/logger'
import type { AddContactHandler } from '@/integrations/contact/types/types'
import { Resend } from 'resend'
import { getResendConfig } from '@/config/integrations'

const { apiKey: CONTACT_PROVIDER_API_KEY, audienceId: CONTACT_AUDIENCE_ID } = getResendConfig()

const provider = CONTACT_PROVIDER_API_KEY ? new Resend(CONTACT_PROVIDER_API_KEY) : null

export const add: AddContactHandler = async (params) => {
  if (!provider) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('[Resend:Contact] Missing RESEND_API_KEY env var. Simulated contact add for:', params.email)
      return { ok: true }
    }
    throw new Error('Missing RESEND_API_KEY env var')
  }

  const listId: string[] = (params.listIds as string[]) || (CONTACT_AUDIENCE_ID ? [CONTACT_AUDIENCE_ID] : [])
  for (const id of listId) {
    const audienceId = id ?? CONTACT_AUDIENCE_ID
    if (!audienceId) continue

    const audience = await provider.audiences.get(audienceId)

    if (!audience.data) {
      const err = audience.error
      logger.error('Resend provider requires an audienceId in input.metadata.audienceId; skipping', {
        id: audienceId,
        name: err?.name,
        message: err?.message,
      })
      continue
    }

    const response = await provider.contacts.create({
      email: params.email,
      audienceId: audienceId,
      firstName: params.firstName,
      lastName: params.lastName,
      unsubscribed: false,
    })

    if (!response.data) {
      const err = response.error
      logger.error('Resend contacts error', {
        name: err?.name,
        message: err?.message,
      })
      throw new Error(err?.message || 'Resend contacts error')
    }
  }

  return { ok: true } as const
}
