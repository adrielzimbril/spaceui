import { logger } from '@/registry/utils/logger'
import {
  type ContactInput,
  ContactProvider,
  type ContactProviderType,
} from '@/integrations/contact/types/types'
import { addWithBrevo, addWithResend, addWithCustom } from '@/integrations/contact/provider'
import { ConfigValue } from '@/config/integrations'

function resolveProvider(input?: ContactProviderType): ContactProvider {
  const fromEnv = (ConfigValue.CONTACTS_PROVIDER || '').toLowerCase()
  const envProvider =
    fromEnv === 'brevo' || fromEnv === 'resend' || fromEnv === 'custom' ? (fromEnv as ContactProvider) : undefined
  return input || envProvider || ContactProvider.BREVO
}

export async function addContact(input: ContactInput & { provider?: ContactProvider }) {
  const provider = resolveProvider(input.provider)
  try {
    if (provider === ContactProvider.RESEND) {
      return await addWithResend(input)
    }
    if (provider === ContactProvider.CUSTOM) {
      return await addWithCustom(input)
    }
    return await addWithBrevo(input)
  } catch (e) {
    logger.error('addContact failed', e)
    throw e
  }
}
