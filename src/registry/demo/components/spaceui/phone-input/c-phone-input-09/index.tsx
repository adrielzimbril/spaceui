'use client'

import { useState } from 'react'
import { PhoneInput, isValidPhoneNumber, formatPhoneNumberIntl } from '@/registry/components/spaceui/phone-input'

export default function Demo() {
  const [value, setValue] = useState('')
  const isValid = value ? isValidPhoneNumber(value) : null

  return (
    <div className="w-full max-w-xs space-y-2">
      <PhoneInput
        value={value}
        onChange={setValue}
        placeholder="Enter phone number"
        defaultCountry="US"
        aria-invalid={isValid === false}
      />
      {value && (
        <div className="text-xs">
          {isValid ? (
            <span className="text-emerald-600 dark:text-emerald-400">Valid format: {formatPhoneNumberIntl(value)}</span>
          ) : (
            <span className="text-destructive">Please enter a valid phone number.</span>
          )}
        </div>
      )}
    </div>
  )
}
