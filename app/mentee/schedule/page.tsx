'use client'

import * as React from 'react'
import { format, isToday, isPast } from 'date-fns'
import { toast } from 'sonner'
import {
  CheckCircle, PlayCircle, ClipboardList, ChevronDown,
  CheckCircle2, Clock, BookOpen, Filter,
  Sparkles, Zap, Star, Target, CalendarDays, ArrowRight, 
  Search, SlidersHorizontal, Info, Play, Check, AlertCircle,
  Award, TrendingUp, BarChart3, Layers
} from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/lib/use-api'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

type Employee = { id: string; name: string; email: string }
type ProgressData = { milestones: any[]; reviews: any[]; tasks: any[] }
type FilterState = 'all' | 'pending' | 'completed'

interface BaseItem {
  id: string;
  internStatus?: boolean;
  status?: string;
  title?: string;
  name?: string;
  description?: string;
  dateReviewed?: string;
  dateAssigned?: string;
  feedback?: any;
  milestone?: {
    name: string;
    content?: string;
    link?: string;
    topicId?: string;
    topic?: { name: string };
  };
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } }
}

function categorize(dateStr: string) {
  try {
    const d = new Date(dateStr)
    if (isToday(d)) return 'current'
    if (isPast(d)) return 'past'
    return 'upcoming'
  } catch {
    return 'upcoming'
  }
}

function FilterBar({ value, onChange, counts }: {
  value: FilterState
  onChange: (v: FilterState) => void
  counts: { all: number; pending: number; completed: number }
}) {
  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-muted/30 backdrop-blur-md rounded-2xl border border-border/40 w-fit">
      {(['all', 'pending', 'completed'] as FilterState[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
            value === f
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 border border-primary/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {f}
          <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-md text-[9px] font-black ${
            value === f ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            {counts[f]}
          </span>
        </button>
      ))}
    </div>
  )
}

