import { UiKitLayoutWrapper } from '@/components/layout/ui-kit-layout-wrapper'
import { ResourcesMdx } from './resources-mdx'

export default function ToolsIndexPage() {
  return (
    <UiKitLayoutWrapper>
      <ResourcesMdx slug={[]} />
    </UiKitLayoutWrapper>
  )
}

export const instant = false
