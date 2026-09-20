'use client'

import { useEffect } from 'react'
import { cn } from '@/registry/lib/utils'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import {
  Dialog,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogPanel,
} from '@/registry/primitives/dialog'
import type { Question } from './data'
import { IconX } from '@tabler/icons-react'

export function CustomAlert({
  isVisible,
  isCorrect,
  question,
  onClose,
}: {
  isVisible: boolean
  isCorrect: boolean
  question: Question | null
  onClose: () => void
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="max-w-sm px-4 pt-2 flex flex-col" showCloseButton={false}>
        <DialogPanel className="p-4 flex flex-col gap-4 items-center text-center">
          <Badge
            variant="secondary"
            square
            squircle={false}
            className="bg-background p-0! text-[2.625rem]! rounded-2xl size-auto!"
          >
            {isCorrect ? '🎉' : '😅'}
          </Badge>

          <div className="flex flex-col gap-1.5 items-center">
            <h4
              className={cn('text-2xl font-bold tracking-tight', {
                'text-green-600 dark:text-green-400': isCorrect,
                'text-red-600 dark:text-red-400': !isCorrect,
              })}
            >
              {isCorrect ? 'Nice!' : 'Not quite!'}
            </h4>
            <DialogDescription className="text-base text-muted-foreground">
              {isCorrect ? question?.funnyTruthMessage : question?.funnyLieMessage}
            </DialogDescription>
          </div>

          {question?.funFact && (
            <div className="w-full rounded-2xl border-2 border-muted bg-card p-4 text-center">
              <Badge variant={isCorrect ? 'success' : 'warning'} size="sm" className="mb-2">
                Behind the fact 🥸
              </Badge>
              <p className="text-sm text-foreground/90 leading-relaxed">{question.funFact}</p>
            </div>
          )}
        </DialogPanel>

        <DialogFooter className="mt-2 border-t border-muted" variant="bare">
          <Button onClick={onClose} size="lg" className="w-full cursor-pointer">
            {isCorrect ? 'Continue 😍' : 'Retry 😩'}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

export function AllFactsModal({
  isOpen,
  onClose,
  guessedFacts,
  questions,
}: {
  isOpen: boolean
  onClose: () => void
  guessedFacts: { [key: number]: boolean }
  questions: Question[]
}) {
  const totalGuessed = Object.keys(guessedFacts).length
  const totalQuestions = questions.length
  const correctGuesses = questions.filter((fact) => guessedFacts[fact.id] !== undefined && guessedFacts[fact.id]).length

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="max-w-2xl max-h-[85vh] px-4 pt-2 flex flex-col" showCloseButton={false}>
        <DialogHeader className="flex flex-row p-3.5! items-center justify-between border-b border-muted">
          <DialogTitle className="text-base font-normal md:font-medium md:text-xl text-muted-foreground">
            Game Summary & All Facts
          </DialogTitle>
          <Button onClick={onClose} size="icon-sm" className="rounded-lg">
            <IconX className="size-5" />
          </Button>
        </DialogHeader>

        <DialogPanel className="flex flex-col gap-4 px-2 py-4 flex-1 min-h-0">
          {/* Score Section */}
          {totalGuessed > 0 && (
            <div className="rounded-2xl border-2 border-muted bg-card p-4">
              <h5 className="font-bold mb-2">
                🎯 Score: {correctGuesses} / {totalQuestions}
              </h5>
              <p className="text-sm text-muted-foreground">
                {correctGuesses === totalQuestions
                  ? 'Perfect score! You know everything.'
                  : correctGuesses > totalQuestions / 2
                    ? 'Great run! Most facts guessed correctly.'
                    : 'Good attempt! Play again to improve your score.'}
              </p>
            </div>
          )}

          {/* Facts Grid */}
          {questions.map((question) => {
            const userGuessed = guessedFacts[question.id] !== undefined
            const userGuessedCorrect = userGuessed && guessedFacts[question.id]

            return (
              <div key={question.id} className="rounded-2xl border-2 border-muted bg-card p-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Badge variant="secondary" square squircle={false} className="text-2xl! p-3! rounded-xl size-auto!">
                    {question.emoji}
                  </Badge>

                  <div className="flex flex-col flex-1 min-w-0">
                    <h5 className="font-bold mb-1">{question.title}</h5>
                    <p className="text-base text-muted-foreground mb-3">{question.description}</p>

                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={question.isTrue ? 'success' : 'error'} size="sm">
                        {question.isTrue ? 'Real Truth' : 'Lie'}
                      </Badge>

                      {userGuessed && (
                        <Badge variant={userGuessedCorrect ? 'info' : 'warning'} size="sm">
                          {userGuessedCorrect ? 'Guessed Correctly' : 'Incorrect Guess'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </DialogPanel>

        <DialogFooter className="mt-4 border-t border-muted" variant="bare">
          <Button onClick={onClose} size="lg" className="w-full cursor-pointer">
            Understood 😊
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
