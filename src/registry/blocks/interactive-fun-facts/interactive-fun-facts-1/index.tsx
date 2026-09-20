'use client'

import { useState } from 'react'
import { cn } from '@/registry/lib/utils'
import { toastManager } from '@/registry/primitives/toast'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { questionsLocale, type Question, type GameItem } from './data'
import { GuessButton, QuestionCard } from './question-card'
import { AllFactsModal, CustomAlert } from './modals'

export { GuessButton, QuestionCard, AllFactsModal, CustomAlert, questionsLocale, type Question, type GameItem }

export function SectionHeader({
  title,
  description,
  link,
  badge,
  layoutStart,
  isPage,
}: {
  title?: string
  description?: string
  link?: string
  badge?: string
  layoutStart?: boolean
  isPage?: boolean
}) {
  return (
    <div
      className={cn(
        'max-w-2xl flex flex-col items-start justify-start gap-4 mb-12',
        !layoutStart && ' mx-auto items-center justify-center text-center',
      )}
    >
      {badge && <Badge size="md">{badge}</Badge>}

      {title && (
        <h2 className={cn(layoutStart ? 'h2 md:h3 font-normals' : 'capitalize', isPage && 'font-normal')}>{title}</h2>
      )}

      {description && (
        <p
          className={cn('text-xl md:text-2xl text-muted-foreground whitespace-pre-line', !layoutStart && 'font-medium')}
        >
          {description}
        </p>
      )}
    </div>
  )
}

export function SectionLayout({
  id,
  title,
  description,
  className,
  contentClassName,
  link,
  badge,
  children,
  isFlex,
  layoutStart,
  isPage,
}: {
  id?: string
  title?: string
  description?: string
  className?: string
  contentClassName?: string
  link?: string
  badge?: string
  children: React.ReactNode
  isFlex?: boolean
  layoutStart?: boolean
  isPage?: boolean
}) {
  return (
    <section className={cn('relative w-full py-14 md:py-26 px-2 md:px-8', className)} id={id}>
      {(title || badge) && (
        <SectionHeader
          title={title}
          description={description}
          link={link}
          badge={badge}
          layoutStart={layoutStart}
          isPage={isPage}
        />
      )}
      <div
        className={cn(
          'flex flex-col max-w-5xl mx-auto items-center justify-center justify-items-center self-center place-self-center w-full gap-6',
          !isFlex && 'md:grid grid-cols-1 md:grid-cols-2 md:max-w-[90%] place-items-center place-self-center',
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
}

// Interactive Fun Facts Component
export function InteractiveFunFacts() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [guessedFacts, setGuessedFacts] = useState<{ [key: number]: boolean }>({})
  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState<{
    isCorrect: boolean
    question: Question | null
  }>({ isCorrect: false, question: null })
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(true)
  const [showAllFacts, setShowAllFacts] = useState(false)

  // Derive calculations based on guessedFacts
  const answeredQuestionsCount = Object.keys(guessedFacts).length
  const allQuestionsAnswered = answeredQuestionsCount === questionsLocale.length

  // Verify if there is a false in the guessed answers
  const hasGuessedFalse = Object.values(guessedFacts).includes(false)

  const handleEmojiClick = (isTrue: boolean) => {
    const currentQuestion = questionsLocale[currentQuestionIndex]
    if (!currentQuestion || guessedFacts[currentQuestion.id] !== undefined) {
      return
    }

    const isCorrect = currentQuestion.isTrue === isTrue

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    setGuessedFacts((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }))
    setAlertData({ isCorrect, question: currentQuestion })
    setShowAlert(true)
  }

  const closeAlert = () => {
    setShowAlert(false)
    setAlertData({ isCorrect: false, question: null })

    // Pass to the next question after closing the alert
    if (currentQuestionIndex < questionsLocale.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
      }, 300)
    }
  }

  const resetGame = () => {
    setCurrentQuestionIndex(0)
    setGuessedFacts({})
    setGameStarted(true)
    setScore(0)
    toastManager.add({
      type: 'success',
      title: 'Game Reset!',
      description: 'Ready for another round of facts! 🚀',
    })
  }

  const canAnswer = gameStarted && !showAllFacts && !allQuestionsAnswered
  const badge = gameStarted || showAllFacts ? `Score: ${score}/${questionsLocale.length}` : 'Fun Facts'

  return (
    <SectionLayout
      isFlex
      badge={badge}
      title="Interactive Fun Facts"
      description="Can you spot the difference between real milestones and hilarious myths?"
    >
      {/* Main Game Zone */}
      <div className="content-center flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between w-full">
        <div className="flex flex-row gap-6 sm:gap-0 justify-center w-full sm:w-auto order-2 sm:order-1">
          <GuessButton isFalse onClick={() => handleEmojiClick(false)} canAnswer={canAnswer} />
          <div className="block sm:hidden">
            <GuessButton onClick={() => handleEmojiClick(true)} canAnswer={canAnswer} />
          </div>
        </div>

        {/* Cards Zone */}
        <div className="grid grid-cols-1 grid-rows-1 place-items-center w-full max-w-xl order-1 sm:order-2 py-8 md:py-14">
          {questionsLocale.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questionsLocale.length}
            />
          ))}
        </div>

        <div className="hidden sm:block order-3">
          <GuessButton onClick={() => handleEmojiClick(true)} canAnswer={canAnswer} />
        </div>
      </div>

      {showAllFacts && (
        <AllFactsModal
          isOpen={showAllFacts}
          onClose={() => setShowAllFacts(false)}
          questions={questionsLocale}
          guessedFacts={guessedFacts}
        />
      )}

      <div className="relative">
        {/* Responsive progression indicators */}
        <div className="flex gap-2 sm:gap-3 z-10">
          {questionsLocale.map((question, index) => {
            const isGuessed = guessedFacts[question.id] !== undefined
            const isCorrect = isGuessed && guessedFacts[question.id]

            return (
              <div
                key={index}
                className={cn(
                  'size-3 sm:size-4 rounded-full border-2 flex items-center justify-center',
                  !allQuestionsAnswered && 'hover:scale-110 transition-transform duration-300 ease-in-out',
                  isGuessed
                    ? isCorrect
                      ? 'bg-green-500 border-green-500'
                      : 'bg-red-500 border-red-500'
                    : index === currentQuestionIndex
                      ? 'bg-[#2a2a2a] border-[#2a2a2a]'
                      : 'bg-muted border-border',
                )}
              >
                {isGuessed && <span className="text-white text-[6px] sm:text-[8px]">{isCorrect ? '✓' : '✗'}</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        {/* Show all facts button */}
        <Button
          onClick={() => {
            setShowAllFacts(true)
          }}
          size="lg"
          className="cursor-pointer"
        >
          {allQuestionsAnswered
            ? hasGuessedFalse
              ? 'See Answers & Context 📜'
              : 'View Perfect Summary 🎉'
            : showAllFacts
              ? 'Retry 🚀'
              : 'Explore All Facts 📜'}
        </Button>

        {allQuestionsAnswered && (
          <div className="text-center">
            <Button onClick={resetGame} variant="secondary" size="lg" className="cursor-pointer">
              Play Again 🚀
            </Button>
          </div>
        )}
      </div>

      {/* Personalized alert */}
      <CustomAlert
        isVisible={showAlert}
        isCorrect={alertData.isCorrect}
        question={alertData.question}
        onClose={closeAlert}
      />
    </SectionLayout>
  )
}

export default function Particle() {
  return <InteractiveFunFacts />
}
