'use client'

import * as React from 'react'
import { BuildingLoader } from '@/registry/components/orb/loading'

const LOADING_STEPS = [
  {
    state: 'Thinking',
    detail: 'Synthesizing reasoning graph',
    color: 'text-indigo-500',
  },
  {
    state: 'Searching',
    detail: 'Scanning semantic vector index',
    color: 'text-amber-500',
  },
  {
    state: 'Building',
    detail: 'Composing response from context',
    color: 'text-primary',
  },
  {
    state: 'Generating',
    detail: 'Streaming token generation pipeline',
    color: 'text-emerald-500',
  },
  {
    state: 'Connecting',
    detail: 'Establishing agent mesh network',
    color: 'text-cyan-500',
  },
]

export default function Demo() {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_STEPS.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  const current = LOADING_STEPS[index]

  return (
    <div className="flex size-full min-h-[260px] flex-col items-center justify-center p-6">
      <BuildingLoader state={current.state} detail={current.detail} orbClassName={current.color} speed={600} />
    </div>
  )
}
