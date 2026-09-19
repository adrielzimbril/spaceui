'use client'

import * as React from 'react'
import { Badge } from '@/registry/primitives/badge'
import {
  IconSettings,
  IconCalendar,
  IconBell,
  IconSearch,
  IconUser,
  IconFolder,
  IconMail,
  IconSparkles,
  IconSparkle,
  IconShield,
  IconLayoutGrid,
  IconAdjustmentsHorizontal,
  IconTrash,
} from '@tabler/icons-react'
import {
  Settings,
  Calendar,
  Bell,
  Search,
  User,
  Folder,
  Mail,
  Sparkles,
  Shield,
  LayoutGrid,
  SlidersHorizontal,
  Trash,
} from 'lucide-react'

export interface IconPreviewProps {
  library: 'tabler' | 'lucide'
  name: string
}

const TABLER_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  IconSettings,
  IconCalendar,
  IconBell,
  IconSearch,
  IconUser,
  IconFolder,
  IconMail,
  IconSparkles,
  IconSparkle,
  IconShield,
  IconLayoutGrid,
  IconAdjustmentsHorizontal,
  IconTrash,
}

const LUCIDE_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Settings,
  Calendar,
  Bell,
  Search,
  User,
  Folder,
  Mail,
  Sparkles,
  Shield,
  LayoutGrid,
  SlidersHorizontal,
  Trash,
}

export function IconPreview({ library, name }: IconPreviewProps) {
  const IconComponent = library === 'tabler' ? TABLER_ICONS[name] : LUCIDE_ICONS[name]

  if (!IconComponent) {
    return null
  }

  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <Badge variant="outline" square size="lg">
        <IconComponent className="size-4 text-foreground" strokeWidth={1.8} />
      </Badge>
      <Badge className="bg-muted text-foreground text-[11px]">{name}</Badge>
    </span>
  )
}
