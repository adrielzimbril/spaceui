'use client'

import { SilkBorder } from '@/registry/components/spaceui/silk-border'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/registry/primitives/card'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Badge } from '@/registry/components/spaceui/badge-squircle'

export default function Demo() {
  return (
    <div className="flex w-full max-w-md items-center justify-center p-6">
      <SilkBorder preset="pro" className="w-full squircle rounded-3xl p-1 shadow-lg">
        <Card className="w-full rounded-2xl bg-background/95 backdrop-blur-md p-6">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">Space UI Pro Tier</CardTitle>
              <Badge size="xs" variant="primary">
                LIFETIME
              </Badge>
            </div>
            <CardDescription>Full access to all shaders, components, and blocks.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-6 text-sm text-muted-foreground">
            Get instant access to production-grade WebGPU canvas shaders and fluid squircle primitives.
          </CardContent>
          <CardFooter className="flex items-center justify-between p-0">
            <span className="text-xs text-muted-foreground">All future updates included</span>
            <Button variant="primary" size="sm">
              Upgrade Now
            </Button>
          </CardFooter>
        </Card>
      </SilkBorder>
    </div>
  )
}
