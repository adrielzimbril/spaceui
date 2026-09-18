'use client'

import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/registry/primitives/card'

export default function Demo() {
  return (
    <LiquidBorder className="w-full max-w-sm rounded-xl p-0.75">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Deploy your new project in one-click.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your new project will be created with the default settings. You can customize it later in the project
            settings.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Deploy</Button>
        </CardFooter>
      </Card>
    </LiquidBorder>
  )
}
