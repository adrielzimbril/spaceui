import { useMemo } from 'react'
import { cn } from '@/registry/lib/utils'
import { type AvatarEffect, type AvatarVariant, getAllAvatarDetails } from '@usespaceui/avatars'
import { Persona as Avatar } from '@/tools/components/shared/avatar/persona'
import { HISTORICAL_PERSONAS } from '@/tools/shared/seeds'
import DashboardMockup from './DashboardMockup'
import ChatMockup from './ChatMockup'
import SocialProfileMockup from './SocialProfileMockup'
import CreatorProfileMockup from './CreatorProfileMockup'
import ShareMockup from './ShareMockup'
import SuggestedUsersMockup from './SuggestedUsersMockup'
import ConversationMockup from './ConversationMockup'
import NewPostMockup from './NewPostMockup'
import { MockupBadge, MockupSurface } from './MockupPrimitives'

const AVATAR_VARIANTS = getAllAvatarDetails().map((detail) => detail.id)

function stableHash(value: string): number {
  let hash = 0
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) | 0
  return hash >>> 0
}

function deterministicVariantOrder(seed: string) {
  return [...AVATAR_VARIANTS].sort((a, b) => stableHash(`${seed}:${a}`) - stableHash(`${seed}:${b}`))
}

interface MockupGalleryProps {
  title?: string
  imgProfile: string
  imgUpload: string
  variant: AvatarVariant | 'all'
  colors?: string[]
  nameProfile: string
  nameInstagram: string
  nameUpload: string
  nameUploadLikes: string[]
  dataList: Array<{
    name: string
    email: string
    time: string
    status?: boolean
  }>
  dataTwitter: Array<{
    name: string
    handle: string
    tweet: string
    time: string
  }>
  dataSuggested: Array<{
    name: string
  }>
  dataShared: Array<{
    name: string
    role: string
  }>
  circle?: boolean
  effect?: AvatarEffect
  animate?: boolean
  seed?: string
}

