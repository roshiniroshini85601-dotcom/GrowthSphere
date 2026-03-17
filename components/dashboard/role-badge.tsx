import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/mock-data'

const roleConfig: Record<string, { label: string; className: string }> = {
  admin:        { label: 'Admin',        className: 'bg-chart-4/15 text-chart-4 border-chart-4/25' },
  mentor:       { label: 'Mentor',       className: 'bg-chart-2/15 text-chart-2 border-chart-2/25' },
  intern:       { label: 'Intern',       className: 'bg-primary/12 text-primary border-primary/25' },
  not_mentor:   { label: 'Not Mentor',   className: 'bg-muted text-muted-foreground border-border' },
  not_employee: { label: 'Not Employee', className: 'bg-destructive/10 text-destructive border-destructive/25' },
}

export function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role?.toLowerCase()] ?? { label: role, className: 'bg-muted text-muted-foreground border-border' }
  return (
    <Badge
      variant="outline"
      className={cn('text-[11px] font-semibold rounded-full px-2.5 py-0.5', config.className)}
    >
      {config.label}
    </Badge>
  )
}

const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
  completed: { label: 'Completed', dot: 'bg-chart-2', className: 'bg-chart-2/12 text-chart-2 border-chart-2/25' },
  pending:   { label: 'Pending',   dot: 'bg-chart-3', className: 'bg-chart-3/12 text-chart-3 border-chart-3/25' },
  reopened:  { label: 'Reopened',  dot: 'bg-chart-4', className: 'bg-chart-4/12 text-chart-4 border-chart-4/25' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status?.toLowerCase()] ?? { label: status, dot: 'bg-muted-foreground', className: 'bg-muted text-muted-foreground border-border' }
  return (
    <Badge
      variant="outline"
      className={cn('text-[11px] font-semibold rounded-full px-2.5 py-0.5 flex items-center gap-1.5 w-fit', config.className)}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </Badge>
  )
}
