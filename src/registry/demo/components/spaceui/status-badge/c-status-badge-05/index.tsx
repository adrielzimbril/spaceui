import { StatusBadge } from '@/registry/components/spaceui/status-badge'

export default function Demo() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 p-4">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <StatusBadge mode="stack" status="online" primaryText="Production API" animated>
          Operational • 99.99% uptime
        </StatusBadge>
        <StatusBadge mode="stack" status="away" primaryText="Database Backup">
          Maintenance in progress
        </StatusBadge>
        <StatusBadge mode="stack" status="error" primaryText="Auth Cluster" animated>
          Incident reported
        </StatusBadge>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <StatusBadge mode="stack" indicatorBadge status="online" primaryText="Production API" animated>
          Operational • 99.99% uptime
        </StatusBadge>
        <StatusBadge mode="stack" indicatorBadge status="away" primaryText="Database Backup">
          Maintenance in progress
        </StatusBadge>
        <StatusBadge mode="stack" indicatorBadge status="error" primaryText="Auth Cluster" animated>
          Incident reported
        </StatusBadge>
      </div>
    </div>
  )
}
