import React from 'react'
import { Heading, Section, Text } from '@react-email/components'
import { Wrapper } from '../components/wrapper'
import { PrimaryButton } from '../components/primary-button'
import { siteConfig } from '@/config/space-config'

export interface ProLicenseDeliveryEmailProps {
  customerName?: string
  licenseToken: string
  orderId?: string
  planName?: string
}

export function ProLicenseDeliveryEmail({
  customerName,
  licenseToken = 'spc_live_sample_token_xxxx',
  orderId,
  planName = 'Lifetime Pro Access',
}: ProLicenseDeliveryEmailProps) {
  const firstName = customerName ? customerName.split(' ')[0] : 'there'

  return (
    <Wrapper previewText="Your Space UI Pro License Key & Setup Guide">
      <Section className="my-4">
        <Heading as="h1" className="text-2xl font-bold text-[#fafafa] m-0 mb-3">
          Welcome to Space UI Pro, {firstName}! 🚀
        </Heading>
        <Text className="text-sm text-[#a1a1aa] leading-relaxed m-0 mb-6">
          Thank you for your purchase of <strong>{planName}</strong>. You now have unlimited, lifetime access to all Pro
          components, templates, and full-page layouts.
        </Text>
      </Section>

      {/* License Key Box */}
      <Section className="bg-[#18181b] border border-solid border-[#27272a] rounded-xl p-5 mb-6 text-center">
        <Text className="text-xs uppercase tracking-wider text-[#71717a] font-semibold m-0 mb-2">
          Your Space UI Authorization Token
        </Text>
        <Text className="text-base font-mono font-bold text-[#60a5fa] bg-[#09090b] border border-solid border-[#27272a] rounded-lg py-2.5 px-4 m-0 inline-block select-all">
          {licenseToken}
        </Text>
        {orderId && <Text className="text-xs text-[#52525b] mt-3 mb-0">Order Reference: {orderId}</Text>}
      </Section>

      {/* CLI Setup Instructions */}
      <Section className="mb-6">
        <Text className="text-sm font-semibold text-[#fafafa] m-0 mb-2">
          How to install Pro components with the Shadcn CLI:
        </Text>
        <Text className="text-xs text-[#a1a1aa] leading-relaxed m-0 mb-3">
          Set your token in your environment or{' '}
          <code className="text-[#e4e4e7] bg-[#27272a] px-1 py-0.5 rounded">.env.local</code>:
        </Text>
        <Section className="bg-[#09090b] border border-solid border-[#27272a] rounded-lg p-3 mb-4">
          <Text className="text-xs font-mono text-[#a1a1aa] m-0">SPACEUI_TOKEN={licenseToken}</Text>
        </Section>
        <Text className="text-xs text-[#a1a1aa] leading-relaxed m-0 mb-3">
          Then install any Pro block or template directly into your app:
        </Text>
        <Section className="bg-[#09090b] border border-solid border-[#27272a] rounded-lg p-3 mb-4">
          <Text className="text-xs font-mono text-[#38bdf8] m-0">
            pnpm dlx shadcn@latest add https://www.spaceui.one/r/block-prism-carousel.json
          </Text>
        </Section>
      </Section>

      {/* CTA Button */}
      <Section className="text-center my-8">
        <PrimaryButton href={`${siteConfig.url}/showcase`}>Explore Pro Templates & Showcase</PrimaryButton>
      </Section>
    </Wrapper>
  )
}

export default ProLicenseDeliveryEmail
