'use client'

import { cn } from '@/registry/lib/utils'
import { AnimatePresence, motion, useDragControls, useMotionValue, useScroll, useTransform } from 'motion/react'
import React, { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

interface SectionMeta {
  index: number
  title: string
  badge: string
  code: string
  element: HTMLElement
  showCard: boolean
}

export type SectionScrollspyProps = {
  containerRef?: RefObject<HTMLElement | null>
  selector?: string
  portal?: boolean
  className?: string
}

export function SectionScrollspy({
  containerRef,
  selector = '[data-page-section]',
  portal = false,
  className,
}: SectionScrollspyProps) {
  const [sections, setSections] = useState<SectionMeta[]>([])
  const [activeSection, setActiveSection] = useState(0)
  const [showScrollCard, setShowScrollCard] = useState(false)

  useEffect(() => {
    const updateSections = () => {
      const scope = containerRef?.current ?? document
      const elements = Array.from(scope.querySelectorAll(selector)) as HTMLElement[]
      const newSections: SectionMeta[] = []
      let lastValidTitle = ''
      let lastValidBadge = ''

      elements.forEach((element) => {
        const titleEl = element.querySelector('h2')
        let title = lastValidTitle
        let badge = lastValidBadge

        if (!titleEl) return

        if (titleEl) {
          const clone = titleEl.cloneNode(true) as HTMLElement
          const badgeEl = clone.querySelector('[data-slot="badge"]')
          if (badgeEl) {
            badge = badgeEl.textContent?.trim() || ''
            badgeEl.remove()
          } else {
            badge = ''
          }
          title = clone.textContent?.trim() || ''

          lastValidTitle = title
          lastValidBadge = badge
        }

        newSections.push({
          index: newSections.length,
          title,
          badge,
          code: '',
          element,
          showCard: true,
        })
      })

      setSections(newSections)
    }

    updateSections()

    const observer = new MutationObserver(updateSections)
    observer.observe(containerRef?.current ?? document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [containerRef, selector])

  useEffect(() => {
    if (sections.length === 0) return
    const root = containerRef?.current ?? null
    const getScrollY = () => (root ? root.scrollTop : window.scrollY)

    const handleScroll = () => {
      if (getScrollY() < 50) {
        setActiveSection(0)
        setShowScrollCard(sections[0]?.showCard || false)
      }
    }
    const scrollTarget: HTMLElement | Window = root ?? window
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting)
        if (intersecting.length > 0) {
          const entry = intersecting[0]
          const index = sections.findIndex((s) => s.element === entry.target)
          if (index !== -1 && getScrollY() >= 80) {
            setActiveSection(index)
            setShowScrollCard(sections[index]?.showCard || false)
          }
        }
      },
      {
        threshold: 0,
        root,
        rootMargin: '-35% 0px -80% 0px',
      },
    )

    sections.forEach((s) => observer.observe(s.element))
    return () => {
      observer.disconnect()
      scrollTarget.removeEventListener('scroll', handleScroll)
    }
  }, [sections, containerRef])

  if (sections.length === 0 || typeof document === 'undefined') return null

  const node = (
    <div className={cn(portal ? 'relative z-50 hidden md:block' : 'contents')}>
      <ScrollBar
        sections={sections}
        activeSection={activeSection}
        showScrollCard={showScrollCard}
        containerRef={containerRef}
        portal={portal}
        className={className}
      />
    </div>
  )

  if (portal) return createPortal(node, document.body)
  return node
}

