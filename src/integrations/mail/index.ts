import React from 'react'
import { sendEmail, type SendEmailOptions } from './provider/resend'
import { ProLicenseDeliveryEmail, type ProLicenseDeliveryEmailProps } from './templates/pro-license-delivery-email'

export { sendEmail, type SendEmailOptions } from './provider/resend'
export { Wrapper, type WrapperProps } from './components/wrapper'
export { PrimaryButton, type PrimaryButtonProps } from './components/primary-button'
export { ProLicenseDeliveryEmail, type ProLicenseDeliveryEmailProps } from './templates/pro-license-delivery-email'

/**
 * Convenience helper to deliver a Space UI Pro license token to a customer.
 */
export async function sendProLicenseEmail({
  to,
  customerName,
  licenseToken,
  orderId,
  planName,
}: {
  to: string
  customerName?: string
  licenseToken: string
  orderId?: string
  planName?: string
}) {
  return sendEmail({
    to,
    subject: 'Your Space UI Pro License Key & Setup Guide',
    react: React.createElement(ProLicenseDeliveryEmail, {
      customerName,
      licenseToken,
      orderId,
      planName,
    }),
  })
}
