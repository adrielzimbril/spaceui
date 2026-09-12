import { StatusBadge } from '@/registry/components/spaceui/status-badge'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-4">
      <StatusBadge variant="default" status="online" primaryText="Default">
        System active
      </StatusBadge>
      <StatusBadge variant="inverted" status="online" primaryText="Inverted">
        Dark contrast
      </StatusBadge>
      <StatusBadge variant="outline" status="online" primaryText="Outline">
        Standalone
      </StatusBadge>
    </div>
  )
}
