'use client'

import * as React from 'react'
import { Frame } from '@/registry/primitives/frame'
import { Card, CardContent } from '@/registry/primitives/card'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { IconArrowUpRight } from '@tabler/icons-react'
import { cn } from '@/registry/lib/utils'

export interface FooterSocialItem {
  name: string
  key: string
  url: string
}

export interface FooterRouteItem {
  key: string
  name: string
  link: string
}

export interface FooterProps {
  planningStatus?: 'online' | 'available' | 'busy' | 'away'
  planningTitle?: string
  planningDescription?: string
  contactLink?: string
  subtitle?: string
  newsletterTitle?: string
  newsletterDescription?: string
  newsletterButtonText?: string
  newsletterSubText?: string
  authorName?: string
  routes?: FooterRouteItem[]
  socialLinks?: FooterSocialItem[]
  className?: string
}

const DEFAULT_ROUTES: FooterRouteItem[] = [
  { key: 'talks', name: 'Talks', link: '#talks' },
  { key: 'community', name: 'Community', link: '#community' },
  { key: 'stats', name: 'Stats', link: '/templates/stats' },
  { key: 'toolbox', name: 'Toolbox', link: '/tools' },
  { key: 'connections', name: 'Connections', link: '#connections' },
  { key: 'routes', name: 'Sitemap', link: '#sitemap' },
]

const DEFAULT_SOCIALS: FooterSocialItem[] = [
  { name: 'Email', key: 'email', url: 'mailto:hello@adrielzimbril.com' },
  { name: 'LinkedIn', key: 'linkedin', url: 'https://linkedin.com' },
  { name: 'X', key: 'x', url: 'https://x.com' },
  { name: 'GitHub', key: 'github', url: 'https://github.com/adrielzimbril' },
  { name: 'YouTube', key: 'youtube', url: 'https://youtube.com' },
]

const LANGUAGE_OPTIONS = [
  { label: 'Français 🇫🇷', value: 'fr' },
  { label: 'English 🇺🇸', value: 'en' },
  { label: '中文 🇨🇳', value: 'zh' },
]

function FooterLinksContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full place-self-center rounded-3xl bg-muted/70 dark:bg-zinc-900 py-4 md:py-6">
      <div className="w-full flex flex-col flex-wrap md:flex-row justify-center place-content-center items-center gap-2">
        {children}
      </div>
    </div>
  )
}

/**
 * Footer Component (Authentic Portfolio Code adapted with Frame & Card)
 */
export default function Footer({
  planningStatus = 'available',
  planningTitle = 'Disponible',
  planningDescription = '1 place restante pour ce mois-ci',
  contactLink = '#contact',
  subtitle = 'Je transforme vos idées en produits numériques remarquables.',
  newsletterTitle = 'Restons connectés',
  newsletterDescription = "Recevez les nouveautés, ressources et retours d'expérience sur mes projets SaaS.",
  newsletterButtonText = "S'abonner",
  newsletterSubText = 'Pas de spam, désinscription en 1 clic.',
  authorName = 'Adriel Zimbril',
  routes = DEFAULT_ROUTES,
  socialLinks = DEFAULT_SOCIALS,
  className,
}: FooterProps) {
  return (
    <footer className={cn('w-full pt-0 pb-8', className)}>
      <Frame className="w-full bg-stone-100 dark:bg-zinc-900 squircle-6xl/100 border-0 overflow-hidden p-3 md:p-6 shadow-none">
        <Card className="w-full bg-background squircle-2xl/100 md:squircle-4xl/100 border-0 shadow-none overflow-hidden before:hidden">
          <CardContent className="flex relative flex-col w-full items-center justify-center p-4 md:p-12 lg:p-16 gap-4 md:gap-8 mx-auto">
            <div className="flex flex-col justify-center items-center lg:grid grid-cols-1 lg:grid-cols-2 lg:flex-row lg:justify-between lg:items-start gap-8 w-full">
              {/* Left Column: Planning Status & Socials */}
              <div className="flex flex-col gap-4 md:gap-6 w-full rounded-2xl">
                <Card className="flex flex-col gap-6 rounded-3xl bg-muted/60 dark:bg-zinc-800/60 px-4 py-6 md:px-6 border-0 shadow-none before:hidden">
                  <div className="flex flex-col gap-3">
                    <StatusBadge
                      mode="inline"
                      status={planningStatus}
                      primaryText={planningTitle}
                      className="bg-background text-foreground w-fit shadow-xs"
                      variant="colored"
                      size="md"
                    >
                      <a href={contactLink} className="inline-flex items-center gap-1.5 hover:underline">
                        <span>{planningDescription}</span>
                        <IconArrowUpRight size={18} />
                      </a>
                    </StatusBadge>
                    <span className="relative text-base font-medium text-muted-foreground px-2">{subtitle}</span>
                  </div>
                </Card>

                {/* Social links buttons without icons, matching original */}
                <div className="flex items-center flex-wrap content-center place-content-center md:place-content-start md:justify-start gap-2.5">
                  {socialLinks.map((social) => (
                    <Button
                      key={social.key}
                      variant="secondary"
                      size="xs"
                      whileTap
                      asPointer
                      render={<a href={social.url} target="_blank" rel="noopener noreferrer" />}
                      aria-label={social.name}
                    >
                      <span className="capitalize">{social.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Right Column: Newsletter Card */}
              <Card className="flex flex-col justify-self-end gap-6 w-full md:max-w-md rounded-2xl bg-muted/60 dark:bg-zinc-800/60 p-6 border-0 shadow-none before:hidden">
                <div className="flex flex-col gap-4">
                  <h4 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    {newsletterTitle}
                  </h4>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {newsletterDescription}
                  </p>
                  <div className="flex flex-col gap-2.5 pt-2">
                    <Button variant="primary" size="default" asFull whileTap asPointer>
                      <span>{newsletterButtonText}</span>
                    </Button>
                    <span className="relative text-xs text-muted-foreground bg-background p-2.5 rounded-xl text-center border border-border/40">
                      {newsletterSubText}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Footer Navigation Links Container */}
            <FooterLinksContainer>
              {routes.map((route, index) => (
                <React.Fragment key={route.key}>
                  <a
                    href={route.link}
                    className="text-sm font-medium text-foreground bg-background hover:bg-muted/80 rounded-xl py-2 px-4 transition-colors"
                  >
                    {route.name}
                  </a>
                  {index < routes.length - 1 && (
                    <>
                      <div className="hidden md:block w-px h-5 bg-zinc-300 dark:bg-zinc-700 rounded-xl" />
                      <div className="block md:hidden w-12 h-px bg-zinc-300 dark:bg-zinc-700 rounded-xl" />
                    </>
                  )}
                </React.Fragment>
              ))}
            </FooterLinksContainer>

            {/* Bottom Bar: Copyright & Language Selector Dropdown matching original */}
            <div className="flex flex-col md:flex-row w-full justify-center md:justify-between align-center place-content-center items-center gap-4 rounded-2xl py-4 md:px-6 bg-muted/50 dark:bg-zinc-900/60 text-sm">
              <div className="flex items-center md:items-start gap-2 text-foreground">
                <p className="relative font-medium text-center md:text-left">
                  <span>
                    © {new Date().getFullYear()} {authorName}. All rights reserved.
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select aria-label="Language" defaultValue="fr" items={LANGUAGE_OPTIONS}>
                  <SelectTrigger className="w-fit min-w-32 h-8 text-xs bg-background squircle-2xl/100 border border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {LANGUAGE_OPTIONS.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </Frame>
    </footer>
  )
}

// Aliases
export { Footer as FooterTactile }
