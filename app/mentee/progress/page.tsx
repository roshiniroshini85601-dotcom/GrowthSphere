'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { 
  CheckCircle2, Clock, BookOpen, ChevronDown, 
  Sparkles, Award, Zap, TrendingUp, Target, BarChart3, Layers
} from 'lucide-react'
import { useApi } from '@/lib/use-api'

type Employee = { id: string; name: string; email: string }
type ProgressData = { milestones: any[]; tasks: any[]; reviews: any[] }

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

export default function MenteeProgressPage() {
  const { data: authData } = useApi<{ user: Employee }>('/api/auth/me')
  const internId = authData?.user?.id
  const intern = authData?.user

  const { data: progressData, loading } = useApi<ProgressData>(
    internId ? `/api/mentees/${internId}/progress` : ''
  )

  const milestones = progressData?.milestones ?? []

  // Group milestones by topic, using topic name for the header
  const byTopic = milestones.reduce<Record<string, { topicName: string; items: any[] }>>((acc, m) => {
    const topicId = m.milestone?.topicId ?? 'unknown'
    const topicName = m.milestone?.topic?.name ?? topicId
    if (!acc[topicId]) acc[topicId] = { topicName, items: [] }
    acc[topicId].items.push(m)
    return acc
  }, {})

  const totalMilestones = milestones.length
  const completedMilestones = milestones.filter((m) => m.internStatus).length
  const overallProgress = totalMilestones === 0 ? 0 : Math.round((completedMilestones / totalMilestones) * 100)

  return (
    <DashboardLayout
      role="intern"
      userName={intern?.name ?? 'Intern'}
      userEmail={intern?.email ?? ''}
      pageTitle="Trajectory"
      pageSubtitle="Mastery levels and tactical node progression"
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* Glassy Progress Summary */}
        <motion.div variants={item}>
          <div className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-10 lg:p-14 text-white shadow-2xl border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-6 flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                  <Target size={12} className="text-primary" />
                  <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.25em]">Tactical Overview</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl lg:text-5xl font-black tracking-tighter">Overall Mastery</h2>
                  <p className="text-white/40 font-bold text-sm lg:text-base max-w-md mx-auto md:mx-0">
                    You have successfully decrypted <span className="text-white">{completedMilestones} of {totalMilestones}</span> critical nodes in your training curriculum.
                  </p>
                </div>
              </div>

              <div className="relative flex items-center justify-center shrink-0">
                <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full border-[12px] border-white/5 flex items-center justify-center relative">
                  <div className="text-4xl lg:text-5xl font-black">{overallProgress}%</div>
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="calc(50% - 6px)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray="100 100"
                      className="text-primary"
                      pathLength={100}
                      style={{ strokeDasharray: `${overallProgress} 100` }}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 animate-pulse opacity-40">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Synchronizing Progress Data...</span>
          </div>
        )}

        {/* Topic Grid */}
        <div className="grid grid-cols-1 gap-6">
          {Object.values(byTopic).length === 0 && !loading ? (
            <motion.div variants={item} className="text-center py-24 bg-card border-2 border-dashed border-muted rounded-[3rem]">
              <Layers size={48} className="mx-auto text-muted mb-4 opacity-20" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No curriculum segments assigned.</p>
            </motion.div>
          ) : Object.entries(byTopic).map(([topicId, { topicName, items: ms }]) => {
            const done = ms.filter((m) => m.internStatus).length
            const total = ms.length
            const pct = total === 0 ? 0 : Math.round((done / total) * 100)

            return (
              <motion.div variants={item} key={topicId}>
                <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-8 shadow-sm hover:border-primary/10 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                  
                  <Collapsible defaultOpen>
                    <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-3 ${pct === 100 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                        {pct === 100 ? <Award size={28} /> : <BookOpen size={28} />}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                           <h3 className="text-xl font-black tracking-tight text-foreground">{topicName}</h3>
                           <Badge variant="outline" className={`h-7 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 ${pct === 100 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-primary/5 text-primary border-primary/10'}`}>
                             {pct === 100 ? 'Sector Clear' : `${done}/${total} Nodes`}
                           </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={pct} className="h-2.5 flex-1 rounded-full bg-muted shadow-inner overflow-hidden">
                             <div className={`h-full transition-all duration-1000 ${pct === 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                          </Progress>
                          <span className="text-xs font-black text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                          <div className="p-3 cursor-pointer rounded-2xl bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                             <ChevronDown size={20} className="transition-transform duration-300 group-[&[data-state=open]]:rotate-180" />
                          </div>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent className="mt-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ms.map((m: any, mIdx: number) => (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * mIdx }}
                            key={m.id} 
                            className="flex items-start gap-4 p-5 rounded-2xl bg-muted/30 border border-muted hover:border-primary/20 hover:bg-slate-900/40 transition-all group/node"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all ${m.internStatus ? 'bg-emerald-500/10 text-emerald-600 shadow-sm shadow-emerald-500/5' : 'bg-muted text-muted-foreground opacity-30 group-hover/node:opacity-100'}`}>
                              {m.internStatus ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[14px] font-black text-foreground leading-tight tracking-tight mb-1 truncate">{m.milestone?.name}</div>
                              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
                                {m.dateAssigned ? format(new Date(m.dateAssigned), 'MMM d') : 'Active'}
                              </div>
                            </div>
                            {m.internStatus && (
                              <div className="text-emerald-500">
                                <Sparkles size={14} className="animate-pulse" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
