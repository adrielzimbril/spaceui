import type { Metadata } from 'next'
import projectsData from '@/data/projects.json'
import type { ProjectItem } from '@/types/project'
import { MarketingHero, HeroAvatar } from '@/components/marketing/shared/hero'
import { ShowcaseGallery } from '@/components/marketing/showcase/showcase-gallery'
import { PageThemeLock } from '@/components/providers/theme-lock-provider'

export const metadata: Metadata = {
  title: 'Showcase',
  description: 'Explore production-ready templates and landing pages built with Space UI.',
}

export default function ShowcasePage() {
  const projects = (projectsData.projects as ProjectItem[]).map((p) => ({
    ...p,
    repo: p.isPro ? '' : p.repo,
    repo_url: p.isPro ? '' : p.repo_url,
  }))

  return (
    <PageThemeLock theme="dark">
      <div className="relative min-h-dvh bg-background text-foreground selection:bg-primary/20">
        <MarketingHero
          statusBadge={{
            primaryText: 'Showcase',
            secondaryText: 'Curated templates & apps',
            emojiCodepoint: '✨',
            href: '/showcase',
          }}
          title={
            <>
              Crafted with <HeroAvatar name="showcase" variant="doodle" /> Space UI{' '}
              <HeroAvatar name="c" variant="invader" animate />
            </>
          }
          description="Explore production-ready templates, creative components, and real landing pages built with Space UI."
        />
        <main className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pb-24">
          <ShowcaseGallery projects={projects} />
        </main>
      </div>
    </PageThemeLock>
  )
}
