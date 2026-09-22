'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '@/registry/primitives/button'
import { Field, FieldLabel } from '@/registry/primitives/field'
import { Form } from '@/registry/primitives/form'
import { Switch } from '@/registry/primitives/switch'
import { logger } from '@/registry/utils/logger'

export default function Demo() {
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    logger.log(formData.get('marketing'))

    const enabled = formData.get('marketing')
    alert(`Marketing emails: ${enabled}`)
  }

  return (
    <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Field name="marketing">
        <FieldLabel>
          <Switch defaultChecked name="marketing" />
          Enable marketing emails
        </FieldLabel>
      </Field>
      <Button loading={loading} type="submit">
        Submit
      </Button>
    </Form>
  )
}