export const MockupGallery: React.FC<MockupGalleryProps> = ({
  imgProfile,
  imgUpload,
  variant,
  colors,
  nameProfile,
  nameInstagram,
  nameUpload,
  nameUploadLikes,
  dataList,
  dataTwitter,
  dataSuggested,
  dataShared,
  circle = true,
  effect = 'none',
  animate = false,
  seed,
}) => {
  const shuffledVariants = useMemo(() => deterministicVariantOrder(seed ?? ''), [seed])

  const variantFor = (index: number) =>
    variant === 'all' ? shuffledVariants[index % shuffledVariants.length] : variant

  return (
    <section data-testid="mockup-content" className="min-h-full w-full bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto flex h-full max-w-280 flex-col gap-4">
        <MockupSurface
          title="Avatar mockups"
          meta={variant === 'all' ? 'All families' : variant}
          contentClassName="p-4 sm:p-5"
        >
          <div className="rounded-2xl bg-muted p-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden" data-lenis-prevent="true">
              {HISTORICAL_PERSONAS.slice(0, 12).map((exampleName, i) => (
                <div
                  key={exampleName}
                  className="flex min-w-16 flex-col items-center gap-2 rounded-xl bg-background px-4.5 py-2.5"
                >
                  <span className={cn('flex size-fit overflow-hidden bg-muted p-1', circle && 'rounded-full')}>
                    <Avatar
                      name={exampleName + (seed || '')}
                      colors={colors}
                      variant={variantFor(i)}
                      circle={circle}
                      effect={effect}
                      animate={animate}
                      size={44}
                    />{' '}
                  </span>
                  <span className="max-w-12 truncate text-[0.625rem] font-medium text-muted-foreground">
                    {exampleName.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </MockupSurface>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MockupSurface title="New post">
            <NewPostMockup
              name={nameUpload}
              colors={colors}
              variant={variantFor(0)}
              likes={nameUploadLikes}
              img={imgUpload}
              circle={circle}
              effect={effect}
              animate={animate}
              seed={seed}
            />
          </MockupSurface>
          <MockupSurface title="Conversation">
            <ConversationMockup
              users={dataTwitter}
              colors={colors}
              variant={variantFor(1)}
              circle={circle}
              effect={effect}
              animate={animate}
              seed={seed}
            />
          </MockupSurface>
          <div className="grid gap-4">
            <MockupSurface title="Profile">
              <SocialProfileMockup
                name={nameInstagram}
                colors={colors}
                variant={variantFor(2)}
                img={imgProfile}
                circle={circle}
                effect={effect}
                animate={animate}
                seed={seed}
              />
            </MockupSurface>
            <MockupSurface title="Dashboard">
              <DashboardMockup
                colors={colors}
                variant={variantFor(7)}
                circle={circle}
                effect={effect}
                animate={animate}
                seed={seed}
              />
            </MockupSurface>
          </div>
          <div className="grid gap-4 sm:grid-rows-1 xl:grid-rows-2">
            <MockupSurface title="Activity" meta="Today">
              <div className="flex items-center gap-3 rounded-2xl justify-between space-between bg-muted p-4">
                <div className="flex h-full flex-col justify-between rounded-2xl bg-muted">
                  <div>
                    <p className="text-3xl font-semibold tabular-nums">24</p>
                    <p className="mt-1 text-xs text-muted-foreground">avatars generated today</p>
                  </div>
                  <MockupBadge className="mt-4">+18% this week</MockupBadge>
                </div>
                <span className={cn('flex size-fit overflow-hidden bg-background p-1', circle && 'rounded-full')}>
                  <Avatar
                    name={(HISTORICAL_PERSONAS[14] ?? HISTORICAL_PERSONAS[2]) + (seed || '')}
                    colors={colors}
                    variant={variantFor(8)}
                    circle={circle}
                    effect={effect}
                    animate={animate}
                    size={64}
                  />
                </span>
              </div>
            </MockupSurface>
            <MockupSurface title="Workspace" meta="8 members">
              <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
                <span className={cn('flex size-fit overflow-hidden bg-background p-1', circle && 'rounded-full')}>
                  <Avatar
                    name={(HISTORICAL_PERSONAS[10] ?? HISTORICAL_PERSONAS[0]) + (seed || '')}
                    colors={colors}
                    variant={variantFor(7)}
                    circle={circle}
                    effect={effect}
                    animate={animate}
                    size={36}
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Identity workspace</p>
                  <p className="mt-1 text-xs text-muted-foreground">Updated a few seconds ago</p>
                </div>
              </div>
            </MockupSurface>
          </div>
          <MockupSurface title="Mutual followers">
            <SuggestedUsersMockup
              users={dataSuggested}
              colors={colors}
              variant={variantFor(3)}
              circle={circle}
              effect={effect}
              animate={animate}
              seed={seed}
            />
          </MockupSurface>
          <MockupSurface title="Chat">
            <ChatMockup
              users={dataList}
              colors={colors}
              variant={variantFor(5)}
              circle={circle}
              effect={effect}
              animate={animate}
              seed={seed}
            />
          </MockupSurface>
          <MockupSurface title="Creator">
            <CreatorProfileMockup
              name={nameProfile}
              colors={colors}
              variant={variantFor(4)}
              img={imgProfile}
              circle={circle}
              effect={effect}
              animate={animate}
              seed={seed}
            />
          </MockupSurface>
          <MockupSurface title="Share" className="md:col-span-2">
            <ShareMockup
              users={dataShared}
              colors={colors}
              variant={variantFor(6)}
              circle={circle}
              effect={effect}
              animate={animate}
              seed={seed}
            />
          </MockupSurface>
          <MockupSurface title="Asset library" meta="6 assets" className="sm:col-span-2 xl:col-span-3">
            <div className="flex flex-col gap-4 rounded-2xl bg-muted p-4 sm:flex-row sm:items-center">
              <div className="flex -space-x-2">
                {HISTORICAL_PERSONAS.slice(10, 16).map((exampleName, index) => (
                  <div
                    key={exampleName}
                    className={cn('overflow-hidden rounded-xl bg-background p-0.5', circle && 'rounded-full')}
                  >
                    <Avatar
                      name={exampleName + (seed || '')}
                      colors={colors}
                      variant={variantFor(index + 8)}
                      circle={circle}
                      effect={effect}
                      animate={animate}
                      size={30}
                    />
                  </div>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Reusable identities</p>
                <p className="mt-1 text-xs text-muted-foreground">A consistent set ready for every product surface.</p>
              </div>
              <MockupBadge>Synced</MockupBadge>
            </div>
          </MockupSurface>
        </div>
      </div>
    </section>
  )
}

export default MockupGallery
