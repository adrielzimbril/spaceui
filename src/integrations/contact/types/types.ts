import { z } from 'zod'

export const ContactSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
})

export enum ContactProvider {
  BREVO = 'brevo',
  RESEND = 'resend',
  CUSTOM = 'custom',
}

export type ContactProviderType = ContactProvider

export type ContactInput = z.infer<typeof ContactSchema> & {
  // Optional list identifiers for providers that support lists (e.g., Brevo)
  listIds?: string[] | number[]
  // Optional tags for providers that support tagging
  tags?: string[]
  // Optional arbitrary metadata for custom provider
  metadata?: Record<string, unknown>
}

export type AddContactResult = {
  ok: true
  alreadyExists?: boolean
}

export interface AddContactHandler {
  (params: ContactInput): Promise<AddContactResult>
}
