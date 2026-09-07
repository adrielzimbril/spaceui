'use client'

import { useState } from 'react'
import { PhoneInput } from '@/registry/components/spaceui/phone-input'
import { Field, FieldLabel, FieldDescription } from '@/registry/primitives/field'

export default function Demo() {
  const [value, setValue] = useState('')

  return (
    <Field className="w-full max-w-xs">
      <FieldLabel>Phone number</FieldLabel>
      <PhoneInput value={value} onChange={setValue} placeholder="Enter phone number" defaultCountry="US" />
      <FieldDescription>Include country code if calling from abroad.</FieldDescription>
    </Field>
  )
}
