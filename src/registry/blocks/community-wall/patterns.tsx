import React, { type ReactElement } from 'react'

export const patternTech: ReactElement = (
  <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
    <div className="absolute top-2 right-2 text-2xl opacity-30">💻</div>
    <div className="absolute top-8 left-4 text-xl opacity-25">🤖</div>
    <div className="absolute bottom-4 right-8 text-3xl opacity-35">⚡</div>
    <div className="absolute bottom-12 left-12 text-lg opacity-20">🧠</div>
    <div className="absolute top-16 right-16 text-xl opacity-25">👨‍💻</div>
    <div className="absolute bottom-20 left-20 text-2xl opacity-30">💾</div>
    <div className="absolute top-24 right-24 text-lg opacity-20">🎯</div>
  </div>
)

export const patternDesign: ReactElement = (
  <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
    <div className="absolute top-3 right-3 text-2xl opacity-30">🎨</div>
    <div className="absolute top-10 left-6 text-xl opacity-25">✨</div>
    <div className="absolute bottom-6 right-10 text-3xl opacity-35">📐</div>
    <div className="absolute bottom-14 left-14 text-lg opacity-20">🖌️</div>
    <div className="absolute top-20 right-20 text-xl opacity-25">🪄</div>
    <div className="absolute bottom-24 left-24 text-2xl opacity-30">💎</div>
    <div className="absolute top-28 right-28 text-lg opacity-20">🌈</div>
  </div>
)

export const patternFood: ReactElement = (
  <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
    <div className="absolute top-3 right-3 text-2xl opacity-30">🍕</div>
    <div className="absolute top-10 left-6 text-xl opacity-25">🍣</div>
    <div className="absolute bottom-6 right-10 text-3xl opacity-35">☕</div>
    <div className="absolute bottom-14 left-14 text-lg opacity-20">🥐</div>
    <div className="absolute top-20 right-20 text-xl opacity-25">🥑</div>
    <div className="absolute bottom-24 left-24 text-2xl opacity-30">🍩</div>
    <div className="absolute top-28 right-28 text-lg opacity-20">🍓</div>
  </div>
)

export const patternAnimals: ReactElement = (
  <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
    <div className="absolute top-3 right-3 text-2xl opacity-30">🦊</div>
    <div className="absolute top-10 left-6 text-xl opacity-25">🐱</div>
    <div className="absolute bottom-6 right-10 text-3xl opacity-35">🐶</div>
    <div className="absolute bottom-14 left-14 text-lg opacity-20">🐰</div>
    <div className="absolute top-20 right-20 text-xl opacity-25">🐼</div>
    <div className="absolute bottom-24 left-24 text-2xl opacity-30">🦁</div>
    <div className="absolute top-28 right-28 text-lg opacity-20">🦄</div>
  </div>
)

export const patternSpace: ReactElement = (
  <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
    <div className="absolute top-2 right-2 text-2xl opacity-30">🚀</div>
    <div className="absolute top-8 left-4 text-xl opacity-25">🛸</div>
    <div className="absolute bottom-4 right-8 text-3xl opacity-35">🪐</div>
    <div className="absolute bottom-12 left-12 text-lg opacity-20">🌌</div>
    <div className="absolute top-16 right-16 text-xl opacity-25">⭐</div>
    <div className="absolute bottom-20 left-20 text-2xl opacity-30">🌍</div>
    <div className="absolute top-24 right-24 text-lg opacity-20">☄️</div>
  </div>
)

export const patternLab: ReactElement = (
  <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
    <div className="absolute top-3 right-3 text-2xl opacity-30">🧪</div>
    <div className="absolute top-10 left-6 text-xl opacity-25">🔬</div>
    <div className="absolute bottom-6 right-10 text-3xl opacity-35">🧬</div>
    <div className="absolute bottom-14 left-14 text-lg opacity-20">⚛️</div>
    <div className="absolute top-20 right-20 text-xl opacity-25">💡</div>
    <div className="absolute bottom-24 left-24 text-2xl opacity-30">⚗️</div>
    <div className="absolute top-28 right-28 text-lg opacity-20">🧲</div>
  </div>
)

export const patternParty: ReactElement = (
  <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
    <div className="absolute top-2 right-2 text-2xl opacity-30">🎉</div>
    <div className="absolute top-8 left-4 text-xl opacity-25">🎊</div>
    <div className="absolute bottom-4 right-8 text-3xl opacity-35">🎈</div>
    <div className="absolute bottom-12 left-12 text-lg opacity-20">🎁</div>
    <div className="absolute top-16 right-16 text-xl opacity-25">🎀</div>
    <div className="absolute bottom-20 left-20 text-2xl opacity-30">🎆</div>
    <div className="absolute top-24 right-24 text-lg opacity-20">🎇</div>
  </div>
)

export const patternNature: ReactElement = (
  <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
    <div className="absolute top-3 right-3 text-2xl opacity-30">🌸</div>
    <div className="absolute top-10 left-6 text-xl opacity-25">🌿</div>
    <div className="absolute bottom-6 right-10 text-3xl opacity-35">🍀</div>
    <div className="absolute bottom-14 left-14 text-lg opacity-20">🌻</div>
    <div className="absolute top-20 right-20 text-xl opacity-25">🦋</div>
    <div className="absolute bottom-24 left-24 text-2xl opacity-30">🍄</div>
    <div className="absolute top-28 right-28 text-lg opacity-20">🌴</div>
  </div>
)

export type Pattern = {
  name: string
  content: ReactElement
}

export const patterns: Pattern[] = [
  { name: 'Tech', content: patternTech },
  { name: 'Design', content: patternDesign },
  { name: 'Space', content: patternSpace },
  { name: 'Lab', content: patternLab },
  { name: 'Animals', content: patternAnimals },
  { name: 'Food', content: patternFood },
  { name: 'Party', content: patternParty },
  { name: 'Nature', content: patternNature },
]

export const WALL_PATTERNS = patterns
