'use client'

import * as React from 'react'
import { IconSearch, IconX, IconFolderHeart } from '@tabler/icons-react'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/primitives/input-group'
import { Button } from '@/registry/primitives/button'
import type { ProjectItem } from '@/types/project'
import { ProjectCard } from '@/components/showcase/project-card'

interface ShowcaseGalleryProps {
  projects: ProjectItem[]
}

type FilterTab = 'all' | 'free' | 'pro'

export function ShowcaseGallery({ projects }: ShowcaseGalleryProps) {
  const [activeTab, setActiveTab] = React.useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = React.useState('')

  // Inverser l'ordre du plus récent au plus ancien (projet 19 -> projet 1)
  const sortedProjects = React.useMemo(() => {
    return [...projects].reverse()
  }, [projects])

  const counts = React.useMemo(() => {
    const free = sortedProjects.filter((p) => !p.isPro).length
    const pro = sortedProjects.filter((p) => p.isPro).length
    return { all: sortedProjects.length, free, pro }
  }, [sortedProjects])

  const filteredProjects = React.useMemo(() => {
    return sortedProjects.filter((project) => {
      // Tab filter
      if (activeTab === 'free' && project.isPro) return false
      if (activeTab === 'pro' && !project.isPro) return false

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = project.title.toLowerCase().includes(query)
        const matchHeadline = project.headline.toLowerCase().includes(query)
        const matchDesc = project.description.toLowerCase().includes(query)
        const matchName = project.name.toLowerCase().includes(query)
        return matchTitle || matchHeadline || matchDesc || matchName
      }

      return true
    })
  }, [sortedProjects, activeTab, searchQuery])

  return (
    <div className="space-y-6">
      {/* Controls Bar: Official Tabs & InputGroup from registry */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as FilterTab)}>
          <TabsList size="sm">
            <TabsTab value="all">All ({counts.all})</TabsTab>
            <TabsTab value="free">Free ({counts.free})</TabsTab>
            <TabsTab value="pro">Pro ({counts.pro})</TabsTab>
          </TabsList>
        </Tabs>

        {/* Search Input using official registry InputGroup */}
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon align="inline-start">
            <IconSearch className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            size="sm"
          />
          {searchQuery && (
            <InputGroupAddon align="inline-end">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <IconX className="size-3.5" />
              </button>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.name} project={project} priority={index < 3} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center px-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-3">
            <IconFolderHeart className="size-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">No templates found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No results matching "{searchQuery}". Try resetting filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setActiveTab('all')
            }}
            className="mt-4 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}
