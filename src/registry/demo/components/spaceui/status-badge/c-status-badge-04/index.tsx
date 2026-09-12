import { StatusBadge } from '@/registry/components/spaceui/status-badge'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-4">
      <StatusBadge status="online" primaryText="Live" animated>
        Production Active
      </StatusBadge>
      <StatusBadge status="busy" primaryText="Recording" animated>
        Audio stream
      </StatusBadge>
      <StatusBadge status="error" primaryText="Alert" animated>
        CPU Spike
      </StatusBadge>
    </div>
  )
}
