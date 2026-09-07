'use client'

import { useState } from 'react'
import { PhoneInput } from '@/registry/components/spaceui/phone-input'

export default function Demo() {
  const [value, setValue] = useState('+12125551234')
  return (
    <PhoneInput variant="lg" placeholder="Enter phone number" defaultCountry="US" value={value} onChange={setValue} />
  )
}
