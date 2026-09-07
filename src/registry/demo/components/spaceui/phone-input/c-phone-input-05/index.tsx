'use client'

import { useState } from 'react'
import { PhoneInput } from '@/registry/components/spaceui/phone-input'

export default function Demo() {
  const [value, setValue] = useState('+12125551234')
  return <PhoneInput value={value} onChange={setValue} placeholder="Enter phone number" />
}
