'use client'

import React from 'react'
import { cn } from '@/registry/lib/utils'
import { IconMessageCircleFilled, IconUserFilled, IconGraphFilled } from '@tabler/icons-react'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'

export type IconComponent = React.ComponentType<{ size?: number; className?: string }>

export interface StatCardProps {
  icon: IconComponent
  label: string
  value: string | number
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="relative flex flex-col items-center gap-4 group">
      <div className="relative size-fit">
        <div
          className={cn(
            'relative flex bg-background squircle-7xl border-4 size-28 overflow-hidden transition-all duration-300',
            'border-[#8e8eff]',
          )}
        >
          <div className="pointer-events-none flex h-full w-full items-center justify-center">
            <Icon size={42} className="transition-all duration-300 group-hover:scale-110 text-[#8e8eff]" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 right-1/2 translate-x-1/2">
        <Badge
          variant="secondary"
          className="bg-[#8e8eff]! text-white border-0 px-3 py-1 text-sm font-bold whitespace-nowrap"
          size="lg"
          squircle
          // square
        >
          {value}
        </Badge>
      </div>
      <div className="text-center">
        <h6 className="font-semibold text-muted-foreground text-sm md:text-base">{label}</h6>
      </div>
    </div>
  )
}

export interface StatsSectionProps {
  totalMessages: number
  uniqueMembers: number
  weekMessages: number
  isLoading?: boolean
  user?: any
  onLeaveNote?: () => void
  onLogout?: () => void | Promise<void>
}

export function StatsSection({
  totalMessages,
  uniqueMembers,
  weekMessages,
  isLoading = false,
  user,
  onLeaveNote,
  onLogout,
}: StatsSectionProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogoutClick = async () => {
    setIsLoggingOut(true)
    try {
      if (onLogout) {
        await onLogout()
      } else {
        await fetch('/api/auth/logout', { method: 'POST' })
        window.location.href = '/community'
      }
    } catch (err) {
      console.error('Logout failed:', err)
      window.location.href = '/community'
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="relative px-6">
      <div className="flex flex-row flex-wrap justify-center gap-6 max-w-4xl mx-auto">
        <StatCard
          icon={IconMessageCircleFilled}
          label="Messages"
          value={isLoading ? '' : totalMessages.toLocaleString()}
        />
        <StatCard icon={IconUserFilled} label="Members" value={isLoading ? '' : uniqueMembers.toLocaleString()} />
        <StatCard icon={IconGraphFilled} label="Weekly" value={isLoading ? '' : weekMessages.toLocaleString()} />
      </div>

      {onLeaveNote && (
        <div className="flex justify-center mt-8 gap-4">
          <Button
            variant="default"
            size="lg"
            hover
            whileTap
            onClick={onLeaveNote}
            pointer
            className="flex items-center px-6 py-4"
          >
            <div className="relative">
              <StatusBadge
                status={user ? 'online' : 'busy'}
                showIndicator
                animated
                size="sm"
                className="bg-inherit [&_div]:squircle! [&_div]:rounded-7xl! p-0"
              />
            </div>
            <span className="text-sm font-medium">Leave a Note</span>
          </Button>
          {user && (
            <Button
              variant="secondary"
              size="lg"
              hover
              whileTap
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              pointer
              className="flex items-center px-6 py-4"
            >
              <span className="text-sm font-medium">{isLoggingOut ? 'Logging out' : 'Logout'}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
