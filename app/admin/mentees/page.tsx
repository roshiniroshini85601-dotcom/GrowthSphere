'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { BarChart2, ShieldAlert } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { DataTable } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useApi } from '@/lib/use-api'
import type { EmployeeWithRelations } from '@/types'

type ProgressData = {
  milestones: { internStatus: boolean }[]
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

function ProgressCell({ internId }: { internId: string }) {
  const { data: progress, loading } = useApi<ProgressData>(`/api/mentees/${internId}/progress`)
  const all = progress?.milestones ?? []
  const pct = all.length === 0 ? 0 : Math.round((all.filter((m) => m.internStatus).length / all.length) * 100)

  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <Progress value={loading ? 0 : pct} className="h-2.5 flex-1 shadow-inner bg-muted/50" />
      <span className="text-[11px] font-extrabold text-foreground shrink-0 w-10 text-right">{loading ? '…' : `${pct}%`}</span>
    </div>
  )
}

export default function AdminMenteesPage() {
  const router = useRouter()
  const { data: allEmployees, loading } = useApi<EmployeeWithRelations[]>('/api/employees')
  
  const interns = React.useMemo(() => 
    (allEmployees ?? []).filter((e) => e.role?.toUpperCase() === 'INTERN')
  , [allEmployees])

  const columns: ColumnDef<EmployeeWithRelations>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="py-1">
          <div className="font-extrabold text-foreground text-[15px] tracking-tight">{row.original.name}</div>
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60 leading-none">{row.original.collegeName}</div>
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-sm font-semibold text-muted-foreground/80 tabular-nums">{row.original.email}</span>
    },
    {
      id: 'mentor',
      header: 'Lead Mentor',
      cell: ({ row }) => {
        const mentorName = row.original.mentors?.[0]?.mentor?.name
        return mentorName ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm border border-primary/10">
               {mentorName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <span className="text-[13px] font-bold text-foreground/80">{mentorName}</span>
          </div>
        ) : (
          <Badge variant="outline" className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-extrabold h-6 px-3 rounded-full border-dashed opacity-50">Unassigned</Badge>
        )
      }
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => <ProgressCell internId={row.original.id} />
    },
    {
      id: 'actions',
      header: 'Details',
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 text-[11px] font-bold gap-2 rounded-xl px-4 shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all" 
          onClick={() => router.push(`/admin/mentees/${row.original.id}`)}
        >
          <BarChart2 size={14} /> View Details
        </Button>
      )
    }
  ]

  return (
    <DashboardLayout
      role="admin"
      userName="Admin"
      userEmail="admin@org.com"
      pageTitle="Interns"
      pageSubtitle={loading ? 'Loading list...' : `Tracking ${interns.length} interns in training`}
    >
       <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border-2 border-muted/50 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform group-hover:rotate-6">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">Intern Progress</h2>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">Real-time Milestones</p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
             <div className="text-right hidden sm:block">
               <div className="text-[13px] font-bold text-foreground leading-none">{interns.length} Interns</div>
               <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1 opacity-60">Live Tracking Enabled</div>
             </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
          <DataTable 
            columns={columns} 
            data={interns} 
            searchPlaceholder="Filter interns by name..." 
            searchColumn="name" 
          />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
