import type { Metadata } from 'next'
import projectsData from '@/data/projects.json'
import type { ProjectItem } from '@/types/project'
import { ShowcaseGallery } from '@/components/showcase/showcase-gallery'

export const metadata: Metadata = {
  title: 'Showcase — Space UI',
  description: 'Explore production-ready templates and landing pages built with Space UI.',
}

export default function ShowcasePage() {
  const projects = (projectsData.projects as ProjectItem[]).map((p) => ({
    ...p,
    repo: p.isPro ? '' : p.repo,
    repo_url: p.isPro ? '' : p.repo_url,
  }))

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ShowcaseGallery projects={projects} />
    </main>
  )
}
