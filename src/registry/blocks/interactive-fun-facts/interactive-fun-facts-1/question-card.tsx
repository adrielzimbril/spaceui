'use client'

import { cn } from '@/registry/lib/utils'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import type { Question } from './data'

export function GuessButton({
  isFalse,
  onClick,
  canAnswer,
}: {
  isFalse?: boolean
  onClick: () => void
  canAnswer: boolean
}) {
  return (
    <div
      className={cn(
        'relative bg-background border-4 border-border content-stretch flex items-center justify-start p-4 md:p-6 rounded-full shrink-0 cursor-pointer transition-all duration-400',
        canAnswer
          ? isFalse
            ? 'hover:bg-red-100 hover:border-red-500 dark:hover:border-red-400'
            : 'hover:bg-green-100 hover:border-green-500 dark:hover:border-green-400'
          : 'pointer-events-none cursor-default',
      )}
      onClick={onClick}
    >
      <div className="relative shrink-0 size-11 md:size-20">
        <span
          className={cn(
            'size-full flex items-center justify-center text-5xl md:text-7xl object-cover pointer-events-none',
            !canAnswer && 'opacity-50',
          )}
        >
          {isFalse ? '🤥' : '😀'}
        </span>
        {canAnswer && (
          <span
            className={cn(
              'absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap shadow-xs',
              isFalse ? 'bg-red-500' : 'bg-green-500',
            )}
          >
            {isFalse ? 'Lie' : 'Truth'}
          </span>
        )}
      </div>
    </div>
  )
}

export function QuestionCard({
  question,
  index,
  currentQuestionIndex,
  totalQuestions,
}: {
  question: Question
  index: number
  currentQuestionIndex: number
  totalQuestions: number
}) {
  const diff = index - currentQuestionIndex

  let scale = 1
  let translateY = 0
  let rotate = 0
  let opacity = 0
  let zIndex = 0
  let pointerEvents: 'auto' | 'none' = 'none'

  if (diff === 0) {
    scale = 1
    translateY = 0
    rotate = 0
    opacity = 1
    zIndex = 30
    pointerEvents = 'auto'
  } else if (diff > 0 && diff <= 3) {
    scale = 1 - diff * 0.04
    translateY = -diff * 12
    rotate = diff === 1 ? -1.5 : diff === 2 ? 1.5 : -0.75
    opacity = 1 - diff * 0.22
    zIndex = 30 - diff
    pointerEvents = 'none'
  } else if (diff === -1) {
    scale = 0.98
    translateY = -36
    rotate = -2.5
    opacity = 0
    zIndex = 35
    pointerEvents = 'none'
  } else {
    scale = diff > 0 ? 0.88 : 0.95
    translateY = diff > 0 ? -36 : -48
    rotate = 0
    opacity = 0
    zIndex = 0
    pointerEvents = 'none'
  }

  return (
    <Card
      className={cn(
        'col-start-1 row-start-1 w-full max-w-xl h-full',
        'bg-muted rounded-3xl md:rounded-5xl overflow-hidden',
        'will-change-transform select-none',
        'transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
      )}
      style={{
        zIndex,
        pointerEvents,
        transformOrigin: 'center center',
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`,
        opacity,
      }}
    >
      <CardPanel
        className={cn(
          'flex relative flex-col min-h-60 h-full items-center justify-center p-4 rounded-xl md:rounded-3xl bg-background overflow-hidden',
        )}
      >
        <div className="flex flex-col items-start gap-4 w-full max-w-[90%] py-12 mx-auto">
          <Badge
            variant="secondary"
            squircle={false}
            className="aspect-square p-4 rounded-full size-auto! [&>svg]:size-12! [&>img]:size-12!"
          >
            <span className="text-4xl">{question.emoji}</span>
          </Badge>
          <h3 className="text-3xl tracking-wide leading-[120%]">{question.title}</h3>

          <p className="text-muted-foreground text-xl leading-[140%]">{question.description}</p>
          <p className="text-zinc-400 text-lg leading-[120%]">{question.subtitle}</p>
        </div>
      </CardPanel>
    </Card>
  )
}
