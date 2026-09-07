'use client'

import { useState } from 'react'
import { PhoneInput } from '@/registry/components/spaceui/phone-input'

export default function Demo() {
  const [value, setValue] = useState('')
  return <PhoneInput defaultCountry="FR" value={value} onChange={setValue} placeholder="Enter phone number" />
}
