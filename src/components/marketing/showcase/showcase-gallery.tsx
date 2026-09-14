'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IconSearch, IconX, IconFolderHeart, IconLoader2, IconArrowDown } from '@tabler/icons-react'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/primitives/input-group'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { useLoadMore } from '@/registry/hooks/form/use-load-more'
import { useMediaQuery } from '@/registry/hooks/browser/use-media-query'
import { useInView } from '@/registry/hooks/animation/use-in-view'
import { toastManager } from '@/registry/primitives/toast'
import type { ProjectItem } from '@/types/project'
import { ProjectCard } from '@/components/marketing/showcase/project-card'

interface ShowcaseGalleryProps {
  projects: ProjectItem[]
}

type FilterTab = 'all' | 'free' | 'pro'

export function ShowcaseGallery({ projects }: ShowcaseGalleryProps) {
  const [activeTab, setActiveTab] = React.useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isTabSwitching, setIsTabSwitching] = React.useState(false)
  const [autoLoadBatches, setAutoLoadBatches] = React.useState(0)

  // 5 items per batch on mobile, 8 items on desktop/tablet
  const isMobile = useMediaQuery('(max-width: 640px)', false)
  const pageSize = isMobile ? 5 : 8

  // Browsing depth: persist limit across tabs so switching tabs doesn't reset progress
  const [loadedLimit, setLoadedLimit] = React.useState(pageSize)

  React.useEffect(() => {
    setLoadedLimit((prev) => Math.max(prev, pageSize))
  }, [pageSize])

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
      if (activeTab === 'free' && project.isPro) return false
      if (activeTab === 'pro' && !project.isPro) return false

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

  // Official Space UI useLoadMore hook
  const {
    data: visibleProjects,
    loading,
    hasMore,
    loadMore,
  } = useLoadMore({
    dataSource: filteredProjects,
    initialCount: loadedLimit,
    incrementCount: pageSize,
  })

  // Max consecutive auto-loads before pausing for explicit user click
  const MAX_AUTO_BATCHES = 2

  const handleTriggerLoadMore = React.useCallback(
    async (isManualClick = false) => {
      if (loading || !hasMore) return

      try {
        await loadMore()
        setLoadedLimit((prev) => prev + pageSize)
        if (isManualClick) {
          // Re-enable auto-load batches on explicit user click
          setAutoLoadBatches(0)
        }
      } catch (err) {
        toastManager.add({
          type: 'error',
          title: 'Loading failed',
          description: 'Unable to load more templates. Please check your connection and try again.',
        })
      }
    },
    [loading, hasMore, loadMore, pageSize],
  )

  // In-view auto load sentinel (triggers up to MAX_AUTO_BATCHES automatically before pausing for user click)
  const [sentinelRef, sentinelInView] = useInView({
    rootMargin: '250px 0px',
    triggerOnce: false,
  })

  React.useEffect(() => {
    if (sentinelInView && hasMore && !loading && autoLoadBatches < MAX_AUTO_BATCHES) {
      setAutoLoadBatches((count) => count + 1)
      handleTriggerLoadMore(false)
    }
  }, [sentinelInView, hasMore, loading, autoLoadBatches, handleTriggerLoadMore])

  // Handle tab switch with AdaptiveDensityGrid fluid morph trigger
  const handleTabChange = (val: FilterTab) => {
    if (val === activeTab) return
    setActiveTab(val)
    setIsTabSwitching(true)
  }

  // Reset tab switching rearrangement after spring settling
  React.useEffect(() => {
    if (!isTabSwitching) return
    const timer = window.setTimeout(() => {
      setIsTabSwitching(false)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [isTabSwitching])

  // Stagger wave delay calculation (2D diagonal wave identical to AdaptiveDensityGrid)
  const getStaggerDelay = (index: number) => {
    const cols = isMobile ? 1 : 2
    const row = Math.floor(index / cols)
    const col = index % cols
    return Math.min(row * 0.022 + col * 0.014, 0.24)
  }

  const springTransition = {
    type: 'spring',
    stiffness: 280,
    damping: 26,
    mass: 0.75,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={(val) => handleTabChange(val as FilterTab)}>
          <TabsList>
            <TabsTab value="all">All ({counts.all})</TabsTab>
            <TabsTab value="free">Free ({counts.free})</TabsTab>
            <TabsTab value="pro">Pro ({counts.pro})</TabsTab>
          </TabsList>
        </Tabs>

        <div className="w-full sm:w-60">
          <InputGroup>
            <InputGroupAddon>
              <IconSearch className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
            {searchQuery && (
              <InputGroupAddon align="inline-end">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSearchQuery('')}
                  className="rounded-full size-5 p-0 hover:bg-muted"
                >
                  <IconX className="size-3" />
                </Button>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <IconFolderHeart className="size-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">No templates found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            No projects match your current filters. Try searching for something else or reset the filter.
          </p>
          {(activeTab !== 'all' || searchQuery) && (
            <Button
              size="xs"
              className="mt-4"
              onClick={() => {
                setActiveTab('all')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleProjects.map((project, idx) => (
                <motion.div
                  key={project.id ?? project.name ?? idx}
                  layout
                  initial={{ opacity: 0, scale: 0.94, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 8, transition: { duration: 0.2 } }}
                  transition={{
                    layout: {
                      ...springTransition,
                      delay: getStaggerDelay(idx),
                    },
                    opacity: { duration: 0.24 },
                    scale: { duration: 0.28 },
                  }}
                  className="h-full rounded-2xl"
                >
                  <motion.div
                    animate={{
                      scale: isTabSwitching ? 0.982 : 1,
                      y: isTabSwitching ? -1 : 0,
                      filter: isTabSwitching ? 'blur(3px)' : 'blur(0px)',
                    }}
                    transition={{
                      duration: 0.28,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="h-full rounded-2xl"
                  >
                    <ProjectCard project={project} priority={idx < 2} />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Sentinel element for in-view auto load */}
          {hasMore && <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />}

          {hasMore && (
            <div className="flex justify-center pt-6 pb-4">
              <Button
                size="default"
                onClick={() => handleTriggerLoadMore(true)}
                disabled={loading}
                pointer
                hover
                className="group relative"
              >
                <MorphIcon activeKey={loading ? 'loading' : 'idle'} variant="rotate-scale" duration={0.25}>
                  {loading ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconArrowDown className="size-4 transition-all duration-200 group-hover:translate-y-0.5" />
                  )}
                </MorphIcon>
                <span>{loading ? 'Loading...' : 'Load more'}</span>
              </Button>
            </div>
          )}

          {!hasMore && filteredProjects.length > pageSize && (
            <p className="text-center text-xs text-muted-foreground pt-6 pb-2">
              All {filteredProjects.length} templates loaded
            </p>
          )}
        </>
      )}
    </div>
  )
}
