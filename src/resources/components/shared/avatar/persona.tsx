'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { AvatarEffect, AvatarVariant } from '@usespaceui/avatars'
import { Avatar } from '@usespaceui/avatars/react'

export type PersonaProps = {
  name?: string
  size?: number
  variant?: AvatarVariant | 'all'
  colors?: string[]
  circle?: boolean
  animate?: boolean
  effect?: AvatarEffect
  className?: string
}

const PersonaContext = createContext<(props: PersonaProps) => ReactNode>((props) => <Avatar {...props} />)

export function PersonaProvider({
  children,
  render,
}: {
  children: ReactNode
  render?: (props: PersonaProps) => ReactNode
}) {
  return (
    <PersonaContext.Provider value={render ?? ((props) => <Avatar {...props} />)}>{children}</PersonaContext.Provider>
  )
}

export function Persona(props: PersonaProps) {
  return <>{useContext(PersonaContext)(props)}</>
}
