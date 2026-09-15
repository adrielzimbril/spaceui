'use client'

import React, { useState, useRef, useMemo, useEffect, type ReactNode } from 'react'
import { useMotionValue } from 'motion/react'
import { cn } from '@/registry/lib/utils'
import { Card, CardContent } from '@/registry/primitives/card'
import { CommunityWallCard, type CommunityMessage } from './community-wall-card'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { IconCurrentLocationFilled } from '@tabler/icons-react'
import { ProximityGrid } from '@/registry/blocks/interactive-grid-hero/interactive-grid-hero-1/proximity-grid'

interface Position {
  x: number
  y: number
}

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

interface InfiniteCanvasProps {
  messages: CommunityMessage[]
  children?: ReactNode
  className?: string
  avatarSource?: 'user' | 'spaceui' | 'auto'
}

// Card dimensions for collision detection
const CARD_WIDTH = 260
const CARD_HEIGHT = 300
const CARD_PADDING = 40 // Minimum space between cards

// Pseudo-random number generator with seed
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0 // Convert to 32-bit integer
  }
  const x = Math.sin(hash++) * 10000
  return x - Math.floor(x)
}

// Check if two bounding boxes overlap
function checkCollision(box1: BoundingBox, box2: BoundingBox): boolean {
  return !(
    box1.x + box1.width < box2.x ||
    box1.x > box2.x + box2.width ||
    box1.y + box1.height < box2.y ||
    box1.y > box2.y + box2.height
  )
}

// Generate consistent random position for a message using radial distribution
function generatePosition(
  messageId: string,
  totalMessages: number,
  currentIndex: number,
  existingPositions: Position[],
): Position {
  const maxAttempts = 100
  const baseRadius = 250
  const cardsPerLayer = 8
  const layerSpacing = 380
  const layerRadius = Math.floor(currentIndex / cardsPerLayer) * layerSpacing

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const angleSeed = messageId + '_angle_' + attempt
    const radiusSeed = messageId + '_radius_' + attempt

    const angle = seededRandom(angleSeed) * Math.PI * 2
    const radiusVariation = seededRandom(radiusSeed) * 200
    const radius = baseRadius + radiusVariation + layerRadius

    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    const newBox: BoundingBox = {
      x: x - CARD_WIDTH / 2,
      y: y - CARD_HEIGHT / 2,
      width: CARD_WIDTH + CARD_PADDING,
      height: CARD_HEIGHT + CARD_PADDING,
    }

    let hasCollision = false
    for (const existingPos of existingPositions) {
      const existingBox: BoundingBox = {
        x: existingPos.x - CARD_WIDTH / 2,
        y: existingPos.y - CARD_HEIGHT / 2,
        width: CARD_WIDTH + CARD_PADDING,
        height: CARD_HEIGHT + CARD_PADDING,
      }

      if (checkCollision(newBox, existingBox)) {
        hasCollision = true
        break
      }
    }

    if (!hasCollision) {
      return { x: Math.round(x), y: Math.round(y) }
    }
  }

  const fallbackAngle = seededRandom(messageId + '_fallback') * Math.PI * 2
  const fallbackRadius = baseRadius + layerRadius + layerSpacing
  const x = Math.cos(fallbackAngle) * fallbackRadius
  const y = Math.sin(fallbackAngle) * fallbackRadius

  return { x: Math.round(x), y: Math.round(y) }
}