function useContainerSize(): [
  React.RefCallback<HTMLElement>,
  { width: number; height: number; left: number; top: number },
] {
  const [size, setSize] = useState({ width: 0, height: 0, left: 0, top: 0 })
  const ref = useRef<HTMLElement | null>(null)

  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node
    if (node) {
      const rect = node.getBoundingClientRect()
      setSize((prev) => {
        if (
          prev.width === rect.width &&
          prev.height === rect.height &&
          prev.left === rect.left &&
          prev.top === rect.top
        ) {
          return prev
        }
        return { width: rect.width, height: rect.height, left: rect.left, top: rect.top }
      })
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        setSize({ width: rect.width, height: rect.height, left: rect.left, top: rect.top })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return [setRef, size]
}

const ScrollBar = ({
  sections,
  activeSection,
  showScrollCard,
  containerRef,
  portal,
  className,
}: {
  sections: SectionMeta[]
  activeSection: number
  showScrollCard: boolean
  containerRef?: RefObject<HTMLElement | null>
  portal: boolean
  className?: string
}) => {
  const { scrollYProgress } = useScroll(containerRef ? { container: containerRef } : undefined)
  const [trackRef, containerSize] = useContainerSize()
  const scrollX = useTransform(scrollYProgress, [0, 1], [0, containerSize.width - 1.5])
  const [isDragging, setIsDragging] = useState(false)
  const [hoverX, setHoverX] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  const motionX = useMotionValue(0)

  useEffect(() => {
    if (!isDragging) {
      const unsubscribe = scrollX.on('change', (v: number) => motionX.set(v))
      return () => unsubscribe()
    }
  }, [isDragging, scrollX, motionX])

  const ticks = useMemo(
    () =>
      [...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.2, filter: 'blur(1px)' }}
          animate={{
            opacity: i % 5 === 0 ? 1 : 0.2,
            filter: 'blur(0px)',
          }}
          transition={{
            duration: 0.2,
            delay: i % 5 === 0 ? (i / 5) * 0.05 : 0,
            ease: 'easeOut',
          }}
          className={cn('h-3.75 w-px bg-foreground')}
        />
      )),
    [],
  )

  const section = sections[activeSection] || sections[0]

  const scrollToProgress = (progress: number) => {
    const root = containerRef?.current
    if (root) {
      root.scrollTo({ top: (root.scrollHeight - root.clientHeight) * progress, behavior: 'instant' as ScrollBehavior })
      return
    }
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: scrollHeight * progress, behavior: 'instant' as ScrollBehavior })
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 overflow-hidden rounded-[1.25rem] border-4 border-muted bg-muted',
        portal
          ? 'fixed right-1/2 bottom-5 hidden translate-x-1/2 md:flex sm:right-5 sm:translate-x-0'
          : 'absolute right-3 bottom-3',
        className,
      )}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeSection}
          initial={{ y: '100%', opacity: 0 }}
          animate={showScrollCard ? { y: '0%', opacity: 1 } : { y: '100%', opacity: 0 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.5, bounce: 0, type: 'spring' }}
        >
          <ScrollCard section={section} />
        </motion.div>
      </AnimatePresence>

      <motion.div className="cursor-grab rounded-xl bg-white px-5 will-change-transform dark:bg-zinc-900">
        <div ref={trackRef}>
          <div
            className="relative flex h-10 items-center justify-center gap-1.5 overflow-hidden rounded-xl"
            ref={barRef}
            onClick={(e) => {
              if (!barRef.current || isDragging) return
              const progress = Math.max(0, Math.min(1, (e.clientX - containerSize.left) / containerSize.width))
              scrollToProgress(progress)
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={(e) => {
              if (isDragging) {
                setHoverX(-20)
                return
              }
              if (barRef.current) {
                setHoverX(Math.max(0, Math.min(e.clientX - containerSize.left, containerSize.width - 6)))
              }
            }}
          >
            {ticks}

            <AnimatePresence mode="popLayout">
              {isHovering && !isDragging && (
                <motion.div
                  className="absolute h-6 w-1.5 cursor-grab rounded-full bg-blue-300 opacity-40"
                  style={{ left: hoverX, willChange: 'transform' }}
                  transition={{ type: 'tween', duration: 0 }}
                />
              )}
            </AnimatePresence>

            <motion.div
              layout
              drag="x"
              dragControls={dragControls}
              dragConstraints={barRef}
              dragElastic={0}
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDrag={(_, info) => {
                if (!barRef.current) return
                const width = containerSize.width
                const x = Math.max(0, Math.min(info.point.x - containerSize.left, width))
                const progress = x / width
                motionX.set(x)
                scrollToProgress(progress)
              }}
              onDragEnd={() => setIsDragging(false)}
              className="absolute left-0 h-6 w-1.5 cursor-grab rounded-full bg-blue-300 active:cursor-grabbing"
              style={{ x: motionX }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const ScrollCard = ({ section }: { section: SectionMeta }) => {
  if (!section.title) return null

  return (
    <div className="relative flex w-78.75 max-w-78.75 items-center rounded-xl bg-background p-3">
      <div className="flex-1 overflow-x-auto whitespace-nowrap">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          {section.title}
          {section.badge && (
            <span
              data-slot="badge"
              className="relative inline-flex h-5.5 min-w-5.5 shrink-0 items-center justify-center gap-1 border border-transparent px-[calc(--spacing(1)-1px)] text-xs font-medium whitespace-nowrap text-secondary-foreground outline-none transition-shadow bg-secondary sm:h-4.5 sm:min-w-4.5"
            >
              {section.badge}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
