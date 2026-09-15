'use client'

import { CommunityWall, type CommunityMessage } from '../index'

export const DEFAULT_COMMUNITY_NOTES: CommunityMessage[] = [
  {
    id: 'demo-1',
    creator_name: 'Guillermo Rauch',
    creator_avatar_url: null,
    message: 'The web should be fast, delightful, and reactive. Space UI feels like the future of frontend craft.',
    patternIndex: 0,
    rotation: -2,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'demo-2',
    creator_name: 'Jony Ive',
    creator_avatar_url: null,
    message:
      "Simplicity isn't just the lack of clutter. It's about bringing order, intention, and tactile depth to every interaction.",
    patternIndex: 1,
    rotation: 4,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'demo-3',
    creator_name: 'Dieter Rams',
    creator_avatar_url: null,
    message: 'Good design is as little design as possible. Less, but better. These components embody that philosophy.',
    patternIndex: 2,
    rotation: -3,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'demo-4',
    creator_name: 'Pieter Levels',
    creator_avatar_url: null,
    message: 'Shipped my next startup MVP using Space UI in 4 hours. No bloat, pure speed.',
    patternIndex: 3,
    rotation: 5,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'demo-5',
    creator_name: 'Marc Lou',
    creator_avatar_url: null,
    message: 'The micro-interactions and audio feedback are insane. Best design engineering toolkit out there.',
    patternIndex: 4,
    rotation: -4,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'demo-6',
    creator_name: 'Patrick Collison',
    creator_avatar_url: null,
    message: 'Delightful infrastructure for interfaces. The attention to typography and physics is palpable.',
    patternIndex: 5,
    rotation: 2,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'demo-7',
    creator_name: 'Tobias Lütke',
    creator_avatar_url: null,
    message: 'Crafting tools for builders. The draggable canvas alone is worth the price of admission.',
    patternIndex: 6,
    rotation: 6,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
]

export default function CommunityWallDemo() {
  return (
    <div className="relative w-full h-dvh">
      <CommunityWall messages={DEFAULT_COMMUNITY_NOTES} height="100%" />
    </div>
  )
}
