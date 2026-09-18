import fs from 'node:fs/promises'
import path from 'node:path'
import type * as React from 'react'
import { ComponentSource } from '@/components/docs/preview/source'
import { InstallCommandBlock } from '@/components/docs/installation/install-command-block'
import { SpaceCodeTabs, TabsList, TabsTab, TabsPanel } from '@/components/docs/code/space-code-tabs'
import { Steps, Step } from 'fumadocs-ui/components/steps'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { ProBadge } from '@/components/shared/pro-badge'
import { isComponentPro } from '@/lib/pro-auth'

export interface ComponentInstallationProps {
  name: string
  className?: string
  isPro?: boolean
}

function getAppRoot(): string {
  if (path.basename(process.cwd()) === 'www') {
    return process.cwd()
  }
  try {
    const candidate = path.join(process.cwd(), 'apps', 'www')
    if (require('node:fs').existsSync(candidate)) {
      return candidate
    }
  } catch {}
  return process.cwd()
}

export async function ComponentInstallation({ name, className, isPro: isProProp }: ComponentInstallationProps) {
  const cleanName = name
    .replace(/.*\/([^/]+)\.json$/i, '$1')
    .replace(/^@[^/]+\//, '')
    .replace(/\.json$/, '')
  const appRoot = getAppRoot()

  // Try to load registry json to find dependencies and css
  let parsed: any = null
  try {
    const jsonPath = path.join(appRoot, 'public', 'r', `${cleanName}.json`)
    const fileData = await fs.readFile(jsonPath, 'utf8')
    parsed = JSON.parse(fileData)
  } catch {
    // Continue with fallback lookup
    try {
      const directName = cleanName.replace(/^primitives-/, '').replace(/^components-spaceui-/, '')
      const candidate = path.join(appRoot, 'src', 'registry', 'primitives', directName, 'registry-item.json')
      const fileData = await fs.readFile(candidate, 'utf8')
      parsed = JSON.parse(fileData)
    } catch {
      // ignore
    }
  }

  const isPro = Boolean(isProProp || parsed?.isPro || parsed?.meta?.isPro || isComponentPro(cleanName))

  if (isPro) {
    return (
      <div className={className}>
        <InstallCommandBlock isShadcn packages={cleanName} />
      </div>
    )
  }

  const dependencies: string[] = parsed?.dependencies || []
  const registryDependencies: string[] = parsed?.registryDependencies || []

  // Split registryDependencies into free and Pro components
  const freeRegistryDependencies: string[] = []
  const proRegistryDependencies: string[] = []

  for (const dep of registryDependencies) {
    if (isComponentPro(dep)) {
      proRegistryDependencies.push(dep)
    } else {
      freeRegistryDependencies.push(dep)
    }
  }

  return (
    <SpaceCodeTabs className={className}>
      <TabsList>
        <TabsTab value="cli">CLI</TabsTab>
        <TabsTab value="manual">Manual</TabsTab>
      </TabsList>

      <TabsPanel value="cli">
        <InstallCommandBlock isShadcn packages={cleanName} />
      </TabsPanel>

      <TabsPanel value="manual">
        <Steps>
          {dependencies.length > 0 && (
            <Step>
              <h4>Install the following dependencies:</h4>
              <InstallCommandBlock packages={dependencies.join(' ')} />
            </Step>
          )}

          {freeRegistryDependencies.length > 0 && (
            <Step>
              <h4>Install the following registry dependencies:</h4>
              <InstallCommandBlock isShadcn packages={freeRegistryDependencies.join(' ')} />
            </Step>
          )}

          {proRegistryDependencies.length > 0 && (
            <Step>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">Install required Pro components:</h4>
                <ProBadge size="xs" className="leading-normal" />
              </div>
              <InstallCommandBlock isShadcn packages={proRegistryDependencies.join(' ')} />
            </Step>
          )}

          <Step>
            <h4>Copy and paste the following code into your project.</h4>
            <ComponentSource name={name} />
          </Step>

          <Step>
            <h4>Update the import paths to match your project setup.</h4>
          </Step>
        </Steps>
      </TabsPanel>
    </SpaceCodeTabs>
  )
}
