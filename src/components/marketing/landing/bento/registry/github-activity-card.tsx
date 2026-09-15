'use client'

import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { GitHubActivity } from '@/registry/components/spaceui/github-activity'

export function GitHubActivityCard() {
  return (
    <Frame className="flex flex-col h-full sm:col-span-2 lg:col-span-2 min-w-0">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden min-w-0">
        <CardPanel className="flex-1 flex min-h-60 flex-col justify-center p-4 sm:p-6 rounded-lg min-w-0 w-full overflow-hidden">
          <GitHubActivity user="adrielzimbril" shape="rounded" />
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">GitHub Activity</FrameTitle>
        <Link
          href="/components/github-activity"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
