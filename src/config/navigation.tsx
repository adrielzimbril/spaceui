'use client'

import { IconLayoutGrid, IconBox, IconBook } from '@tabler/icons-react'
import { LucideIcons } from '@/registry/icons/lucide-icons'
import { cn } from '@/registry/lib/utils'
import { registryStats } from '@/__registry__/stats'
import { Dancing_Script } from 'next/font/google'

const dancing = Dancing_Script({ subsets: ['latin'] })

const TabsDescription = ({ title, count }: { title: string; count?: number }) => {
  return (
    <span className="flex items-center flex-row gap-2">
      <span>{title}</span>
      {typeof count === 'number' && (
        <span className="pt-0.5 pb-px px-1.5 font-semibold rounded-full bg-foreground/10 text-[10px] text-foreground/60">
          {count}
        </span>
      )}
    </span>
  )
}

export const SIDEBAR_TABS = [
  {
    title: 'Docs & Primitives',
    description: <TabsDescription title="Docs & Core Primitives" count={registryStats.primitives} />,
    icon: (
      <div className="[&_svg]:size-full rounded-lg size-full text-muted-foreground max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5">
        <IconBox />
      </div>
    ),
    url: '/primitives',
  },
  {
    title: 'Components',
    description: <TabsDescription title="Animated Components & Blocks" count={registryStats.components} />,
    icon: (
      <div className="[&_svg]:size-full rounded-lg size-full text-muted-foreground max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5">
        <IconLayoutGrid />
      </div>
    ),
    url: '/components',
  },
]
