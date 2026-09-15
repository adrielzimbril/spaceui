'use client'

import * as React from 'react'
import Image from 'next/image'
import { AdaptiveDensityGrid, type DensityOption } from '@/registry/components/spaceui/adaptive-density-grid'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/primitives/input-group'
import { IconSearch, IconSparkles, IconLayersIntersect, IconShieldLock } from '@tabler/icons-react'

interface TemplateItem {
  id: string
  title: string
  category: 'all' | 'starter' | 'saas' | 'ai'
  isPro: boolean
  tag: string
  image: string
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'tpl-1',
    title: 'Next.js Nebula SaaS',
    category: 'saas',
    isPro: true,
    tag: 'Fullstack',
    image: 'https://avatars.spaceui.one/v1?name=nebula&variant=gradients',
  },
  {
    id: 'tpl-2',
    title: 'Modern Minimal Portfolio',
    category: 'starter',
    isPro: false,
    tag: 'Free',
    image: 'https://avatars.spaceui.one/v1?name=portfolio&variant=gradients',
  },
  {
    id: 'tpl-3',
    title: 'Agentic AI Playground',
    category: 'ai',
    isPro: true,
    tag: 'AI Kit',
    image: 'https://avatars.spaceui.one/v1?name=agentic&variant=gradients',
  },
  {
    id: 'tpl-4',
    title: 'Space UI Documentation',
    category: 'starter',
    isPro: false,
    tag: 'Free',
    image: 'https://avatars.spaceui.one/v1?name=spacedocs&variant=gradients',
  },
  {
    id: 'tpl-5',
    title: 'Fintech Dashboard Dark',
    category: 'saas',
    isPro: true,
    tag: 'Finance',
    image: 'https://avatars.spaceui.one/v1?name=fintech&variant=gradients',
  },
  {
    id: 'tpl-6',
    title: 'Voice AI Studio WebApp',
    category: 'ai',
    isPro: true,
    tag: 'Audio',
    image: 'https://avatars.spaceui.one/v1?name=voiceai&variant=gradients',
  },
]

const CATEGORY_OPTIONS: DensityOption[] = [
  {
    id: 'all',
    label: 'All Kits',
    icon: <IconLayersIntersect className="size-3.5" />,
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: '1rem',
  },
  {
    id: 'saas',
    label: 'SaaS',
    icon: <IconSparkles className="size-3.5" />,
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: '1rem',
  },
  {
    id: 'ai',
    label: 'AI Apps',
    icon: <IconShieldLock className="size-3.5" />,
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: '1rem',
  },
  {
    id: 'starter',
    label: 'Starters',
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: '1rem',
  },
]

export default function AdaptiveDensityGridDemo02() {
  const [activeTab, setActiveTab] = React.useState<string | number>('all')
  const [search, setSearch] = React.useState('')

  const filteredItems = React.useMemo(() => {
    return TEMPLATES.filter((tpl) => {
      if (activeTab !== 'all' && tpl.category !== activeTab) return false
      if (search.trim()) {
        return tpl.title.toLowerCase().includes(search.toLowerCase().trim())
      }
      return true
    })
  }, [activeTab, search])

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <AdaptiveDensityGrid
        items={filteredItems}
        options={CATEGORY_OPTIONS}
        activeId={activeTab}
        onOptionChange={setActiveTab}
        controlsExtra={
          <div className="w-56">
            <InputGroup>
              <InputGroupAddon>
                <IconSearch className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Filter templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs h-8"
              />
            </InputGroup>
          </div>
        }
        renderItem={(item) => (
          <Frame className="group flex flex-col h-full">
            <Card className="flex-1 flex flex-col h-full rounded-xl overflow-hidden">
              <CardPanel className="flex-1 relative flex aspect-16/10 w-full overflow-hidden p-0 rounded-lg bg-muted border border-border/40">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover select-none transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-10">
                  <Badge size="xs" variant={item.isPro ? 'primary' : 'secondary'}>
                    {item.tag}
                  </Badge>
                  <Badge size="xs" variant="secondary" className="bg-background! uppercase">
                    {item.category}
                  </Badge>
                </div>
              </CardPanel>
            </Card>

            <FrameFooter className="flex flex-row items-center justify-between p-2 gap-2">
              <FrameTitle className="truncate text-sm text-muted-foreground font-semibold">{item.title}</FrameTitle>
              <Button variant="default" size="xs" pointer hover>
                View
              </Button>
            </FrameFooter>
          </Frame>
        )}
      />
    </div>
  )
}
