import { logger } from '@/registry/utils/logger'
import type { AddContactHandler } from '@/integrations/contact/types/types'

export const add: AddContactHandler = async ({ email, firstName, lastName, phone, tags, metadata }) => {
  logger.info('[Contact:Custom] Received contact', {
    email,
    firstName,
    lastName,
    phone,
    tags,
    metadata,
  })
  return { ok: true } as const
}
