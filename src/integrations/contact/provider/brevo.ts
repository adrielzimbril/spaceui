import type { AddContactHandler } from '@/integrations/contact/types/types'
import { ContactsApi, ContactsApiApiKeys, CreateContact } from '@getbrevo/brevo'
import { getBrevoConfig } from '@/config/integrations'
import { logger } from '@/registry/utils/logger'

const { apiKey: CONTACT_PROVIDER_API_KEY } = getBrevoConfig()

const provider = new ContactsApi()
if (CONTACT_PROVIDER_API_KEY) {
  provider.setApiKey(ContactsApiApiKeys.apiKey, CONTACT_PROVIDER_API_KEY)
}

export const add: AddContactHandler = async ({ email, firstName, lastName, phone, listIds, tags }) => {
  if (!CONTACT_PROVIDER_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('[Brevo:Contact] Missing BREVO_API_KEY env var. Simulated contact add for:', email)
      return { ok: true, alreadyExists: false }
    }
    throw new Error('Missing BREVO_API_KEY env var')
  }

  const nameContact = new CreateContact()
  nameContact.email = email
  nameContact.listIds = listIds && listIds.length > 0 ? listIds.map((id) => Number(id)) : undefined
  // Update when exists for idempotency
  nameContact.updateEnabled = true
  const phoneContact = new CreateContact()
  phoneContact.email = email
  phoneContact.listIds = listIds && listIds.length > 0 ? listIds.map((id) => Number(id)) : undefined
  phoneContact.updateEnabled = true
  // Brevo attributes are case-sensitive
  nameContact.attributes = {
    FIRSTNAME: firstName || undefined,
    LASTNAME: lastName || undefined,
    SMS: undefined,
    TAGS: tags || undefined,
  } as unknown as Record<string, unknown>
  phoneContact.attributes = {
    SMS: phone || undefined,
  } as unknown as Record<string, unknown>

  try {
    const res = await provider.createContact(nameContact)
    const phoneRes = await provider.createContact(phoneContact)
    const alreadyExists: boolean = Boolean(res) || Boolean(phoneRes)
    return { ok: true, alreadyExists } as const
  } catch (err: unknown) {
    if (err && (err as { status: number }).status === 400 && (err as { message: string }).message?.includes('400')) {
      try {
        const updateRes = await provider.updateContact(email, nameContact)
        const updatePhoneRes = await provider.updateContact(email, phoneContact)
        const alreadyExists: boolean = Boolean(updateRes) || Boolean(updatePhoneRes)
        return {
          ok: true,
          alreadyExists,
        } as const
      } catch (updateErr: unknown) {
        const message =
          (updateErr as { body?: { message: string } })?.body?.message ||
          (updateErr as { message: string })?.message ||
          'Unknown Brevo error'
        throw new Error(message)
      }
    }
    const message =
      (err as { body?: { message: string } })?.body?.message ||
      (err as { message: string })?.message ||
      'Unknown Brevo error'

    throw new Error(message)
  }
}
