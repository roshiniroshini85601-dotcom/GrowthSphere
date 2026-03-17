'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, UserPlus, UserCheck } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { DataTable } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { useApi } from '@/lib/use-api'
import { toast } from 'sonner'
import type { EmployeeWithRelations, Employee } from '@/types'

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

export default function AdminMentorsPage() {
  const router = useRouter()
  const { data: allEmployees, loading, refetch } = useApi<EmployeeWithRelations[]>('/api/employees')
  
  const [viewMentor, setViewMentor] = React.useState<EmployeeWithRelations | null>(null)
  const [assignMentor, setAssignMentor] = React.useState<EmployeeWithRelations | null>(null)
  const [selectedInternIds, setSelectedInternIds] = React.useState<string[]>([])
  const [submitting, setSubmitting] = React.useState(false)

  const mentors = (allEmployees ?? []).filter((e) => e.role === 'MENTOR')
  
  // Find all interns who are NOT already assigned to THIS mentor
  const availableInterns = (allEmployees ?? []).filter(
    (e) => e.role === 'INTERN' && !e.mentors?.some((m: any) => m.mentor?.id === assignMentor?.id)
  )

  async function handleAssign() {
    if (!assignMentor || selectedInternIds.length === 0) {
      toast.error('Select at least one intern to assign.')
      return
    }

    setSubmitting(true)
    try {
      const promises = selectedInternIds.map((internId: string) => 
        fetch(`/api/mentors/${assignMentor.id}/mentees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menteeId: internId })
        })
      )

      const results = await Promise.all(promises)
      const failures = results.filter(r => !r.ok)

      if (failures.length > 0) {
        toast.error(`Failed to assign ${failures.length} intern(s).`)
      } else {
        toast.success(`${selectedInternIds.length} intern(s) assigned to ${assignMentor.name}.`)
        refetch()
        setAssignMentor(null)
        setSelectedInternIds([])
      }
    } catch (err) {
      toast.error('An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnDef<EmployeeWithRelations>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="py-1">
          <div className="font-bold text-foreground tracking-tight">{row.original.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">{row.original.degree}</div>
        </div>
      ),
    },
    { accessorKey: 'email', header: 'Email', cell: ({ row }) => <span className="text-muted-foreground font-medium">{row.original.email}</span> },
    { accessorKey: 'contactNo', header: 'Contact', cell: ({ row }) => <span className="font-medium italic">{row.original.contactNo}</span> },
    {
      id: 'assignedInterns',
      header: 'Assigned Interns',
      cell: ({ row }) => {
        const count = row.original.mentees?.length ?? 0
        return (
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[11px] font-bold rounded-xl px-3 h-7">
            {count} intern{count !== 1 ? 's' : ''}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-xl gap-2 px-4 shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all" onClick={() => setViewMentor(row.original)}>
            <Eye size={12} /> View Interns
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-xl gap-2 px-4 shadow-sm hover:bg-emerald-500/5 hover:text-emerald-500 hover:border-emerald-500/20 transition-all" onClick={() => { setAssignMentor(row.original); setSelectedInternIds([]) }}>
            <UserPlus size={12} /> Assign
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      role="admin"
      userName="Admin"
      userEmail="admin@org.com"
      pageTitle="Mentors"
      pageSubtitle={loading ? 'Loading list...' : `Managing ${mentors.length} active mentors`}
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border-2 border-muted/50 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">Mentors</h2>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Directory & Assignments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <div className="text-[13px] font-bold text-foreground leading-none">{mentors.length} Mentors</div>
               <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">Status Active</div>
             </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
          <DataTable columns={columns} data={mentors} searchPlaceholder="Search by name, email, or degree..." searchColumn="name" />
        </motion.div>
      </motion.div>

      {/* View Interns Dialog */}
      <Dialog open={!!viewMentor} onOpenChange={(o) => o === false && setViewMentor(null)}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">Assigned Interns</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Interns assigned to <span className="text-primary font-bold">{viewMentor?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {viewMentor && (viewMentor.mentees?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-[2rem] border-2 border-dashed border-muted">
                <p className="text-sm text-muted-foreground font-medium italic">No interns assigned to this sector yet.</p>
              </div>
            ) : (
              viewMentor?.mentees?.map(({ mentee }: any) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={mentee.id} 
                  className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border-2 border-transparent hover:border-primary/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-sm transition-transform group-hover:scale-110">
                    {mentee.name.split(' ').map((n: any) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{mentee.name}</div>
                    <div className="text-[11px] text-muted-foreground font-medium italic">{mentee.email}</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Interns Dialog */}
      <Dialog open={!!assignMentor} onOpenChange={(o) => o === false && setAssignMentor(null)}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">Assign Interns</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Select available interns to assign to <span className="text-primary font-bold">{assignMentor?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {availableInterns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-[2rem] border-2 border-dashed border-muted">
                <p className="text-sm text-muted-foreground font-medium italic">All potential candidates are already matched.</p>
              </div>
            ) : (
              availableInterns.map((intern: EmployeeWithRelations) => {
                const checked = selectedInternIds.includes(intern.id)
                const currentMentor = intern.mentors?.[0]?.mentor
                
                return (
                  <label key={intern.id} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border-2 border-transparent hover:bg-muted hover:border-primary/10 cursor-pointer transition-all group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSelectedInternIds((prev) =>
                          checked ? prev.filter((id) => id !== intern.id) : [...prev, intern.id]
                        )}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-muted-foreground/30 peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                         {checked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 transition-transform group-hover:scale-110">
                      {intern.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground">{intern.name}</div>
                      <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{intern.collegeName}</div>
                    </div>
                    {currentMentor && (
                      <Badge variant="outline" className="text-[9px] h-5 bg-white/50 border-muted-foreground/10 text-muted-foreground/70 rounded-full font-bold">
                        Linked to {currentMentor.name.split(' ')[0]}
                      </Badge>
                    )}
                  </label>
                )
              })
            )}
          </div>
          <div className="flex gap-4 justify-end pt-8">
            <Button variant="outline" className="rounded-2xl h-12 text-[13px] font-bold px-8 border-2" onClick={() => setAssignMentor(null)} disabled={submitting}>Cancel</Button>
            <Button className="rounded-2xl h-12 text-[13px] font-bold px-8 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all" onClick={handleAssign} disabled={selectedInternIds.length === 0 || submitting}>
              {submitting ? 'Assigning...' : `Confirm Assignment ${selectedInternIds.length > 0 ? `(${selectedInternIds.length})` : ''}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
