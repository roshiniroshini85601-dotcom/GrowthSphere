'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { StatusBadge } from '@/components/dashboard/role-badge'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useApi } from '@/lib/use-api'
import {
  Plus, MessageSquare, CheckCircle, RotateCcw, Clock, BookOpen, ChevronDown,
  Sparkles, ShieldCheck, AlertCircle, Layers, User, Calendar as CalendarIcon, Loader2, ArrowLeft
} from 'lucide-react'
import type { Employee, Review, Task } from '@/types'

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

type FilterState = 'all' | 'pending' | 'completed'

function FilterBar({ value, onChange, counts }: {
  value: FilterState
  onChange: (v: FilterState) => void
  counts: { all: number; pending: number; completed: number }
}) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/60 w-fit">
      {(['all', 'pending', 'completed'] as FilterState[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 capitalize ${
            value === f
              ? 'bg-background text-foreground shadow-sm border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {f}
          <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
            value === f ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            {counts[f]}
          </span>
        </button>
      ))}
    </div>
  )
}

type ProgressData = {
  milestones: any[]
  reviews: Review[]
  tasks: Task[]
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
}

export default function AdminMenteeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const internId = params.id as string

  const { data: allEmployees } = useApi<Employee[]>('/api/employees')
  const intern = (allEmployees ?? []).find((e) => e.id === internId)

  const { data: progressData, loading, refetch } = useApi<ProgressData>(`/api/mentees/${internId}/progress`)

  const [feedbackTarget, setFeedbackTarget] = React.useState<{ type: 'review' | 'task'; id: string } | null>(null)
  const [feedbackText, setFeedbackText] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('topics')
  const [taskFilter, setTaskFilter] = React.useState<FilterState>('all')
  const [reviewFilter, setReviewFilter] = React.useState<FilterState>('all')
  const [milestoneTopicFilter, setMilestoneTopicFilter] = React.useState<string>('all')

  const reviews = progressData?.reviews ?? []
  const tasks = progressData?.tasks ?? []
  const milestones = progressData?.milestones ?? []

  // Group milestones by topic, storing the name for display
  const milestonesByTopic: Record<string, { name: string; items: any[] }> = {}
  milestones.forEach(m => {
    const topicId = m.milestone?.topicId ?? 'general'
    const topicName = m.milestone?.topic?.name ?? topicId
    if (!milestonesByTopic[topicId]) milestonesByTopic[topicId] = { name: topicName, items: [] }
    milestonesByTopic[topicId].items.push(m)
  })

  async function submitFeedback() {
    if (!feedbackText.trim() || !feedbackTarget) {
      toast.error('Feedback cannot be empty.')
      return
    }
    setSubmitting(true)
    try {
      const endpoint = feedbackTarget.type === 'review' ? `/api/reviews/${feedbackTarget.id}` : `/api/tasks/${feedbackTarget.id}`
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: {
            text: feedbackText.trim(),
            author: 'Admin',
            date: new Date().toISOString().slice(0, 10)
          }
        })
      })
      if (!res.ok) throw new Error()
      toast.success('Feedback added and item reopened.')
      refetch()
      setFeedbackText('')
      setFeedbackTarget(null)
    } catch {
      toast.error('Failed to submit feedback.')
    } finally {
      setSubmitting(false)
    }
  }

  async function markComplete(id: string, type: 'review' | 'task') {
    try {
      const endpoint = type === 'review' ? `/api/reviews/${id}` : `/api/tasks/${id}`
      await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      })
      toast.success('Marked as completed.')
      refetch()
    } catch {
      toast.error('Failed to update status.')
    }
  }

  if (loading) return (
    <DashboardLayout role="admin" pageTitle="Loading" pageSubtitle="Fetching intern details">
      <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-40">
         <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
         <p className="text-sm font-black uppercase tracking-widest">Loading Data...</p>
      </div>
    </DashboardLayout>
  )

  if (!intern) return (
    <DashboardLayout role="admin" pageTitle="Not Found">
       <div className="max-w-md mx-auto py-32 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto">
             <AlertCircle size={40} className="text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
             <h2 className="text-2xl font-black tracking-tight">System Error</h2>
             <p className="text-muted-foreground font-medium">The requested intern profile (ID: {internId}) could not be indexed in our database.</p>
          </div>
          <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold" onClick={() => router.push('/admin/mentees')}>
             Return to Fleet
          </Button>
       </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout
      role="admin"
      userName="Admin"
      userEmail="admin@org.com"
      pageTitle="Intern Profile"
      pageSubtitle="Monitor progress and review submissions"
    >
      <div className="space-y-10">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {/* Enhanced Header Section */}
          <motion.div variants={item} className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-10 lg:p-14 text-white shadow-2xl group border border-white/5">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />
             
             <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start lg:items-center justify-between gap-10">
                <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center gap-8 text-center md:text-left">
                   <div className="relative group">
                      <div className="absolute inset-0 bg-primary/40 rounded-[2.5rem] blur-2xl group-hover:scale-110 transition-transform duration-500" />
                      <div className="relative w-32 h-32 rounded-[2.5rem] bg-white text-slate-900 flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white/10 overflow-hidden ring-4 ring-white/5">
                         {intern.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                         <ShieldCheck size={12} className="text-emerald-400" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Verified Personnel</span>
                      </div>
                      <div className="space-y-2">
                         <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none">{intern.name}</h1>
                         <p className="text-slate-400 font-bold text-lg max-w-md">{intern.collegeName ?? 'Educational Institution'} · {intern.degree ?? 'Curriculum Focus'}</p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
                  <Button variant="ghost" size="sm" className="h-10 px-5 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 font-medium" onClick={() => router.push('/admin/mentees')}>
                    <ArrowLeft size={16} className="mr-2" /> All Interns
                  </Button>
                  <Button className="h-10 px-6 rounded-xl bg-white text-black font-black hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-black/20">
                    Export Profile
                  </Button>
                </div>
             </div>
          </motion.div>

          {/* Navigation and Filters Overlay */}
          <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border-2 border-muted/50 p-4 rounded-[2.5rem] shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="h-16 bg-muted/50 p-1.5 rounded-[1.5rem] border-2 border-muted/50 w-full md:w-auto shadow-sm">
                <TabsTrigger value="topics" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all h-full">Curriculum</TabsTrigger>
                <TabsTrigger value="tasks" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all h-full">Tasks</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all h-full">Reviews</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Content Sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="topics" className="mt-8 space-y-8 outline-none border-none ring-0">
            <motion.div variants={item} className="bg-card border-2 border-muted/50 p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/10 group-hover:rotate-6 transition-transform">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-foreground">Technical Curriculum</h2>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">Knowledge Nodes & Progress</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(milestonesByTopic).length > 1 && (
                    <>
                      <button
                        onClick={() => setMilestoneTopicFilter('all')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          milestoneTopicFilter === 'all'
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                            : 'bg-muted/50 text-muted-foreground border-muted hover:border-primary/40'
                        }`}
                      >
                        Global Network
                      </button>
                      {Object.entries(milestonesByTopic).map(([topicId, { name }]) => (
                        <button
                          key={topicId}
                          onClick={() => setMilestoneTopicFilter(topicId)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            milestoneTopicFilter === topicId
                              ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                              : 'bg-muted/50 text-muted-foreground border-muted hover:border-primary/40'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {Object.keys(milestonesByTopic).length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed border-muted/50"
                  >
                     <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60">No curriculum assigned yet.</p>
                  </motion.div>
                ) : Object.entries(milestonesByTopic)
                    .filter(([topicId]) => milestoneTopicFilter === 'all' || topicId === milestoneTopicFilter)
                    .map(([topicId, { name: topicName, items: ms }]) => {
                  const done = ms.filter((m: any) => m.internStatus).length
                  const total = ms.length
                  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
                  return (
                    <motion.div
                      key={topicId}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden border-2 border-muted/50 hover:border-primary/30 transition-all rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 group">
                        <Collapsible defaultOpen>
                          <div className="p-6 lg:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20 transition-transform group-hover:scale-105">
                                  <BookOpen size={28} className="text-primary" />
                                </div>
                                <div className="space-y-1">
                                  <h3 className="text-2xl font-black tracking-tight text-foreground leading-none">{topicName}</h3>
                                  <div className="flex items-center gap-4 mt-2">
                                     <div className="flex items-center gap-1.5 p-1 bg-emerald-500/10 rounded-full px-2.5 border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{done}/{total} Completed</span>
                                     </div>
                                     <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{pct}% Tracked</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 max-w-xl">
                                <div className="w-full space-y-2">
                                  <Progress value={pct} className="h-3 rounded-full bg-muted shadow-inner overflow-hidden">
                                     <div className="h-full bg-gradient-to-r from-primary via-primary to-blue-400" />
                                  </Progress>
                                </div>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground shrink-0 transition-all">
                                     <ChevronDown size={22} className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                            </div>
                          </div>
                          
                          <CollapsibleContent>
                            <div className="px-6 lg:px-8 pb-8 pt-6 border-t border-muted/50 bg-muted/5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ms.map((m: any) => (
                                  <div key={m.id} className="flex items-center gap-4 p-5 rounded-[2rem] bg-card border border-muted/50 group/item hover:border-primary/30 transition-all hover:translate-x-1 shadow-sm">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${m.internStatus ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-muted text-muted-foreground opacity-40 group-hover/item:opacity-70 group-hover/item:bg-primary/20 group-hover/item:text-primary'}`}>
                                      {m.internStatus ? <CheckCircle size={20} /> : <Clock size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[15px] font-extrabold text-foreground truncate tracking-tight">{m.milestone?.name}</div>
                                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60">Assigned {m.dateAssigned ? format(new Date(m.dateAssigned), 'MMM d, yyyy') : ''}</div>
                                    </div>
                                    <Badge variant="outline" className={`rounded-xl h-8 px-4 font-black text-[9px] uppercase tracking-widest border-2 transition-all ${m.internStatus ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'text-muted-foreground border-muted opacity-40'}`}>
                                      {m.internStatus ? 'Complete' : 'Pending'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-8 space-y-8 outline-none border-none ring-0">
              <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <FilterBar
                  value={taskFilter}
                  onChange={setTaskFilter}
                  counts={{
                    all: tasks.length,
                    pending: tasks.filter(t => t.status.toLowerCase() !== 'completed').length,
                    completed: tasks.filter(t => t.status.toLowerCase() === 'completed').length
                  }}
                />
              </motion.div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {tasks.filter(t => {
                    if (taskFilter === 'pending') return t.status.toLowerCase() !== 'completed'
                    if (taskFilter === 'completed') return t.status.toLowerCase() === 'completed'
                    return true
                  }).length === 0 ? (
                    <motion.div 
                      key="empty-tasks"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50"
                    >
                       <CheckCircle size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60">No matching tasks found.</p>
                    </motion.div>
                  ) : (
                    tasks
                      .filter(t => {
                        if (taskFilter === 'pending') return t.status.toLowerCase() !== 'completed'
                        if (taskFilter === 'completed') return t.status.toLowerCase() === 'completed'
                        return true
                      })
                      .map((t) => (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="group"
                    >
                    <Card className="overflow-hidden border-2 border-muted/50 hover:border-orange-200 transition-all rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-orange-500/5">
                      <Collapsible>
                        <div className="flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-8">
                          <div className="flex-1 w-full flex items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center shrink-0 border-2 border-orange-500/20 group-hover:scale-105 transition-transform">
                              <CheckCircle size={28} className="text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-black tracking-tight text-foreground truncate max-w-sm">{t.name}</h3>
                              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1.5 flex items-center gap-2 opacity-60">
                                <CalendarIcon size={12} />
                                {t.dateReviewed ? format(new Date(t.dateReviewed), 'MMM d, yyyy · hh:mm a') : 'No Date'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 shrink-0 ml-auto lg:ml-0">
                            <StatusBadge status={t.status.toLowerCase()} />
                            {t.internStatus && (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                <Sparkles size={14} className="animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Submission Ready</span>
                              </div>
                            )}
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-muted transition-all">
                                 <ChevronDown size={22} className="transition-transform duration-300 group-data-[state=open]:rotate-180 text-muted-foreground" />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                        
                        <CollapsibleContent>
                          <div className="px-6 lg:px-8 pb-8 pt-8 border-t border-muted/50 bg-muted/5">
                            {t.description && (
                              <div className="bg-background rounded-[2rem] p-6 mb-8 border border-muted shadow-sm">
                                <div className="text-[10px] h-6 flex items-center gap-2 font-black uppercase tracking-widest text-muted-foreground mb-4 opacity-50">
                                   <Layers size={14} /> Description
                                </div>
                                <div className="text-[15px] font-medium text-foreground/80 leading-relaxed tabular-nums">{t.description}</div>
                              </div>
                            )}
                            
                            {getFeedbackArray(t.feedback).length > 0 && (
                              <div className="space-y-4 mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 mb-2">
                                   <MessageSquare size={12} className="text-primary" />
                                   <span className="text-[9px] font-black uppercase tracking-widest text-primary-foreground/60">Feedback History</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {getFeedbackArray(t.feedback).map((fb: any, i: number) => (
                                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm group/fb hover:border-primary/30 transition-all">
                                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                                             <User size={14} className="text-primary" />
                                          </div>
                                          <span className="text-xs font-black text-white/90">{fb.author || 'Admin'}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{fb.date ? format(new Date(fb.date), 'MMM d, yyyy') : '—'}</span>
                                      </div>
                                      <p className="text-[13px] text-white/60 leading-relaxed font-medium">{fb.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-4 pt-4 justify-end">
                              <Button 
                                variant="outline" 
                                className="h-12 rounded-2xl px-8 font-black border-2 hover:bg-background transition-all active:scale-95 group/btn"
                                onClick={() => { setFeedbackTarget({ type: 'task', id: t.id }); setFeedbackText('') }}
                              >
                                <MessageSquare size={16} className="mr-2 group-hover/btn:rotate-12 transition-transform" /> Add Feedback
                              </Button>
                              {t.status.toLowerCase() !== 'completed' && (
                                <Button 
                                  className="h-12 rounded-2xl px-10 font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 active:scale-95 group/check"
                                  onClick={() => markComplete(t.id, 'task')}
                                >
                                  <CheckCircle size={18} className="mr-2 group-hover/check:scale-110 transition-transform" /> Complete Task
                                </Button>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                    </motion.div>
                  ))
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

          <TabsContent value="reviews" className="mt-8 space-y-8 outline-none border-none ring-0">
              <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <FilterBar
                  value={reviewFilter}
                  onChange={setReviewFilter}
                  counts={{
                    all: reviews.length,
                    pending: reviews.filter(r => r.status.toLowerCase() !== 'completed').length,
                    completed: reviews.filter(r => r.status.toLowerCase() === 'completed').length
                  }}
                />
              </motion.div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {reviews.filter(r => {
                    if (reviewFilter === 'pending') return r.status.toLowerCase() !== 'completed'
                    if (reviewFilter === 'completed') return r.status.toLowerCase() === 'completed'
                    return true
                  }).length === 0 ? (
                    <motion.div 
                      key="empty-reviews"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50"
                    >
                       <ShieldCheck size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60">No matching reviews found.</p>
                    </motion.div>
                  ) : (
                    reviews
                      .filter(r => {
                        if (reviewFilter === 'pending') return r.status.toLowerCase() !== 'completed'
                        if (reviewFilter === 'completed') return r.status.toLowerCase() === 'completed'
                        return true
                      })
                      .map((r) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="group"
                    >
                    <Card className="overflow-hidden border-2 border-muted/50 hover:border-blue-200 transition-all rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                      <Collapsible>
                        <div className="flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-8">
                          <div className="flex-1 w-full flex items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center shrink-0 border-2 border-blue-500/20 group-hover:scale-105 transition-transform">
                              <MessageSquare size={28} className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-black tracking-tight text-foreground truncate max-w-sm">{r.title}</h3>
                              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1.5 flex items-center gap-2 opacity-60">
                                <Clock size={12} />
                                {r.dateReviewed ? format(new Date(r.dateReviewed), 'MMM d, yyyy · hh:mm a') : 'No Date'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 shrink-0 ml-auto lg:ml-0">
                            <StatusBadge status={r.status.toLowerCase()} />
                            {r.internStatus && (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                <Sparkles size={14} className="animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Submission Ready</span>
                              </div>
                            )}
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-muted transition-all">
                                 <ChevronDown size={22} className="transition-transform duration-300 group-data-[state=open]:rotate-180 text-muted-foreground" />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                        
                        <CollapsibleContent>
                          <div className="px-6 lg:px-8 pb-8 pt-8 border-t border-muted/50 bg-muted/5">
                            {r.description && (
                              <div className="bg-background rounded-[2rem] p-6 mb-8 border border-muted shadow-sm">
                                <div className="text-[10px] h-6 flex items-center gap-2 font-black uppercase tracking-widest text-muted-foreground mb-4 opacity-50">
                                   <Layers size={14} /> Description
                                </div>
                                <div className="text-[15px] font-medium text-foreground/80 leading-relaxed tabular-nums">{r.description}</div>
                              </div>
                            )}
                            
                            {getFeedbackArray(r.feedback).length > 0 && (
                              <div className="space-y-4 mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 mb-2">
                                   <ShieldCheck size={12} className="text-primary" />
                                   <span className="text-[9px] font-black uppercase tracking-widest text-primary-foreground/60">Review History</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {getFeedbackArray(r.feedback).map((fb: any, i: number) => (
                                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm group/fb hover:border-primary/30 transition-all">
                                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                                             <User size={14} className="text-primary" />
                                          </div>
                                          <span className="text-xs font-black text-white/90">{fb.author || 'Admin'}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{fb.date ? format(new Date(fb.date), 'MMM d, yyyy') : '—'}</span>
                                      </div>
                                      <p className="text-[13px] text-white/60 leading-relaxed font-medium">{fb.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-4 pt-4 justify-end">
                              <Button 
                                variant="outline" 
                                className="h-12 rounded-2xl px-8 font-black border-2 hover:bg-background transition-all active:scale-95 group/btn"
                                onClick={() => { setFeedbackTarget({ type: 'review', id: r.id }); setFeedbackText('') }}
                              >
                                <MessageSquare size={16} className="mr-2 group-hover/btn:rotate-12 transition-transform" /> Add Feedback
                              </Button>
                              {r.status.toLowerCase() !== 'completed' && (
                                <Button 
                                  className="h-12 rounded-2xl px-10 font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 active:scale-95 group/check"
                                  onClick={() => markComplete(r.id, 'review')}
                                >
                                  <CheckCircle size={18} className="mr-2 group-hover/check:scale-110 transition-transform" /> Complete Review
                                </Button>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                    </motion.div>
                  ))
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Dialog open={!!feedbackTarget} onOpenChange={(o) => !o && setFeedbackTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 border-2 border-muted/50 shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
               <MessageSquare size={24} />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black tracking-tight">Add Feedback</DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                Provide notes or instructions for this {feedbackTarget?.type === 'task' ? 'task' : 'review submission'}.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Communication Channel</label>
               <Textarea
                placeholder="Technical feedback or status update..."
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="text-base rounded-2xl border-2 border-muted/50 focus:border-primary/50 bg-muted/20 p-5 font-medium min-h-[160px] resize-none transition-all"
              />
            </div>
          </div>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="ghost" className="rounded-xl h-12 px-8 font-bold text-muted-foreground hover:bg-muted" onClick={() => setFeedbackTarget(null)} disabled={submitting}>Cancel</Button>
            <Button className="rounded-2xl h-12 px-10 font-black shadow-xl shadow-primary/20 active:scale-95 min-w-[140px]" onClick={submitFeedback} disabled={submitting}>
              {submitting ? (
                <><Loader2 size={18} className="mr-2 animate-spin" /> Transmitting...</>
              ) : (
                <><CheckCircle size={18} className="mr-2" /> Submit Feedback</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
