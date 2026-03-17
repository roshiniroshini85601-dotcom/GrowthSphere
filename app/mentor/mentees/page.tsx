'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Users, Search, GraduationCap, ShieldCheck } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { DataTable } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { useApi } from '@/lib/use-api'
import { Badge } from '@/components/ui/badge'

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

export default function MentorMenteesPage() {
  const router = useRouter()
  const { data: authData } = useApi<{ user: { id: string, name: string, email: string } }>('/api/auth/me')
  const mentorId = authData?.user?.id
  
  const { data: menteeRelations, loading } = useApi<any[]>(
    mentorId ? `/api/mentors/${mentorId}/mentees` : ''
  )

  const mentees = menteeRelations ?? []

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Mentee Identity',
      cell: ({ row }) => (
        <div className="py-1">
          <div className="font-extrabold text-foreground text-[15px] tracking-tight">{row.original.name}</div>
          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60 leading-none">{row.original.collegeName}</div>
        </div>
      ),
    },
    { 
      accessorKey: 'email', 
      header: 'Corporate Email', 
      cell: ({ row }) => <span className="text-sm font-semibold text-muted-foreground/80 tabular-nums">{row.original.email}</span> 
    },
    { 
      accessorKey: 'contactNo', 
      header: 'Secure Comms',
      cell: ({ row }) => <span className="text-[11px] font-black tracking-widest text-muted-foreground/60">{row.original.contactNo}</span>
    },
    {
      id: 'actions',
      header: 'Data Access',
      cell: ({ row }) => (
        <Button
          variant="outline" 
          size="sm" 
          className="h-9 text-[11px] font-bold gap-2 rounded-xl px-4 shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all group"
          onClick={() => router.push(`/mentor/mentees/${row.original.id}`)}
        >
          <Eye size={14} className="group-hover:scale-110 transition-transform" /> Profile
        </Button>
      ),
    },
  ]

  return (
    <DashboardLayout
      role="mentor"
      userName={authData?.user?.name ?? 'Mentor'}
      userEmail={authData?.user?.email ?? ''}
      pageTitle="Talent Network"
      pageSubtitle="Strategic overview of your direct reports"
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* Header Visual Section */}
        <motion.div variants={item} className="bg-slate-950 rounded-[3rem] p-10 lg:p-14 relative overflow-hidden shadow-2xl group text-white">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                    <ShieldCheck size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Verified Network</span>
                 </div>
                 <h1 className="text-4xl lg:text-5xl font-black tracking-tighter">Your Active <br/>Mentees.</h1>
                 <p className="text-slate-400 font-medium max-w-sm">Manage the professional growth and data access of <span className="text-white font-bold">{mentees.length} assigned personnel</span>.</p>
              </div>
              <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                 <Users size={48} />
              </div>
           </div>
        </motion.div>

        {/* Directory Section */}
        <motion.div variants={item} className="bg-card border-2 border-muted/50 rounded-[3rem] p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
               <GraduationCap size={20} />
             </div>
             <div>
               <h3 className="text-xl font-black tracking-tight text-foreground">Personnel Directory</h3>
               <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60">Complete Talent Access</p>
             </div>
          </div>

          <DataTable 
            columns={columns} 
            data={mentees} 
            searchPlaceholder="Search identities..." 
            searchColumn="name" 
          />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
