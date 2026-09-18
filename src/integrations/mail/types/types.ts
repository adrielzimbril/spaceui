import { z } from 'zod'

export const SendEmailRecipientSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export const SendEmailParamsTo = z.array(SendEmailRecipientSchema)

export const SendEmailParamsSubject = z.string()

export const SendEmailParamsBody = z.object({
  html: z.string().optional(),
  react: z.any().optional(),
})

export interface SendEmailRecipient {
  email: string
  name?: string
}

export interface SendEmailParams {
  to: SendEmailRecipient[]
  subject: string
  text?: string
  body?: {
    html?: string
    react?: any
  }
}

export type SendEmailHandler = (params: SendEmailParams) => Promise<any>

export interface MailProvider {
  send: SendEmailHandler
}
