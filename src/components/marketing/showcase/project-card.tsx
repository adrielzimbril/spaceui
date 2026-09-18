'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IconBrandGithub, IconArrowUpRight, IconLock } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { ProBadge } from '@/components/shared/pro-badge'
import { useInView } from '@/registry/hooks/animation/use-in-view'
import type { ProjectItem } from '@/types/project'

interface ProjectCardProps {
  project: ProjectItem
  priority?: boolean
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  // In-view memory management: unmount heavy image decodes when scrolled far off-screen
  const [containerRef, inView] = useInView({
    rootMargin: '350px 0px',
    triggerOnce: false,
  })

  const isContentActive = priority || inView

  return (
    <div ref={containerRef} className="h-full [content-visibility:auto] [contain-intrinsic-size:auto_360px]">
      <Frame className="group flex flex-col h-full">
        <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
          <CardPanel className="flex-1 relative flex aspect-16/10 w-full overflow-hidden p-0 rounded-lg bg-muted">
            {isContentActive ? (
              <Image
                src={project.preview.image.url}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                priority={priority}
                loading={priority ? undefined : 'lazy'}
              />
            ) : (
              <div className="absolute inset-0 bg-muted/40 transition-opacity" />
            )}

            <div className="absolute top-2.5 left-2.5 z-10 flex items-center w-[calc(100%-(0.625rem*2))] justify-end gap-1.5">
              {project.isPro ? (
                <ProBadge size="xs" />
              ) : (
                <Badge size="xs" variant="secondary" className="select-none">
                  Free
                </Badge>
              )}
              {project.created_at && Date.now() - new Date(project.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000 && (
                <Badge size="xs" variant="primary" className="select-none">
                  NEW
                </Badge>
              )}
            </div>

            {project.isPro ? (
              <Link
                href="/pricing"
                className="absolute inset-0 z-0 cursor-pointer"
                aria-label={`View pricing for ${project.title}`}
              />
            ) : (
              project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="absolute inset-0 z-0"
                  aria-label={`Preview ${project.title}`}
                />
              )
            )}
          </CardPanel>
        </Card>

        <FrameFooter className="flex flex-row items-center justify-between p-2 gap-2">
          <div className="flex flex-col min-w-0 pr-2">
            <FrameTitle className="truncate text-sm text-muted-foreground font-semibold">{project.title}</FrameTitle>
            <p className="text-xs text-muted-foreground truncate">{project.headline}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 z-10">
            {project.url && (
              <Button
                variant="default"
                size="icon-xs"
                render={<a href={project.url} target="_blank" rel="noreferrer noopener" />}
                data-space-hover
                title="Open live preview"
                className="cursor-pointer"
              >
                <IconArrowUpRight className="size-3.5" />
              </Button>
            )}
            {project.isPro ? (
              <LiquidBorder className="inline-flex squircle rounded-full p-0.75">
                <Button
                  variant="secondary"
                  size="icon-xs"
                  render={<Link href="/pricing" />}
                  data-space-hover
                  title="Upgrade to Pro — View pricing"
                  className="cursor-pointer bg-muted! transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  <IconLock className="size-3.5" />
                </Button>
              </LiquidBorder>
            ) : (
              <>
                {project.repo_url && (
                  <Button
                    variant="default"
                    size="icon-xs"
                    render={<a href={project.repo_url} target="_blank" rel="noreferrer noopener" />}
                    data-space-hover
                    title="GitHub Repository"
                    className="cursor-pointer"
                  >
                    <IconBrandGithub className="size-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </FrameFooter>
      </Frame>
    </div>
  )
}
