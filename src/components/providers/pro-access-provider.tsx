'use client'

import * as React from 'react'

const ProAccessContext = React.createContext(false)

export function ProAccessProvider({ hasProAccess, children }: { hasProAccess: boolean; children: React.ReactNode }) {
  return <ProAccessContext.Provider value={hasProAccess}>{children}</ProAccessContext.Provider>
}

export function useProAccess(): boolean {
  return React.useContext(ProAccessContext)
}
