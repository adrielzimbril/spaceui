'use client'

import { useState } from 'react'
import { PhoneInput } from '@/registry/components/spaceui/phone-input'

export default function Demo() {
  const [value, setValue] = useState('+31612345678')
  return (
    <PhoneInput variant="sm" placeholder="Enter phone number" defaultCountry="NL" value={value} onChange={setValue} />
  )
}