const getFeedbackArray = (fb: any): any[] => {
  if (Array.isArray(fb)) return fb
  if (typeof fb === 'string') {
    try {
      const parsed = JSON.parse(fb)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default function MenteeSchedulePage() {
  const { data: authData } = useApi<{ user: Employee }>('/api/auth/me')
  const internId = authData?.user?.id
  const intern = authData?.user

  const { data: progressData, loading, refetch } = useApi<ProgressData>(
    internId ? `/api/mentees/${internId}/progress` : ''
  )

  // Per-subtab filter state (per timeline tab)
  const [milestoneFilter, setMilestoneFilter] = React.useState<FilterState>('all')
  const [milestoneTopicFilter, setMilestoneTopicFilter] = React.useState<string>('all')
  const [reviewFilter, setReviewFilter] = React.useState<FilterState>('all')
  const [taskFilter, setTaskFilter] = React.useState<FilterState>('all')

  const milestones = progressData?.milestones ?? []
  const reviews = progressData?.reviews ?? []
  const tasks = progressData?.tasks ?? []

  async function markMilestoneComplete(id: string) {
    try {
      const res = await fetch(`/api/intern-milestones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internStatus: true }),
      })
      if (!res.ok) throw new Error()
      toast.success('Milestone marked as completed!')
      refetch()
    } catch {
      toast.error('Failed to mark milestone as complete.')
    }
  }

  async function markReviewReady(id: string) {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internStatus: true }),
      })
      if (!res.ok) throw new Error()
      toast.success('Marked ready for review!')
      refetch()
    } catch {
      toast.error('Failed to update review status.')
    }
  }

  async function markTaskReady(id: string) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internStatus: true }),
      })
      if (!res.ok) throw new Error()
      toast.success('Marked ready for demonstration!')
      refetch()
    } catch {
      toast.error('Failed to update task status.')
    }
  }

  function applyFilter<T extends BaseItem>(
    items: T[],
    filter: FilterState,
    completedChecker: (item: T) => boolean
  ) {
    if (filter === 'pending') return items.filter((i) => !completedChecker(i))
    if (filter === 'completed') return items.filter((i) => completedChecker(i))
    return items
  }

  function renderItems(tab: 'current' | 'past' | 'upcoming') {
    const allMilestones = milestones.filter((m: BaseItem) => categorize(m.dateAssigned ?? '') === tab)
    const allReviews = reviews.filter((r: BaseItem) => categorize(r.dateReviewed ?? '') === tab)
    const allTasks = tasks.filter((t: BaseItem) => categorize(t.dateReviewed ?? '') === tab)

    // Derive unique topics from the milestones in this time window
    const topicMap: Record<string, string> = {}
    allMilestones.forEach((m: BaseItem) => {
      const id = m.milestone?.topicId ?? 'unknown'
      const name = m.milestone?.topic?.name ?? id
      topicMap[id] = name
    })
    const uniqueTopics = Object.entries(topicMap) // [topicId, topicName]

    const filteredMilestones = applyFilter(
      milestoneTopicFilter === 'all'
        ? allMilestones
        : allMilestones.filter((m: BaseItem) => (m.milestone?.topicId ?? 'unknown') === milestoneTopicFilter),
      milestoneFilter,
      (m: BaseItem) => m.internStatus === true
    )
    const filteredReviews = applyFilter(allReviews, reviewFilter, (r: BaseItem) => r.status === 'COMPLETED')
    const filteredTasks = applyFilter(allTasks, taskFilter, (t: BaseItem) => t.status === 'COMPLETED')

    const totalEmpty = allMilestones.length === 0 && allReviews.length === 0 && allTasks.length === 0

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 animate-pulse opacity-40">
           <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Indexing Timeline...</span>
        </div>
      )
    }

    if (totalEmpty) {
      return (
        <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/40">
            <Info size={24} />
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            No items detected in this sector.
          </p>
        </div>
      )
    }

    return (
      <Tabs defaultValue="milestones" className="mt-1">
        <TabsList className="bg-muted/30 backdrop-blur-sm border border-border/40 p-1.5 h-14 rounded-2xl mb-8 gap-2 w-fit">
          {[
            { value: 'milestones', label: 'Milestones', count: allMilestones.length, icon: BookOpen },
            { value: 'reviews', label: 'Reviews', count: allReviews.length, icon: ClipboardList },
            { value: 'tasks', label: 'Tasks', count: allTasks.length, icon: CheckCircle },
          ].map(({ value, label, count, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/10 px-6 py-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground transition-all gap-2.5"
            >
              <Icon size={16} />
              {label}
              {count > 0 && (
                <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-black border-2 bg-white/10 text-white border-white/20">{count}</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Milestones Sub-tab */}
        <TabsContent value="milestones" className="space-y-3 mt-0">
          {allMilestones.length > 0 && (
            <div className="space-y-6 mb-8">
              {/* Topic chips */}
              {uniqueTopics.length > 1 && (
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setMilestoneTopicFilter('all')}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                      milestoneTopicFilter === 'all'
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    All Sectors
                  </button>
                  {uniqueTopics.map(([tid, tname]) => (
                    <button
                      key={tid}
                      onClick={() => setMilestoneTopicFilter(tid)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        milestoneTopicFilter === tid
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                          : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {tname}
                    </button>
                  ))}
                </div>
              )}
              {/* Status filter */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <SlidersHorizontal size={14} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                      {filteredMilestones.length} Tactical Nodes Detected
                   </p>
                </div>
                <FilterBar
                  value={milestoneFilter}
                  onChange={setMilestoneFilter}
                  counts={{
                    all: (milestoneTopicFilter === 'all' ? allMilestones : allMilestones.filter((m: BaseItem) => (m.milestone?.topicId ?? 'unknown') === milestoneTopicFilter)).length,
                    pending: (milestoneTopicFilter === 'all' ? allMilestones : allMilestones.filter((m: BaseItem) => (m.milestone?.topicId ?? 'unknown') === milestoneTopicFilter)).filter((m: BaseItem) => !m.internStatus).length,
                    completed: (milestoneTopicFilter === 'all' ? allMilestones : allMilestones.filter((m: BaseItem) => (m.milestone?.topicId ?? 'unknown') === milestoneTopicFilter)).filter((m: BaseItem) => m.internStatus).length,
                  }}
                />
              </div>
            </div>
          )}
          {filteredMilestones.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">No matching nodes in this sector.</p>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
              {filteredMilestones.map((m) => (
                <motion.div variants={item} key={m.id}>
                  <Card className={`overflow-hidden border-2 border-muted/50 rounded-[2.5rem] shadow-sm transition-all hover:border-primary/20 ${m.internStatus ? 'opacity-70 bg-muted/20' : 'bg-card'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-6 lg:p-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${m.internStatus ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-primary/10 text-primary'}`}>
                        {m.internStatus
                          ? <CheckCircle2 size={24} />
                          : <BookOpen size={24} />
                        }
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                           <Badge variant="outline" className="h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2">
                             {m.milestone?.topic?.name ?? 'Foundation'}
                           </Badge>
                           <Badge variant="outline" className={`h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 ${m.internStatus ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' : 'bg-orange-500/10 text-orange-600 border-orange-500/10'}`}>
                             {m.internStatus ? 'Synchronized' : 'Encrypted'}
                           </Badge>
                        </div>
                        <h4 className="font-black text-foreground text-lg tracking-tight truncate">{m.milestone?.name}</h4>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                          <CalendarDays size={12} />
                          Assigned: {m.dateAssigned ? format(new Date(m.dateAssigned), 'MMM d, yyyy') : '—'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
                        {!m.internStatus ? (
                          <Button size="lg" className="h-12 text-[11px] font-black uppercase tracking-widest gap-2.5 rounded-2xl px-6 shadow-xl shadow-primary/20 active:scale-95 transition-all" onClick={() => markMilestoneComplete(m.id)}>
                            <Play size={14} fill="currentColor" /> Decrypt Node
                          </Button>
                        ) : (
                          <div className="text-emerald-500 pr-4">
                             <Sparkles size={20} className="animate-pulse" />
                          </div>
                        )}
                      </div>
                    </div>
                    {m.milestone?.content && (
                      <div className="px-8 pb-8 pt-0">
                        <div className="bg-muted/30 rounded-3xl p-6 relative overflow-hidden group/content border border-muted">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/content:opacity-10 transition-opacity">
                              <Info size={48} />
                           </div>
                           <p className="text-xs text-muted-foreground leading-relaxed font-medium relative z-10">{m.milestone.content}</p>
                           {m.milestone?.link && (
                             <Button variant="link" asChild className="p-0 h-auto mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary gap-2 relative z-10">
                               <a href={m.milestone.link} target="_blank" rel="noopener noreferrer">
                                 📎 System Resource Link <ArrowRight size={12} />
                               </a>
                             </Button>
                           )}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* Reviews Sub-tab */}
        <TabsContent value="reviews" className="space-y-6 mt-0">
          {allReviews.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                     <ClipboardList size={14} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                     {filteredReviews.length} Integrity Audits Detected
                  </p>
               </div>
              <FilterBar
                value={reviewFilter}
                onChange={setReviewFilter}
                counts={{
                  all: allReviews.length,
                  pending: allReviews.filter((r) => r.status !== 'COMPLETED').length,
                  completed: allReviews.filter((r) => r.status === 'COMPLETED').length,
                }}
              />
            </div>
          )}
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50">
               <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">No active audits in this sector.</p>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
              {filteredReviews.map((r) => (
                <motion.div variants={item} key={r.id}>
                  <Card className="overflow-hidden border-2 border-muted/50 rounded-[2.5rem] shadow-sm hover:border-blue-500/20 transition-all bg-card">
                    <Collapsible>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-6 lg:p-8">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                          r.status === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                          r.status === 'REOPENED' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          <ClipboardList size={24} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                             <Badge variant="outline" className={`h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 ${
                               r.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' :
                               r.status === 'REOPENED' ? 'bg-amber-500/10 text-amber-600 border-amber-500/10' :
                               'bg-blue-500/10 text-blue-600 border-blue-500/10'
                             }`}>
                               {r.status || 'Scheduled'}
                             </Badge>
                          </div>
                          <h4 className="font-black text-foreground text-lg tracking-tight truncate">{r.title}</h4>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                            <Clock size={12} />
                            {r.dateReviewed ? format(new Date(r.dateReviewed), 'MMM d, yyyy · hh:mm a') : 'Unassigned'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
                          {r.status === 'PENDING' && !r.internStatus && (
                            <Button size="lg" className="h-12 text-[11px] font-black uppercase tracking-widest gap-2.5 rounded-2xl px-6 shadow-xl shadow-primary/20 active:scale-95 transition-all" onClick={() => markReviewReady(r.id)}>
                              <PlayCircle size={14} fill="currentColor" /> Ready for Audit
                            </Button>
                          )}
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-muted/40 hover:bg-muted text-muted-foreground transition-all">
                              <ChevronDown size={20} className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="px-8 pb-8 pt-0 space-y-6">
                          <div className="h-px bg-muted/50 w-full" />
                          {r.description && (
                            <div className="space-y-2">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Briefing</span>
                               <p className="text-xs text-muted-foreground leading-relaxed font-medium bg-muted/20 p-5 rounded-3xl border border-muted">{r.description}</p>
                            </div>
                          )}
                          {getFeedbackArray(r.feedback).length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                 <AlertCircle size={14} className="text-blue-500" />
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Mentorship Intel</span>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {getFeedbackArray(r.feedback).map((fb: any, i: number) => (
                                  <div key={i} className="bg-slate-950/40 backdrop-blur-md rounded-3xl p-5 border border-white/5 shadow-sm hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2.5">
                                         <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-black text-blue-400">
                                            {fb.author?.charAt(0) || 'M'}
                                         </div>
                                         <span className="text-xs font-black text-foreground">{fb.author}</span>
                                      </div>
                                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                        {fb.date ? format(new Date(fb.date), 'MMM d, yyyy') : '—'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium italic border-l-4 border-blue-500/20 pl-4">{fb.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* Tasks Sub-tab */}
        <TabsContent value="tasks" className="space-y-6 mt-0">
          {allTasks.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                     <CheckCircle size={14} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                     {filteredTasks.length} Operational Tasks Active
                  </p>
               </div>
              <FilterBar
                value={taskFilter}
                onChange={setTaskFilter}
                counts={{
                  all: allTasks.length,
                  pending: allTasks.filter((t) => t.status !== 'COMPLETED').length,
                  completed: allTasks.filter((t) => t.status === 'COMPLETED').length,
                }}
              />
            </div>
          )}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50">
               <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">No operational tasks assigned.</p>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
              {filteredTasks.map((t) => (
                <motion.div variants={item} key={t.id}>
                  <Card className="overflow-hidden border-2 border-muted/50 rounded-[2.5rem] shadow-sm hover:border-orange-500/20 transition-all bg-card">
                    <Collapsible>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-6 lg:p-8">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                          t.status === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          <Zap size={24} fill={t.status === 'COMPLETED' ? 'currentColor' : 'none'} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                             <Badge variant="outline" className={`h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 ${
                               t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' : 'bg-orange-500/10 text-orange-600 border-orange-500/10'
                             }`}>
                               {t.status === 'COMPLETED' ? 'MISSION SUCCESS' : 'DEPLOYED'}
                             </Badge>
                          </div>
                          <h4 className="font-black text-foreground text-lg tracking-tight truncate">{t.name}</h4>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                             <Clock size={12} />
                             {t.dateReviewed ? format(new Date(t.dateReviewed), 'MMM d, yyyy · hh:mm a') : '—'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
                          {t.status !== 'COMPLETED' && !t.internStatus && (
                            <Button size="lg" className="h-12 text-[11px] font-black uppercase tracking-widest gap-2.5 rounded-2xl px-6 shadow-xl shadow-orange-500/20 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white border-0" onClick={() => markTaskReady(t.id)}>
                              <Check size={14} /> Execute Task
                            </Button>
                          )}
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-muted/40 hover:bg-muted text-muted-foreground transition-all">
                               <ChevronDown size={20} className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="px-8 pb-8 pt-0 space-y-6">
                           <div className="h-px bg-muted/50 w-full" />
                           {t.description && (
                              <div className="space-y-2">
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Operational Brief</span>
                                 <p className="text-xs text-muted-foreground leading-relaxed font-medium bg-muted/20 p-5 rounded-3xl border border-muted">{t.description}</p>
                              </div>
                           )}
                           {getFeedbackArray(t.feedback).length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                 <Star size={14} className="text-orange-500" />
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Post-Mission Analysis</span>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {getFeedbackArray(t.feedback).map((fb: any, i: number) => (
                                  <div key={i} className="bg-white rounded-3xl p-5 border border-muted shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2.5">
                                         <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-[10px] font-black text-orange-600">
                                            {fb.author?.charAt(0) || 'M'}
                                         </div>
                                         <span className="text-xs font-black text-foreground">{fb.author}</span>
                                      </div>
                                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                        {fb.date ? format(new Date(fb.date), 'MMM d, yyyy') : '—'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{fb.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                           )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <DashboardLayout
      role="intern"
      userName={intern?.name ?? 'Intern'}
      userEmail={intern?.email ?? ''}
      pageTitle="Mission Timeline"
      pageSubtitle="Tactical nodes and review status tracking"
    >
      <div className="space-y-10">
        <Tabs defaultValue="current">
          <TabsList className="bg-muted/30 backdrop-blur-md p-1.5 h-14 rounded-2xl border border-border/20 mb-10 w-fit">
            <TabsTrigger value="current" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg px-8 text-[11px] font-black uppercase tracking-[0.2em] transition-all">Today</TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg px-8 text-[11px] font-black uppercase tracking-[0.2em] transition-all">Archives</TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg px-8 text-[11px] font-black uppercase tracking-[0.2em] transition-all">Horizon</TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key="schedule-content"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="current" className="mt-0">{renderItems('current')}</TabsContent>
              <TabsContent value="past" className="mt-0">{renderItems('past')}</TabsContent>
              <TabsContent value="upcoming" className="mt-0">{renderItems('upcoming')}</TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
