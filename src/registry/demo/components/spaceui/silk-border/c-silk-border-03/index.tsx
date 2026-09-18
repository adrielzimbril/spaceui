'use client'

import { SilkBorder } from '@/registry/components/spaceui/silk-border'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/registry/primitives/card'

export default function Demo() {
  return (
    <SilkBorder preset="ember" className="w-full max-w-sm squircle rounded-xl p-0.75">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Space UI Pro Tier</CardTitle>
          <CardDescription>Full access to all shaders, components, and blocks.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Get instant access to production-grade WebGPU canvas shaders and fluid squircle primitives.
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">All future updates included</span>
          <Button variant="primary" size="sm">
            Upgrade Now
          </Button>
        </CardFooter>
      </Card>
    </SilkBorder>
  )
}
