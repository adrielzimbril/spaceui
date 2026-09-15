'use client'

import React, { useState, useRef, useMemo, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/registry/lib/utils'
import { Card, CardContent } from '@/registry/primitives/card'
import { CommunityWallCard, type CommunityMessage } from './community-wall-card'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { IconCurrentLocation, IconCurrentLocationFilled } from '@tabler/icons-react'

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
// Cards are placed in a true 360-degree bloom from center with collision detection
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
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Memoized message positions with collision detection
  // The last card in array (first chronologically) is centered
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

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    if (isDragging) setIsDragging(false)
  }

  const handleMouseLeave = () => {
    if (isDragging) setIsDragging(false)
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
    <div className={cn('relative w-full h-full min-h-125', className)}>
      <Card className="size-full bg-muted rounded-3xl border border-border flex-1 transition-all duration-300 overflow-hidden">
        <CardContent className="size-full p-0">
          <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden bg-muted"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(currentColor_0.0625rem,transparent_0.125rem)] opacity-10 bg-size-[1rem_1rem]" />

            {/* Canvas container that gets transformed */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
                willChange: isDragging ? 'transform' : 'auto',
                transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
              }}
            >
              {messagePositions.map((message) => (
                <div
                  key={message.id}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${message.position.x}px), calc(-50% + ${message.position.y}px))`,
                    pointerEvents: 'auto',
                  }}
                >
                  <CommunityWallCard
                    message={message.message}
                    patternIndex={message.patternIndex ?? message.pattern_index ?? 0}
                    author={message.creator_name || message.author}
                    profilePicture={message.creator_avatar_url || message.profilePicture}
                    rotation={message.rotation}
                    avatarSource={avatarSource}
                    className="h-75 w-63"
                  />
                </div>
              ))}
            </div>

            {/* Recenter button - floating in top right, fades in when canvas moves */}
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

          {children && children}
        </CardContent>
      </Card>
    </div>
  )
}
