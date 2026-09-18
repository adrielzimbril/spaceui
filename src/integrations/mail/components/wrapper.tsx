import { Container, Font, Head, Html, Preview, Section, Tailwind, Text, Hr } from '@react-email/components'
import React, { type PropsWithChildren } from 'react'
import { siteConfig } from '@/config/space-config'

export interface WrapperProps extends PropsWithChildren {
  previewText?: string
}

export function Wrapper({ previewText, children }: WrapperProps) {
  return (
    <Html lang="en">
      <Head>
        <Font fontFamily="Inter" fallbackFontFamily="Arial" fontWeight={400} fontStyle="normal" />
      </Head>
      {previewText && <Preview>{previewText}</Preview>}
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                background: '#09090b',
                card: '#18181b',
                border: '#27272a',
                foreground: '#fafafa',
                muted: '#a1a1aa',
                primary: '#3b82f6',
              },
            },
          },
        }}
      >
        <Body className="bg-[#09090b] my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#27272a] rounded-2xl my-[40px] mx-auto p-[32px] max-w-[560px] bg-[#121215]">
            {/* Header logo */}
            <Section className="mb-6">
              <Text className="text-xl font-bold tracking-tight text-[#fafafa] m-0">
                Space UI{' '}
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/40 ml-2">
                  PRO
                </span>
              </Text>
            </Section>

            {children}

            {/* Footer */}
            <Hr className="border-[#27272a] my-8" />
            <Section className="text-center">
              <Text className="text-xs text-[#71717a] m-0 leading-relaxed">
                {siteConfig.appName} — An open-source design library for humans and AI.
              </Text>
              <Text className="text-xs text-[#52525b] mt-2 mb-0">
                Have questions or need assistance? Reply directly to this email or reach us at{' '}
                <a href={`mailto:${siteConfig.email}`} className="text-[#a1a1aa] underline">
                  {siteConfig.email}
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default Wrapper
