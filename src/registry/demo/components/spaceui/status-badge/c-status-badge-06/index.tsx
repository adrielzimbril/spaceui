import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-4">
      <StatusBadge mode="inline" status="available" primaryText="Available" size="default">
        <Link href="#contact" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
          <span>1 slot remaining this month</span>
          <IconArrowUpRight className="size-3.5" />
        </Link>
      </StatusBadge>
    </div>
  )
}
