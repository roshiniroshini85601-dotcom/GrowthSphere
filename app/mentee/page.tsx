'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useApi } from '@/lib/use-api'
import { 
  Mail, BookOpen, CheckCircle2, Clock, CalendarDays, 
  Sparkles, Award, Star, Zap, MessageSquare, TrendingUp, User, ArrowRight, PlayCircle
} from 'lucide-react'
import Image from 'next/image'

type Employee = { id: string; name: string; email: string; role: string; degree?: string; collegeName?: string }
type ProgressData = {
  milestones: any[]
  tasks: any[]
  reviews: any[]
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

export default function MenteeDashboardPage() {
  const { data: authData } = useApi<{ user: Employee }>('/api/auth/me')
  const internId = authData?.user?.id
  const intern = authData?.user

  const { data: progressData, loading } = useApi<ProgressData>(
    internId ? `/api/mentees/${internId}/progress` : ''
  )

  // Fetch mentor via mentor-mentee relation
  const { data: mentorRelations } = useApi<any[]>(
    internId ? `/api/mentees/${internId}/mentor` : ''
  )
  const mentor = mentorRelations?.[0]

  const milestones = progressData?.milestones ?? []
  const tasks = progressData?.tasks ?? []
  const reviews = progressData?.reviews ?? []

  const completed = milestones.filter((m) => m.internStatus).length
  const total = milestones.length
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  const pendingTasks = tasks.filter((t) => t.status === 'PENDING').length
  const pendingReviews = reviews.filter((r) => r.status === 'PENDING').length

  return (
    <DashboardLayout
      role="intern"
      userName={intern?.name ?? 'Intern'}
      userEmail={intern?.email ?? ''}
      pageTitle="Learning Hub"
      pageSubtitle="Your personalized trajectory and growth"
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* Premium Mentee Hero */}
        <motion.div 
          variants={item}
          className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-10 lg:p-14 text-white shadow-2xl group border border-white/5"
        >
          {/* Animated backgrounds */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -ml-24 -mb-24 transition-transform duration-1000 group-hover:-translate-x-10" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-8 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mx-auto lg:mx-0"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.25em]">Training Active</span>
              </motion.div>
              
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9] lg:leading-[0.85]">
                  Ignite Your <br/>
                  <span className="text-white/40">Potential.</span>
                </h1>
                <p className="text-lg text-white/50 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Welcome back, <span className="text-white font-bold">{intern?.name?.split(' ')[0] || 'Explorer'}</span>. You've completed <span className="text-white font-bold">{progress}%</span> of your curriculum. Your mentor is ready for your next milestone.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <Button className="h-14 px-10 rounded-3xl bg-primary text-primary-foreground font-black text-sm shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95" onClick={() => window.location.href = '/mentee/progress'}>
                   Dive In <PlayCircle size={18} className="ml-2" />
                </Button>
                {mentor && (
                  <Button variant="ghost" asChild className="h-14 px-8 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-sm backdrop-blur-md hover:bg-white/10 transition-all active:scale-95 inline-flex items-center gap-3">
                    <a href={`mailto:${mentor.email}`}>
                      Contact {mentor.name.split(' ')[0]} <MessageSquare size={18} />
                    </a>
                  </Button>
                )}
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="relative w-full max-w-[420px] aspect-square flex items-center justify-center shrink-0"
            >
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[80px] animate-pulse" />
              <div className="relative w-full h-full">
                <Image 
                  src="/mentee-hero.png" 
                  alt="Learning Hub Illustration" 
                  fill 
                  className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative z-10 p-4" 
                  priority
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          variants={item}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Milestone Stat */}
          <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-6 shadow-sm group hover:border-emerald-500/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
               <Award size={24} />
            </div>
            <div className="space-y-1">
               <div className="text-3xl font-black text-foreground tracking-tight">{completed}<span className="text-sm font-bold text-muted-foreground/40 ml-1.5">/ {total}</span></div>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Milestones Done</p>
            </div>
          </div>

          {/* Task Stat */}
          <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-6 shadow-sm group hover:border-orange-500/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
               <Zap size={24} />
            </div>
            <div className="space-y-1">
               <div className="text-3xl font-black text-foreground tracking-tight">{pendingTasks}</div>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Active Tasks</p>
            </div>
          </div>

          {/* Quality Stat - Example placeholder if needed */}
          <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-6 shadow-sm group hover:border-blue-500/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
               <TrendingUp size={24} />
            </div>
            <div className="space-y-1">
               <div className="text-3xl font-black text-foreground tracking-tight">{progress}%</div>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Success Rate</p>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-6 shadow-sm group hover:border-purple-500/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
               <MessageSquare size={24} />
            </div>
            <div className="space-y-1">
               <div className="text-3xl font-black text-foreground tracking-tight">{pendingReviews}</div>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Review Stack</p>
            </div>
          </div>
        </motion.div>

        {/* Content Section: Progress & Milestones */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Overall Progress Tracker */}
          <motion.div variants={item} className="xl:col-span-12">
            <div className="bg-card border-2 border-muted/50 rounded-[3rem] p-8 lg:p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="w-24 h-24 rounded-[2rem] bg-primary text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-primary/20 shrink-0">
                   {progress}%
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-foreground">Launch Trajectory</h3>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Mastery progression across assigned modules</p>
                    </div>
                    <Badge variant="outline" className="h-9 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-2">
                      Phase 1 Active
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <Progress value={progress} className="h-4 rounded-full bg-muted shadow-inner overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-primary via-primary to-blue-400" />
                    </Progress>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                       <span>Ignition</span>
                       <span>Current State: {completed} / {total} Nodes</span>
                       <span>Orbit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Milestones */}
          <motion.div variants={item} className="xl:col-span-12">
            <div className="bg-card border-2 border-muted/50 rounded-[3rem] p-8 lg:p-10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                       <Star size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-foreground">Recent Milestones</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Your latest tactical achievements</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl h-10 px-5 font-bold gap-2 group" onClick={() => window.location.href = '/mentee/progress'}>
                    Full History <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    <div className="col-span-full py-10 flex flex-col items-center justify-center gap-4 animate-pulse opacity-40">
                       <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                       <span className="text-xs font-black uppercase tracking-widest">Indexing Nodes...</span>
                    </div>
                  ) : milestones.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50">
                       <p className="text-sm font-bold text-muted-foreground">No tactical nodes assigned to your sector.</p>
                    </div>
                  ) : (
                    milestones.slice(0, 4).map((m: any, idx: number) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        key={m.id} 
                        className="flex items-center gap-5 p-5 rounded-[2.5rem] bg-muted/30 border border-muted hover:border-primary/30 hover:bg-slate-950/40 transition-all group/item shadow-sm"
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${m.internStatus ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-muted text-muted-foreground opacity-40 group-hover/item:opacity-100'}`}>
                           {m.internStatus ? <CheckCircle2 size={22} /> : <Clock size={22} />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="text-[15px] font-black text-foreground truncate tracking-tight">{m.milestone?.name}</div>
                           <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60">
                              {m.milestone?.topic?.name ?? 'Foundation'} · {m.dateAssigned ? format(new Date(m.dateAssigned), 'MMM d, yyyy') : '—'}
                           </div>
                        </div>
                        <Badge variant="outline" className={`h-8 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition-all ${m.internStatus ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'text-muted-foreground opacity-40'}`}>
                          {m.internStatus ? 'Complete' : 'Active'}
                        </Badge>
                      </motion.div>
                    ))
                  )}
                </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
