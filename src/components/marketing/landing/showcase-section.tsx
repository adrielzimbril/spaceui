import Link from 'next/link'
import { IconArrowRight, IconSparkles } from '@tabler/icons-react'
import projectsData from '@/data/projects.json'
import type { ProjectItem } from '@/types/project'
import { ProjectCard } from '@/components/showcase/project-card'
import { buttonVariants } from '@/registry/primitives/button'
import { cn } from '@/registry/lib/utils'

export function ShowcaseSection() {
  const allProjects = (projectsData.projects as ProjectItem[]).map((p) => ({
    ...p,
    repo: p.isPro ? '' : p.repo,
    repo_url: p.isPro ? '' : p.repo_url,
  }))
  // Curate 3 standout projects for the homepage showcase (e.g. CineMax Pro, Cosmos AI, Marveen Pro)
  const featuredNames = ['cinemax-landing', 'cosmos-ai-landing', 'marveen-landing']
  const featured = allProjects.filter((p) => featuredNames.includes(p.name))

  return (
    <section data-page-section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28 border-t border-border/40">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        {/* Header with Title and CTA */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-xs">
              <IconSparkles className="size-3.5 text-primary" />
              <span>Full-Page Starters</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl text-foreground">
              Production Landings & Experiences
            </h2>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Ready-to-deploy templates and cinematic landing pages. Clone free open-source starters or explore Pro
              creations with next-level animations and polish.
            </p>
          </div>

          <Link
            href="/showcase"
            className={cn(
              buttonVariants({ variant: 'default', size: 'default' }),
              'group gap-2 self-start sm:self-end',
            )}
          >
            <span>Explore all {allProjects.length} templates</span>
            <IconArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3 Featured Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project, index) => (
            <ProjectCard key={project.name} project={project} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  )
}
