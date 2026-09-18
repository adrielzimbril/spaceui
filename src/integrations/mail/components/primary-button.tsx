import { Button } from '@react-email/components'
import React, { type PropsWithChildren } from 'react'

export interface PrimaryButtonProps extends PropsWithChildren {
  href: string
}

export function PrimaryButton({ href, children }: PrimaryButtonProps) {
  return (
    <Button
      href={href}
      className="bg-[#3b82f6] text-[#ffffff] font-medium text-sm px-6 py-3 rounded-xl no-underline inline-block text-center shadow-sm"
    >
      {children}
    </Button>
  )
}

export default PrimaryButton
