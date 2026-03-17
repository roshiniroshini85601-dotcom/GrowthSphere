'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, GraduationCap, Sparkles, Target, Star, ArrowRight, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { DataTable } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useApi } from '@/lib/use-api'
import { Badge } from '@/components/ui/badge'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
}

function ProgressCell({ internId }: { internId: string }) {
  const { data: progress, loading } = useApi<{ milestones: any[] }>(`/api/mentees/${internId}/progress`)
  const all = progress?.milestones ?? []
  const pct = all.length === 0 ? 0 : Math.round((all.filter((m) => m.internStatus).length / all.length) * 100)

  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <Progress value={loading ? 0 : pct} className="h-2 flex-1 bg-muted/50 shadow-inner" />
      <span className="text-[11px] font-black text-foreground w-10 text-right tabular-nums">{loading ? '…' : `${pct}%`}</span>
    </div>
  )
}

export default function MentorDashboardPage() {
  const router = useRouter()
  const { data: authData } = useApi<{ user: { id: string, name: string, email: string } }>('/api/auth/me')
  const { data: mentees, loading } = useApi<any[]>(
    authData?.user?.id ? `/api/mentors/${authData.user.id}/mentees` : ''
  )

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
      header: 'Corporate Identity', 
      cell: ({ row }) => <span className="text-sm font-semibold text-muted-foreground/80 tabular-nums">{row.original.email}</span> 
    },
    {
      id: 'progress',
      header: 'Growth Path',
      cell: ({ row }) => <ProgressCell internId={row.original.id} />,
    },
    {
      id: 'actions',
      header: 'Data',
      cell: ({ row }) => (
        <Button
          variant="outline" 
          size="sm" 
          className="h-9 text-[11px] font-bold gap-2 rounded-xl px-4 shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all group"
          onClick={() => router.push(`/mentor/mentees/${row.original.id}`)}
        >
          <Eye size={14} className="group-hover:scale-110 transition-transform" /> Analytics
        </Button>
      ),
    },
  ]

  return (
    <DashboardLayout
      role="mentor"
      userName={authData?.user?.name ?? 'Mentor'}
      userEmail={authData?.user?.email ?? ''}
      pageTitle="Overview"
      pageSubtitle="Strategic oversight of your talent pipeline"
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* Mentor Hero Section */}
        <motion.div 
          variants={item}
          className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-8 lg:p-14 text-white shadow-2xl group"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -ml-24 -mb-24 transition-transform duration-1000 group-hover:-translate-x-10" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                <Star size={14} className="text-yellow-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Master Mentor Protocol</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-[0.95]">
                Sculpt the <br/>
                <span className="text-white/60">Next Generation.</span>
              </h1>
              
              <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">
                You are currently guiding <span className="text-white font-bold underline decoration-white/30 underline-offset-4">{mentees?.length ?? 0} ambitious mentees</span>. Monitor their trajectories and accelerate their professional evolution.
              </p>
              
              <div className="flex flex-wrap gap-5 pt-4">
                <Button className="h-14 px-10 rounded-[2rem] bg-white text-slate-950 font-black text-sm shadow-2xl shadow-black/10 hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 group/btn">
                  Manage Mentees <ArrowRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                <button className="h-14 px-8 rounded-[2rem] bg-white/5 border border-white/10 text-white font-black text-sm backdrop-blur-md hover:bg-white/10 transition-all active:scale-95 inline-flex items-center gap-3">
                  Training Resources
                </button>
              </div>
            </div>
            
            <div className="hidden lg:flex relative w-80 h-80 shrink-0 items-center justify-center">
               <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
               <GraduationCap size={160} className="text-white/20 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <motion.div variants={item} className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-8 shadow-sm group hover:border-primary/20 transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110 group-hover:rotate-3">
                 <Users size={24} />
               </div>
               <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">Active</Badge>
             </div>
             <h3 className="text-2xl font-black tracking-tight text-foreground">{mentees?.length ?? 0}</h3>
             <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Personnel Assigned</p>
           </motion.div>

           <motion.div variants={item} className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-8 shadow-sm group hover:border-emerald-500/20 transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110 group-hover:rotate-3">
                 <Target size={24} />
               </div>
               <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold">In Target</Badge>
             </div>
             <h3 className="text-2xl font-black tracking-tight text-foreground">84%</h3>
             <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Completion Avg</p>
           </motion.div>

           <motion.div variants={item} className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-8 shadow-sm group hover:border-orange-500/20 transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 transition-transform group-hover:scale-110 group-hover:rotate-3">
                 <Sparkles size={24} />
               </div>
               <Badge className="bg-orange-500/10 text-orange-600 border-none text-[10px] font-bold">Attention</Badge>
             </div>
             <h3 className="text-2xl font-black tracking-tight text-foreground">3</h3>
             <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Pending Reviews</p>
           </motion.div>
        </div>

        {/* Assigned Mentees Table */}
        <motion.div variants={item} className="bg-card border-2 border-muted/50 rounded-[3rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <GraduationCap size={20} />
               </div>
               <div>
                 <h3 className="text-xl font-black tracking-tight text-foreground">Personnel Directory</h3>
                 <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60">Strategic Talent Tracking</p>
               </div>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={mentees || []}
            searchPlaceholder="Search by identity..."
            searchColumn="name"
          />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
