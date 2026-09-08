'use client'

import {
  IconGridDots,
  IconSparkles,
  IconBrain,
  IconTarget,
  IconServer,
  IconPalette,
  IconUser,
} from '@tabler/icons-react'
import { BouncyAccordion } from '@/registry/components/spaceui/bouncy-accordion'
import { Badge } from '@/registry/primitives/badge'

export default function Demo() {
  return (
    <div className="w-full min-w-52 max-w-xs p-4">
      <BouncyAccordion
        items={[
          {
            icon: <IconGridDots className="size-4" />,
            title: 'Families and variants',
            description: (
              <>
                Use <Badge variant="secondary">AvatarFamily</Badge> and{' '}
                <Badge variant="secondary">getFamilyVariants(family)</Badge> to build a picker.
              </>
            ),
          },
          {
            icon: <IconSparkles className="size-4" />,
            title: 'Capabilities',
            description: (
              <>
                Use <Badge variant="secondary">getAvatarDetails(variant)</Badge> to know which effects a variant
                supports.
              </>
            ),
          },
          {
            icon: <IconBrain className="size-4" />,
            title: 'Animation state',
            description: (
              <>
                Use <Badge variant="secondary">isAnimateActive(variant, effect)</Badge> when the UI must reflect whether
                animation can run.
              </>
            ),
          },
          {
            icon: <IconTarget className="size-4" />,
            title: 'Deterministic seeds',
            description: 'The same name always maps to the same avatar. Change the seed to explore other identities.',
          },
          {
            icon: <IconServer className="size-4" />,
            title: 'API surface',
            description: 'URL, React, and REST share the same variant and seed model so previews stay in sync.',
          },
          {
            icon: <IconPalette className="size-4" />,
            title: 'Color tokens',
            description:
              'Accent colors follow the current theme. Override per instance when a brand color is required.',
          },
          {
            icon: <IconUser className="size-4" />,
            title: 'Presence',
            description: 'Pair the accordion with presence avatars when a list needs both identity and status.',
          },
        ]}
      />
    </div>
  )
}
