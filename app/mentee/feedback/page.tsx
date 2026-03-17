'use client'

import * as React from 'react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { 
  MessageSquare, ClipboardList, ChevronDown, Sparkles, 
  Target, Zap, Star, ShieldCheck, History, Info, 
  AlertCircle, MessageCircle, BarChart3, TrendingUp, Award
} from 'lucide-react'
import { useApi } from '@/lib/use-api'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { format } from 'date-fns'

type FeedbackItem = { text: string; date: string; author: string }

type Review = {
  id: string
  title: string
  description: string | null
  dateReviewed: string
  status: string
  feedback: FeedbackItem[]
}

type Task = {
  id: string
  name: string
  description: string | null
  dateReviewed: string
  status: string
  feedback: FeedbackItem[]
}

type ProgressData = {
  reviews: Review[]
  tasks: Task[]
}

type Employee = { id: string; name: string; email: string; role: string }

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function MenteeFeedbackPage() {
  const { data: authData } = useApi<{ user: Employee }>('/api/auth/me')
  const intern = authData?.user
  const internId = intern?.id

  const { data: progressData, loading } = useApi<ProgressData>(
    internId ? `/api/mentees/${internId}/progress` : ''
  )

  const reviews = (progressData?.reviews ?? []).filter((r) => Array.isArray(r.feedback) && r.feedback.length > 0)
  const tasks = (progressData?.tasks ?? []).filter((t) => Array.isArray(t.feedback) && t.feedback.length > 0)

  return (
    <DashboardLayout
      role="intern"
      userName={intern?.name ?? 'Intern'}
      userEmail={intern?.email ?? ''}
      pageTitle="Intelligence Briefing"
      pageSubtitle="Strategic feedback and mentorship intel"
    >
      <div className="space-y-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 lg:p-12 text-white shadow-2xl shadow-indigo-500/20"
        >
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-[0.2em]">
                <Sparkles size={14} className="text-yellow-300" /> Operational Analysis
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Refine Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-emerald-200">Perspective.</span>
              </h1>
              <p className="text-lg text-white/80 font-medium leading-relaxed">
                Review mentorship intel and strategic insights to optimize your growth trajectory and master your mission objectives.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-lg">
                  <div className="p-2 bg-blue-400/20 rounded-xl">
                    <TrendingUp size={18} className="text-blue-100" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Rate</div>
                    <div className="text-lg font-black tracking-tight">88.4%</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-lg">
                  <div className="p-2 bg-emerald-400/20 rounded-xl">
                    <ShieldCheck size={18} className="text-emerald-100" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Nodes Verified</div>
                    <div className="text-lg font-black tracking-tight">{reviews.length + tasks.length} Units</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-transparent rounded-full blur-3xl" />
              <div className="relative w-80 h-80">
                {/* <Image 
                  src="/C:/Users/Admin/.gemini/antigravity/brain/494d0190-262d-4774-bf78-4ef08ebaec28/feedback_hero_illustration_1773781207728.png"
                  alt="Feedback Management"
                  fill
                  className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                /> */}
              </div>
            </div>
          </div>
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        </motion.div>

        <Tabs defaultValue="reviews">
          <TabsList className="bg-muted/30 backdrop-blur-md p-1.5 h-14 rounded-2xl border border-border/20 mb-8 w-fit gap-2">
            <TabsTrigger 
              value="reviews" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg px-8 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all gap-2"
            >
              <ClipboardList size={14} /> Audit Intel
              {reviews.length > 0 && (
                <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-black border-2 bg-white/10 text-white border-white/20">{reviews.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-8 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all gap-2"
            >
              <Zap size={14} /> Mission Debriefs
              {tasks.length > 0 && (
                <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-black border-2 bg-white/10 text-white border-white/20">{tasks.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key="reviews-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="reviews" className="space-y-6 mt-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4 animate-pulse opacity-40">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Retrieving Secure Intel...</span>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/40">
                      <Info size={24} />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      No active audit intelligence detected.
                    </p>
                  </div>
                ) : (
                  <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-6">
                    {reviews.map((r) => (
                      <motion.div variants={item} key={r.id}>
                        <Card className="overflow-hidden border-2 border-muted/50 rounded-[2.5rem] shadow-sm hover:border-indigo-500/20 transition-all bg-card">
                          <Collapsible defaultOpen>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 lg:p-10">
                              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
                                <ClipboardList size={28} />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <Badge variant="outline" className="h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 border-indigo-500/10 bg-indigo-500/5 text-indigo-600">
                                    Audit Report
                                  </Badge>
                                  <Badge variant="outline" className={`h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 ${
                                    r.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' : 'bg-orange-500/10 text-orange-600 border-orange-500/10'
                                  }`}>
                                    {r.status}
                                  </Badge>
                                </div>
                                <h4 className="font-black text-foreground text-xl tracking-tight leading-tight">{r.title}</h4>
                                <div className="flex items-center gap-4">
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                                    <AlertCircle size={12} /> Mission Start: {format(new Date(r.dateReviewed), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-muted/40 hover:bg-muted text-muted-foreground transition-all">
                                  <ChevronDown size={20} className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                              <div className="px-8 lg:px-10 pb-10 pt-0 space-y-8">
                                <div className="h-px bg-muted/50 w-full" />
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                  <div className="lg:col-span-4 space-y-4">
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Operational Target</span>
                                      <p className="text-xs font-bold text-foreground">Strategic Analysis & Implementation</p>
                                    </div>
                                    <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                                      <div className="flex items-center gap-2 text-indigo-600">
                                        <Award size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Quality Score</span>
                                      </div>
                                      <div className="text-2xl font-black text-indigo-600 tracking-tight">Verified</div>
                                    </div>
                                  </div>
                                  <div className="lg:col-span-8 space-y-6">
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2 text-muted-foreground/60">
                                        <MessageSquare size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Mentorship Intel Logs</span>
                                      </div>
                                      <div className="grid grid-cols-1 gap-4">
                                        {r.feedback.map((fb, i) => (
                                          <div key={i} className="bg-slate-950/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-sm hover:border-indigo-500/30 transition-all group/fb">
                                            <div className="flex items-center justify-between mb-4">
                                              <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-xs font-black text-indigo-400 group-hover/fb:scale-110 transition-transform">
                                                  {fb.author?.split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <div>
                                                  <div className="text-xs font-black text-foreground">{fb.author}</div>
                                                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Strategic Mentor</div>
                                                </div>
                                              </div>
                                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                                                {format(new Date(fb.date), 'MMM d, yyyy')}
                                              </div>
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-medium italic border-l-4 border-indigo-500/20 pl-6">
                                              "{fb.text}"
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </motion.div>

            <motion.div
              key="tasks-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="tasks" className="space-y-6 mt-0">
                {tasks.length === 0 ? (
                  <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/40">
                      <Zap size={24} />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      No active mission debriefs available.
                    </p>
                  </div>
                ) : (
                  <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-6">
                    {tasks.map((t) => (
                      <motion.div variants={item} key={t.id}>
                        <Card className="overflow-hidden border-2 border-muted/50 rounded-[2.5rem] shadow-sm hover:border-emerald-500/20 transition-all bg-card">
                          <Collapsible defaultOpen>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 lg:p-10">
                              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
                                <Zap size={28} />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <Badge variant="outline" className="h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 border-emerald-500/10 bg-emerald-500/5 text-emerald-600">
                                    Field Mission
                                  </Badge>
                                  <Badge variant="outline" className={`h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 ${
                                    t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' : 'bg-orange-500/10 text-orange-600 border-orange-500/10'
                                  }`}>
                                    {t.status}
                                  </Badge>
                                </div>
                                <h4 className="font-black text-foreground text-xl tracking-tight leading-tight">{t.name}</h4>
                                <div className="flex items-center gap-4">
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                                    <History size={12} /> Execution Date: {format(new Date(t.dateReviewed), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-muted/40 hover:bg-muted text-muted-foreground transition-all">
                                  <ChevronDown size={20} className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                              <div className="px-8 lg:px-10 pb-10 pt-0 space-y-8">
                                <div className="h-px bg-muted/50 w-full" />
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                  <div className="lg:col-span-4 space-y-4">
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Mission Objective</span>
                                      <p className="text-xs font-bold text-foreground">Operational Excellence & Scalability</p>
                                    </div>
                                    <div className="p-5 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                                      <div className="flex items-center gap-2 text-emerald-600">
                                        <Award size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Tactical Score</span>
                                      </div>
                                      <div className="text-2xl font-black text-emerald-600 tracking-tight">Verified</div>
                                    </div>
                                  </div>
                                  <div className="lg:col-span-8 space-y-6">
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2 text-muted-foreground/60">
                                        <TrendingUp size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Post-Mission Analysis</span>
                                      </div>
                                      <div className="grid grid-cols-1 gap-4">
                                        {t.feedback.map((fb, i) => (
                                          <div key={i} className="bg-slate-950/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-sm hover:border-emerald-500/30 transition-all group/fb">
                                            <div className="flex items-center justify-between mb-4">
                                              <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xs font-black text-emerald-400 group-hover/fb:scale-110 transition-transform">
                                                  {fb.author?.split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <div>
                                                  <div className="text-xs font-black text-foreground">{fb.author}</div>
                                                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Field Supervisor</div>
                                                </div>
                                              </div>
                                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                                                {format(new Date(fb.date), 'MMM d, yyyy')}
                                              </div>
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-medium italic border-l-4 border-emerald-500/20 pl-6">
                                              "{fb.text}"
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
