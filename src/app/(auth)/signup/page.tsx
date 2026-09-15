'use client'

import Link from 'next/link'
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react'

import { Button } from '@/registry/primitives/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/registry/primitives/card'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@/registry/primitives/field'
import { Input } from '@/registry/primitives/input'

export default function SignupPage() {
  return (
    <main className="relative grid min-h-[calc(100svh-4rem)] place-items-center overflow-hidden bg-muted/25 px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,oklch(0.54_0.25_293/.14),transparent_40%)]" />
      <div className="relative w-full max-w-sm">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Save presets, share systems and manage your component workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => event.preventDefault()} className="grid gap-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="signup-name">Full name</FieldLabel>
                  <Input id="signup-name" autoComplete="name" placeholder="Ada Lovelace" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="signup-email">Email address</FieldLabel>
                  <Input id="signup-email" type="email" autoComplete="email" placeholder="name@example.com" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                </Field>
              </FieldGroup>
              <Button type="submit" className="w-full">
                Create account
              </Button>
              <FieldSeparator className="text-xs">Or continue with</FieldSeparator>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline">
                  <IconBrandGoogle aria-hidden="true" className="size-4" /> Google
                </Button>
                <Button variant="outline">
                  <IconBrandGithub aria-hidden="true" className="size-4" /> GitHub
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-xs text-muted-foreground">
            By continuing, you agree to the{' '}
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            .
          </CardFooter>
        </Card>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
