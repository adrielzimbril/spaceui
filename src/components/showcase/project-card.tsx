'use client'

import * as React from 'react'
import Image from 'next/image'
import { IconBrandGithub, IconExternalLink, IconLock } from '@tabler/icons-react'
import { Frame, FrameHeader } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Badge } from '@/registry/primitives/badge'
import { buttonVariants } from '@/registry/primitives/button'
import { cn } from '@/registry/lib/utils'
import type { ProjectItem } from '@/types/project'

interface ProjectCardProps {
  project: ProjectItem
  priority?: boolean
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const formattedNumber = String(project.number).padStart(2, '0')

  return (
    <Frame className="flex flex-col h-full">
      {/* Frame Header with Number and Status Badge (no title here) */}
      <FrameHeader className="flex flex-row items-center justify-between p-2">
        <span className="text-xs text-muted-foreground font-medium">#{formattedNumber}</span>
        {project.isPro ? (
          <Badge variant="default" size="sm">
            PRO
          </Badge>
        ) : (
          <Badge variant="outline" size="sm">
            Free
          </Badge>
        )}
      </FrameHeader>

      {/* Card with inner padding so image does not touch edges */}
      <Card className="flex-1 flex flex-col rounded-lg before:rounded-lg overflow-hidden p-2.5 gap-2.5">
        {/* Rounded image inside card */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-muted">
          <Image
            src={project.preview.image.url}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top rounded-md"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
          />
        </div>

        {/* Card Body: Title moved down here into the body */}
        <CardPanel className="flex flex-1 flex-col justify-between gap-3 p-1">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">{project.title}</h3>
            <p className="text-xs font-medium text-muted-foreground line-clamp-1">{project.headline}</p>
            <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">{project.description}</p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'default', size: 'xs' }), 'flex-1 gap-1 text-xs')}
            >
              <IconExternalLink className="size-3.5" />
              <span>Preview</span>
            </a>

            {!project.isPro ? (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'gap-1 text-xs shrink-0')}
              >
                <IconBrandGithub className="size-3.5" />
                <span>GitHub</span>
              </a>
            ) : (
              <div
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'xs' }),
                  'gap-1 text-xs text-muted-foreground border border-dashed border-border cursor-default shrink-0',
                )}
                title="Pro Template — Private repository"
              >
                <IconLock className="size-3.5" />
                <span>Pro Only</span>
              </div>
            )}
          </div>
        </CardPanel>
      </Card>
    </Frame>
  )
}
