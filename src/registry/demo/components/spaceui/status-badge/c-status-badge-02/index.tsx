import { StatusBadge } from '@/registry/components/spaceui/status-badge'

export default function Demo() {
  return (
    <div className="flex flex-col items-center justify-center gap-3.5 p-6">
      <StatusBadge size="xs" status="online" primaryText="XS">
        v1.0.0
      </StatusBadge>
      <StatusBadge size="sm" status="online" primaryText="Small">
        v1.2.0
      </StatusBadge>
      <StatusBadge size="default" status="online" primaryText="Default">
        v2.0.0
      </StatusBadge>
      <StatusBadge size="md" status="online" primaryText="Medium">
        v2.4.0
      </StatusBadge>
      <StatusBadge size="lg" status="online" primaryText="Large">
        v3.0.0
      </StatusBadge>
    </div>
  )
}