export function InfiniteCanvas({ messages, children, className, avatarSource }: InfiniteCanvasProps) {
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const offsetRef = useRef<Position>({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const canvasAreaRef = useRef<HTMLDivElement>(null)

  const pointerX = useMotionValue(-1000)
  const pointerY = useMotionValue(-1000)
  const pointerActive = useMotionValue(0)

  offsetRef.current = offset

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // Memoized message positions with collision detection
  const messagePositions = useMemo(() => {
    const positions: Position[] = []
    return messages.map((message, index) => {
      let position: Position

      if (index === messages.length - 1) {
        position = { x: 0, y: 0 }
      } else {
        position = generatePosition(message.id, messages.length, index, positions)
      }

      positions.push(position)
      return {
        ...message,
        position,
      }
    })
  }, [messages])

  // Mouse drag with global window listeners to never lose drag on leave or over cards
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return

    const startX = e.clientX
    const startY = e.clientY
    const startOffsetX = offsetRef.current.x
    const startOffsetY = offsetRef.current.y

    setIsDragging(true)

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setOffset({
          x: Math.round(startOffsetX + dx),
          y: Math.round(startOffsetY + dy),
        })
        rafRef.current = null
      })

      // Continuous proximity tracking even during drag
      const rect = canvasAreaRef.current?.getBoundingClientRect()
      if (rect) {
        pointerX.set(moveEvent.clientX - rect.left)
        pointerY.set(moveEvent.clientY - rect.top)
        pointerActive.set(1)
      }
    }

    const onMouseUp = (upEvent: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      setIsDragging(false)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)

      const rect = canvasAreaRef.current?.getBoundingClientRect()
      if (rect) {
        const isInside =
          upEvent.clientX >= rect.left &&
          upEvent.clientX <= rect.right &&
          upEvent.clientY >= rect.top &&
          upEvent.clientY <= rect.bottom
        if (!isInside) {
          pointerActive.set(0)
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Touch drag with global listeners
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY
    const startOffsetX = offsetRef.current.x
    const startOffsetY = offsetRef.current.y

    setIsDragging(true)

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return
      const t = moveEvent.touches[0]
      const dx = t.clientX - startX
      const dy = t.clientY - startY

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setOffset({
          x: Math.round(startOffsetX + dx),
          y: Math.round(startOffsetY + dy),
        })
        rafRef.current = null
      })

      const rect = canvasAreaRef.current?.getBoundingClientRect()
      if (rect) {
        pointerX.set(t.clientX - rect.left)
        pointerY.set(t.clientY - rect.top)
        pointerActive.set(1)
      }
    }

    const onTouchEnd = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      setIsDragging(false)
      pointerActive.set(0)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }

    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
  }

  const handleRecenter = () => {
    setIsTransitioning(true)
    setOffset({ x: 0, y: 0 })
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  const hasMoved = offset.x !== 0 || offset.y !== 0

  return (
    <div className={cn('relative w-full h-full min-h-125 select-none touch-none', className)}>
      <Card className="size-full bg-muted rounded-3xl border-2 border-muted flex-1 overflow-hidden">
        <CardContent className="size-full p-0">
          <ProximityGrid
            cellSize={56}
            gap={4}
            radius="rounded"
            proximity={4}
            inset={6}
            pointerX={pointerX}
            pointerY={pointerY}
            pointerActive={pointerActive}
            className="absolute inset-0 size-full min-h-0 bg-background overflow-hidden select-none"
          >
            <div
              ref={canvasAreaRef}
              className={cn(
                'absolute inset-0 overflow-hidden select-none touch-none',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
              )}
              onPointerMove={(e) => {
                const rect = canvasAreaRef.current?.getBoundingClientRect()
                if (rect) {
                  pointerX.set(e.clientX - rect.left)
                  pointerY.set(e.clientY - rect.top)
                  pointerActive.set(1)
                }
              }}
              onPointerLeave={() => {
                if (!isDragging) {
                  pointerActive.set(0)
                }
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <div
                className="absolute inset-0 transform-gpu will-change-transform"
                style={{
                  transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
                  transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                }}
              >
                {messagePositions.map((message) => (
                  <div
                    key={message.id}
                    className="absolute pointer-events-none select-none"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${message.position.x}px), calc(-50% + ${message.position.y}px))`,
                    }}
                  >
                    <CommunityWallCard
                      message={message.message}
                      patternIndex={message.patternIndex ?? message.pattern_index ?? 0}
                      author={message.creator_name || message.author}
                      profilePicture={message.creator_avatar_url || message.profilePicture}
                      rotation={message.rotation}
                      avatarSource={avatarSource}
                      className="h-75 w-63 select-none pointer-events-none"
                    />
                  </div>
                ))}
              </div>

              <Button
                variant="default"
                size="icon-lg"
                onClick={handleRecenter}
                className={cn(
                  'absolute right-4 top-4 z-10 bg-[#8e8eff]! text-white border-0 transition-opacity cursor-pointer',
                  hasMoved ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                )}
                aria-label="Recenter canvas"
                title="Recenter canvas"
                whileTap
                square
              >
                <IconCurrentLocationFilled className="size-5" />
              </Button>
            </div>
          </ProximityGrid>

          {children && children}
        </CardContent>
      </Card>
    </div>
  )
}
