'use client'

import * as React from 'react'
import { GitHubActivity, type GitHubActivityShape } from '@/registry/components/spaceui/github-activity'

export interface GitHubActivityDemoProps {
  user?: string
  username?: string
  shape?: GitHubActivityShape
  showHeader?: boolean
  showLegend?: boolean
}

export default function Demo({
  user = 'https://github.com/adrielzimbril/spaceui',
  shape = 'rounded',
  showHeader = true,
  showLegend = true,
}: GitHubActivityDemoProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center">
      <GitHubActivity user={user} shape={shape} showHeader={showHeader} showLegend={showLegend} />
    </div>
  )
}
