'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MessageSquare, CheckCircle, RotateCcw, User, Plus, Clock, BookOpen, ChevronDown, Sparkles, ShieldCheck, AlertCircle, Layers } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { StatusBadge } from '@/components/dashboard/role-badge'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Loader2, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useApi } from '@/lib/use-api'
import { type Review, type Task } from '@/lib/mock-data'
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

const getFeedbackArray = (fb: unknown): { text: string; date?: string; author?: string }[] => {
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

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

export default function MentorMenteeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const internId = params.id as string

  // Fetch real data
  const { data: authData } = useApi<{ user: { id: string, name: string, email: string } }>('/api/auth/me')
  const { data: intern, loading: internLoading } = useApi<any>(`/api/employees/${internId}`)
  const { data: menteeRelations, loading: menteeRelationsLoading } = useApi<any[]>(
    authData?.user?.id ? `/api/mentors/${authData.user.id}/mentees` : ''
  )
  const { data: topicsData } = useApi<any[]>('/api/topics')
  const { data: progressData, loading: progressLoading, refetch: refetchProgress } = useApi<any>(`/api/mentees/${internId}/progress`)

  const mentor = authData?.user

  // Verify assignment
  const isAssigned = menteeRelations?.some((m) => m.id === internId) || false

  const milestones = progressData?.milestones || []
  const topicsList = topicsData || []
  
  const byTopic = topicsList.map((topic: any) => {
    const msForTopic = milestones.filter((m: { milestone?: { topicId: string } }) => m.milestone?.topicId === topic.id)
    return { topic, milestones: msForTopic }
  }).filter((t: any) => t.milestones.length > 0)

  // Sync local mutable state
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [tasks, setTasks] = React.useState<Task[]>([])

  React.useEffect(() => {
    if (progressData) {
      setReviews(progressData.reviews || [])
      setTasks(progressData.tasks || [])
    }
  }, [progressData])

  const [feedbackTarget, setFeedbackTarget] = React.useState<{ type: 'review' | 'task'; id: string } | null>(null)
  const [feedbackText, setFeedbackText] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('topics')
  const [taskFilter, setTaskFilter] = React.useState<FilterState>('all')
  const [reviewFilter, setReviewFilter] = React.useState<FilterState>('all')
  const [milestoneTopicFilter, setMilestoneTopicFilter] = React.useState<string>('all')

  const [assignmentModal, setAssignmentModal] = React.useState<{ 
    type: 'task' | 'review', 
    title: string, 
    desc: string, 
    targetId: string, 
    dateReviewed: Date | undefined,
    timeOfDay: string,
    loading: boolean
  } | null>(null)
  
  const [assignMilestonesModal, setAssignMilestonesModal] = React.useState(false)
  const [filterTopicId, setFilterTopicId] = React.useState('')
  const [selectedMilestoneIds, setSelectedMilestoneIds] = React.useState<string[]>([])
  const [milestoneDateAssigned, setMilestoneDateAssigned] = React.useState<Date | undefined>(new Date())
  const [assigningMilestones, setAssigningMilestones] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  async function submitFeedback() {
    if (!feedbackText.trim() || !feedbackTarget) {
      toast.error('Feedback cannot be empty.')
      return
    }
    setSubmitting(true)
    const entry = { text: feedbackText.trim(), date: new Date().toISOString().slice(0, 10), author: mentor?.name ?? 'Mentor' }
    try {
      const endpoint = feedbackTarget.type === 'review' ? `/api/reviews/${feedbackTarget.id}` : `/api/tasks/${feedbackTarget.id}`
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: entry })
      })
      if (!res.ok) throw new Error()
      toast.success('Feedback transmission successful.')
      refetchProgress()
      setFeedbackText('')
      setFeedbackTarget(null)
    } catch {
      toast.error('Feedback uplink failed.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAssignMilestones() {
    if (selectedMilestoneIds.length === 0) return toast.error('Select target milestones')
    if (!milestoneDateAssigned) return toast.error('Assignment date required')
    setAssigningMilestones(true)
    try {
      const res = await fetch(`/api/mentees/${internId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneIds: selectedMilestoneIds, dateAssigned: milestoneDateAssigned.toISOString() })
      })
      if (!res.ok) throw new Error('Failed to assign milestones')
      toast.success('Curriculum segments deployed!')
      setAssignMilestonesModal(false)
      setSelectedMilestoneIds([])
      refetchProgress()
    } catch (e: any) {
      toast.error(e.message || 'Deployment error')
    } finally {
      setAssigningMilestones(false)
    }
  }

  async function handleAssign() {
    if (!assignmentModal) return
    if (!assignmentModal.title.trim()) return toast.error('Objective identifier required')
    if (!assignmentModal.dateReviewed) return toast.error('Schedule date required')

    setAssignmentModal(prev => prev ? { ...prev, loading: true } : null)
    try {
      const endpoint = assignmentModal.type === 'task' ? '/api/tasks' : '/api/reviews'
      const finalDate = new Date(assignmentModal.dateReviewed)
      if (assignmentModal.timeOfDay) {
        const [hours, minutes] = assignmentModal.timeOfDay.split(':')
        finalDate.setHours(parseInt(hours, 10))
        finalDate.setMinutes(parseInt(minutes, 10))
      }
      
      const payload: any = {
        [assignmentModal.type === 'task' ? 'name' : 'title']: assignmentModal.title,
        description: assignmentModal.desc,
        dateReviewed: finalDate.toISOString(),
        internId,
        reviewerId: mentor?.id
      }

      if (assignmentModal.type === 'task' && assignmentModal.targetId && assignmentModal.targetId !== 'none') {
        payload.milestoneIds = [assignmentModal.targetId]
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`Failed to assign ${assignmentModal.type}`)
      toast.success(`${assignmentModal.type === 'task' ? 'Task' : 'Review'} deployment confirmed`)
      setAssignmentModal(null)
      refetchProgress()
    } catch (e: any) {
      toast.error(e.message || 'Sync error')
      setAssignmentModal(prev => prev ? { ...prev, loading: false } : null)
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
      toast.success('Objective finalized.')
      refetchProgress()
    } catch {
      toast.error('Status sync failed.')
    }
  }

  if (internLoading || progressLoading || menteeRelationsLoading || !menteeRelations) {
    return (
      <DashboardLayout role="mentor" userName={authData?.user?.name ?? 'Mentor'} userEmail={authData?.user?.email ?? ''} pageTitle="Loading" pageSubtitle="Fetching intern details">
        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-40">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <p className="text-sm font-black uppercase tracking-widest">Loading Data...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!intern || !isAssigned) {
    return (
      <DashboardLayout role="mentor" userName={mentor?.name ?? 'Mentor'} userEmail={mentor?.email ?? ''} pageTitle="Access Denied">
        <div className="text-center py-24 space-y-4">
           <AlertCircle size={48} className="mx-auto text-destructive opacity-40" />
           <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60">Identity not found or unauthorized.</p>
           <Button variant="ghost" onClick={() => router.push('/mentor/mentees')} className="font-bold gap-2">
             <ArrowLeft size={16} /> Return to Network
           </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      role="mentor"
      userName={mentor?.name ?? 'Mentor'}
      userEmail={mentor?.email ?? ''}
      pageTitle="Intern Profile"
      pageSubtitle="Track progress and assign tasks"
    >
      <div className="space-y-10">
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="outline" size="sm" className="h-10 px-6 rounded-2xl font-bold gap-2 border-2 hover:bg-muted" onClick={() => router.push('/mentor/mentees')}>
            <ArrowLeft size={16} /> Network Interface
          </Button>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
          {/* Intern Hero Profile */}
          <motion.div variants={item} className="relative bg-slate-950 rounded-[3rem] p-10 lg:p-14 overflow-hidden shadow-2xl group text-white">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-110" />
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex flex-col md:flex-row items-center gap-10">
                   <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-3xl border-2 border-white/20 flex items-center justify-center relative shadow-2xl">
                      <User size={64} className="text-white opacity-40 group-hover:scale-110 transition-transform" />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary flex items-center justify-center border-4 border-slate-950">
                         <Sparkles size={16} className="text-white" />
                      </div>
                   </div>
                   <div className="text-center md:text-left space-y-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-3">
                           <ShieldCheck size={12} className="text-primary" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/80">Active Subject</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">{intern.name}</h1>
                        <p className="text-slate-400 font-bold text-lg lg:text-xl mt-2 flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-1">
                          <span>{intern.collegeName}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 hidden md:block" />
                          <span className="text-slate-500">{intern.degree || 'Advanced Studies'}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                         <Badge className="h-8 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all cursor-default">
                           UID: #{intern.id.padStart(4, '0')}
                         </Badge>
                         <Badge className="h-8 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold cursor-default">
                           {intern.status || 'OPERATIONAL'}
                         </Badge>
                      </div>
                   </div>
                </div>

                <div className="hidden lg:flex flex-col items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] min-w-[240px]">
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Aggregate Growth</div>
                   <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                         <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                         <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={264} strokeDashoffset={264 - (264 * 72) / 100} className="text-primary" />
                      </svg>
                      <span className="absolute text-2xl font-black">72%</span>
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-2">Target Optimized</div>
                </div>
             </div>
          </motion.div>

          {/* Navigation & Controls */}
          <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="h-16 bg-muted/50 p-1.5 rounded-[1.5rem] border-2 border-muted/50 w-full md:w-auto shadow-sm">
                <TabsTrigger value="topics" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all h-full">Curriculum</TabsTrigger>
                <TabsTrigger value="tasks" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all h-full">Tasks</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all h-full">Reviews</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Topics/Curriculum tab */}
            <TabsContent value="topics" className="mt-8 space-y-8 outline-none border-none ring-0">
              <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={milestoneTopicFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setMilestoneTopicFilter('all')}
                    className="rounded-xl h-10 px-6 font-bold transition-all text-xs uppercase tracking-widest border-2"
                  >
                    All Modules
                  </Button>
                  {byTopic.map(({ topic }) => (
                    <Button
                      key={topic.id}
                      variant={milestoneTopicFilter === topic.id ? 'default' : 'outline'}
                      onClick={() => setMilestoneTopicFilter(topic.id)}
                      className="rounded-xl h-10 px-6 font-bold transition-all text-xs uppercase tracking-widest border-2"
                    >
                      {topic.name}
                    </Button>
                  ))}
                </div>
                <Button 
                  onClick={() => {
                    setFilterTopicId('')
                    setSelectedMilestoneIds([])
                    setAssignMilestonesModal(true)
                  }}
                  className="rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all active:scale-95 gap-2"
                >
                  <Plus size={18} /> Provision Resources
                </Button>
              </motion.div>

              <div className="grid grid-cols-1 gap-8">
                <AnimatePresence mode="popLayout">
                  {byTopic.filter(t => milestoneTopicFilter === 'all' || t.topic.id === milestoneTopicFilter).length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted/50"
                    >
                       <Layers size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60">No curriculum nodes assigned.</p>
                    </motion.div>
                  ) : (
                    byTopic
                      .filter(t => milestoneTopicFilter === 'all' || t.topic.id === milestoneTopicFilter)
                      .map(({ topic, milestones: ms }) => {
                        const done = ms.filter((m: any) => m.internStatus).length
                        const total = ms.length
                        const pct = total === 0 ? 0 : Math.round((done / total) * 100)
                        
                        return (
                          <motion.div
                            layout
                            key={topic.id}
                            variants={item}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-primary/10 transition-all group"
                          >
                            <Collapsible defaultOpen>
                              <div className="flex flex-col md:flex-row md:items-center gap-8">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
                                   <BookOpen size={28} />
                                </div>
                                <div className="flex-1 space-y-2">
                                   <h3 className="text-2xl font-black tracking-tight text-foreground">{topic.name}</h3>
                                   <div className="flex items-center gap-4">
                                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                         <motion.div 
                                           initial={{ width: 0 }} 
                                           animate={{ width: `${pct}%` }} 
                                           transition={{ duration: 1, ease: "easeOut" }}
                                           className="h-full bg-primary" 
                                         />
                                      </div>
                                      <span className="text-sm font-black text-primary w-12">{pct}%</span>
                                   </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <Badge variant="outline" className={cn("rounded-xl px-4 py-1.5 font-bold uppercase tracking-wider text-[10px] border-2", pct === 100 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-muted/50 border-muted text-muted-foreground")}>
                                      {pct === 100 ? 'Verified' : `${done}/${total} Nodes`}
                                   </Badge>
                                   <CollapsibleTrigger asChild>
                                      <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-muted transition-colors">
                                         <ChevronDown size={20} className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                      </Button>
                                   </CollapsibleTrigger>
                                </div>
                              </div>

                              <CollapsibleContent>
                                <div className="mt-10 pt-10 border-t-2 border-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {ms.map((m: any, idx: number) => (
                                      <div key={m.id} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-muted/20 border-2 border-transparent hover:border-primary/10 hover:bg-muted/40 transition-all">
                                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", m.internStatus ? "bg-emerald-500 text-white" : "bg-white text-muted-foreground/40")}>
                                            {m.internStatus ? <CheckCircle size={18} /> : <span className="font-black text-xs">{idx + 1}</span>}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-foreground truncate">{m.milestone?.name}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60">
                                               Modified: {m.dateAssigned ? format(new Date(m.dateAssigned), 'MMM d, yyyy') : 'No Date'}
                                            </div>
                                         </div>
                                         <Badge className={cn("rounded-lg text-[9px] font-black uppercase tracking-tighter", m.internStatus ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600")}>
                                            {m.internStatus ? 'Active' : 'Awaiting'}
                                         </Badge>
                                      </div>
                                   ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </motion.div>
                        )
                      })
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>


            {/* Tasks/Objectives tab */}
            <TabsContent value="tasks" className="mt-8 space-y-8 outline-none border-none ring-0">
              <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <FilterBar
                  value={taskFilter}
                  onChange={setTaskFilter}
                  counts={{
                    all: tasks.length,
                    pending: tasks.filter(t => t.status.toUpperCase() !== 'COMPLETED').length,
                    completed: tasks.filter(t => t.status.toUpperCase() === 'COMPLETED').length
                  }}
                />
                <Button 
                  onClick={() => setAssignmentModal({ type: 'task', title: '', desc: '', targetId: '', dateReviewed: new Date(), timeOfDay: format(new Date(), 'HH:mm'), loading: false })}
                  className="rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all active:scale-95 gap-2"
                >
                  <Plus size={18} /> New Task
                </Button>
              </motion.div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {tasks.filter(t => {
                    if (taskFilter === 'pending') return t.status.toUpperCase() !== 'COMPLETED'
                    if (taskFilter === 'completed') return t.status.toUpperCase() === 'COMPLETED'
                    return true
                  }).length === 0 ? (
                    <motion.div 
                      layout
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
                        if (taskFilter === 'pending') return t.status.toUpperCase() !== 'COMPLETED'
                        if (taskFilter === 'completed') return t.status.toUpperCase() === 'COMPLETED'
                        return true
                      })
                      .map((t) => (
                        <motion.div
                          layout
                          key={t.id}
                          variants={item}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-card border-2 border-muted/30 rounded-[2.2rem] overflow-hidden group hover:border-primary/10 transition-all shadow-sm hover:shadow-xl"
                        >
                          <Collapsible>
                            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0 group-hover:rotate-12 transition-transform shadow-sm">
                                   <Clock size={24} />
                                </div>
                                <div className="min-w-0">
                                   <h4 className="text-xl font-black tracking-tight text-foreground truncate">{t.name}</h4>
                                   <div className="flex items-center gap-2 mt-1 opacity-60">
                                      <CalendarIcon size={12} className="text-muted-foreground" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">
                                         {t.dateReviewed ? format(new Date(t.dateReviewed), 'MMM d, yyyy · hh:mm a') : 'Unscheduled'}
                                      </span>
                                   </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 ml-auto md:ml-0">
                                 <StatusBadge status={t.status} />
                                 {t.internStatus && (
                                   <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Ready for Audit
                                   </div>
                                 )}
                                 <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-muted transition-colors">
                                       <ChevronDown size={18} className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                    </Button>
                                 </CollapsibleTrigger>
                              </div>
                            </div>
                            
                            <CollapsibleContent>
                              <div className="px-6 pb-8 pt-6 border-t-2 border-muted/50 bg-muted/10">
                                {t.description && (
                                  <div className="mb-8 p-6 bg-background rounded-[1.5rem] border-2 border-muted/50 text-sm font-medium text-muted-foreground leading-relaxed shadow-inner">
                                     {t.description}
                                  </div>
                                )}
                                
                                {getFeedbackArray(t.feedback).length > 0 && (
                                  <div className="space-y-4 mb-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 mb-2">
                                       <MessageSquare size={12} className="text-primary" />
                                       <span className="text-[9px] font-black uppercase tracking-widest text-primary-foreground/60">Communication Log</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {getFeedbackArray(t.feedback).map((fb: any, i: number) => (
                                        <div key={i} className="bg-background rounded-[1.5rem] p-5 border-2 border-muted/50 hover:border-primary/5 transition-all shadow-sm">
                                          <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-foreground flex items-center gap-2 uppercase tracking-widest opacity-80">
                                              <User size={12} className="text-primary" />
                                              {fb.author || 'System'}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">{fb.date ? format(new Date(fb.date), 'MMM d, yyyy') : '—'}</span>
                                          </div>
                                          <p className="text-xs font-medium text-foreground/70 leading-relaxed italic">&ldquo;{fb.text}&rdquo;</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex gap-3 flex-wrap">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-10 rounded-xl px-6 font-bold border-2 hover:bg-background transition-all"
                                    onClick={() => { setFeedbackTarget({ type: 'task', id: t.id }); setFeedbackText('') }}
                                  >
                                    <MessageSquare size={14} className="mr-2" /> Send Message
                                  </Button>
                                  {t.status.toUpperCase() !== 'COMPLETED' && (
                                    <Button 
                                      size="sm" 
                                      className="h-10 rounded-xl px-6 font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                      onClick={() => markComplete(t.id, 'task')}
                                    >
                                      <CheckCircle size={14} className="mr-2" /> Mark Completed
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </motion.div>
                      ))
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* Reviews/Audits tab */}
            <TabsContent value="reviews" className="mt-8 space-y-8 outline-none border-none ring-0">
              <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <FilterBar
                  value={reviewFilter}
                  onChange={setReviewFilter}
                  counts={{
                    all: reviews.length,
                    pending: reviews.filter(r => r.status.toUpperCase() !== 'COMPLETED').length,
                    completed: reviews.filter(r => r.status.toUpperCase() === 'COMPLETED').length
                  }}
                />
                <Button 
                  onClick={() => setAssignmentModal({ type: 'review', title: '', desc: '', targetId: '', dateReviewed: new Date(), timeOfDay: format(new Date(), 'HH:mm'), loading: false })}
                  className="rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all active:scale-95 gap-2"
                >
                  <Plus size={18} /> Schedule Review
                </Button>
              </motion.div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {reviews.filter(r => {
                    if (reviewFilter === 'pending') return r.status.toUpperCase() !== 'COMPLETED'
                    if (reviewFilter === 'completed') return r.status.toUpperCase() === 'COMPLETED'
                    return true
                  }).length === 0 ? (
                    <motion.div 
                      layout
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
                        if (reviewFilter === 'pending') return r.status.toUpperCase() !== 'COMPLETED'
                        if (reviewFilter === 'completed') return r.status.toUpperCase() === 'COMPLETED'
                        return true
                      })
                      .map((r) => (
                        <motion.div
                          layout
                          key={r.id}
                          variants={item}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-card border-2 border-muted/30 rounded-[2.2rem] overflow-hidden group hover:border-primary/10 transition-all shadow-sm hover:shadow-xl"
                        >
                          <Collapsible>
                            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 group-hover:rotate-12 transition-transform shadow-sm">
                                   <MessageSquare size={24} />
                                </div>
                                <div className="min-w-0">
                                   <h4 className="text-xl font-black tracking-tight text-foreground truncate">{r.title}</h4>
                                   <div className="flex items-center gap-2 mt-1 opacity-60">
                                      <Clock size={12} className="text-muted-foreground" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">
                                         {r.dateReviewed ? format(new Date(r.dateReviewed), 'MMM d, yyyy · hh:mm a') : 'Unscheduled'}
                                      </span>
                                   </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 ml-auto md:ml-0">
                                 <StatusBadge status={r.status} />
                                 {r.internStatus && (
                                   <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Evidence Uploaded
                                   </div>
                                 )}
                                 <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-muted transition-colors">
                                       <ChevronDown size={18} className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                    </Button>
                                 </CollapsibleTrigger>
                              </div>
                            </div>
                            
                            <CollapsibleContent>
                              <div className="px-6 pb-8 pt-6 border-t-2 border-muted/50 bg-muted/10">
                                {r.description && (
                                  <div className="mb-8 p-6 bg-background rounded-[1.5rem] border-2 border-muted/50 text-sm font-medium text-muted-foreground leading-relaxed shadow-inner">
                                     {r.description}
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
                                        <div key={i} className="bg-background rounded-[1.5rem] p-5 border-2 border-muted/50 hover:border-primary/5 transition-all shadow-sm">
                                          <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-foreground flex items-center gap-2 uppercase tracking-widest opacity-80">
                                              <User size={12} className="text-primary" />
                                              {fb.author || 'Senior Mentor'}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">{fb.date ? format(new Date(fb.date), 'MMM d, yyyy') : '—'}</span>
                                          </div>
                                          <p className="text-xs font-medium text-foreground/70 leading-relaxed italic">&ldquo;{fb.text}&rdquo;</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex gap-3 flex-wrap">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-10 rounded-xl px-6 font-bold border-2 hover:bg-background transition-all"
                                    onClick={() => { setFeedbackTarget({ type: 'review', id: r.id }); setFeedbackText('') }}
                                  >
                                    <MessageSquare size={14} className="mr-2" /> Send Review
                                  </Button>
                                  {r.status.toUpperCase() !== 'COMPLETED' && (
                                    <Button 
                                      size="sm" 
                                      className="h-10 rounded-xl px-6 font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                      onClick={() => markComplete(r.id, 'review')}
                                    >
                                      <CheckCircle size={14} className="mr-2" /> Mark Completed
                                    </Button>
                                  )}
                                  {r.status.toUpperCase() === 'COMPLETED' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-10 rounded-xl px-6 font-bold border-2 text-amber-600 border-amber-500/30 hover:bg-amber-50 transition-all"
                                      onClick={async () => {
                                        try {
                                          await fetch(`/api/reviews/${r.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: 'REOPENED' })
                                          })
                                          toast.info('Session Resumed')
                                          refetchProgress()
                                        } catch {
                                          toast.error('Re-initialization failed')
                                        }
                                      }}
                                    >
                                      <RotateCcw size={14} className="mr-2" /> Reopen Stream
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </motion.div>
                      ))
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={!!feedbackTarget} onOpenChange={(o) => !o && setFeedbackTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Feedback</DialogTitle>
            <DialogDescription>Write your feedback for this {feedbackTarget?.type}.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter your feedback here..."
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setFeedbackTarget(null)} disabled={submitting}>Cancel</Button>
            <Button onClick={submitFeedback} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Assign Milestones Modal */}
      <Dialog open={assignMilestonesModal} onOpenChange={setAssignMilestonesModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Assign Milestones</DialogTitle>
            <DialogDescription>
              Assign specific milestones to {intern?.name}. Choose a topic to view its milestones.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Filter by Topic</label>
              <Select value={filterTopicId} onValueChange={(val) => {
                setFilterTopicId(val)
                // Optional: Clear selection when changing topics if you don't want cross-topic assignments
                // setSelectedMilestoneIds([]) 
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_topics_reset">All Topics</SelectItem>
                  {topicsList.map(topic => (
                    <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 py-2 border-y border-border">
              <label className="text-sm font-medium">Select Milestones</label>
              {topicsList.length === 0 ? (
                 <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded text-center">No topics available.</div>
              ) : (
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
                  {topicsList
                    .filter(t => !filterTopicId || filterTopicId === 'all_topics_reset' || t.id === filterTopicId)
                    .map(topic => (
                      <div key={topic.id} className="space-y-2">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider sticky top-0 bg-background py-1 z-10">{topic.name}</div>
                        {topic.milestones?.length === 0 ? (
                           <div className="text-xs text-muted-foreground italic pl-2">No milestones in this topic</div>
                        ) : (
                          topic.milestones?.map((ms: any) => {
                            const isSelected = selectedMilestoneIds.includes(ms.id)
                            return (
                              <div key={ms.id} className="flex items-start space-x-3 pl-2 py-1">
                                <Checkbox 
                                  id={`ms-${ms.id}`} 
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedMilestoneIds(prev => [...prev, ms.id])
                                    } else {
                                      setSelectedMilestoneIds(prev => prev.filter(id => id !== ms.id))
                                    }
                                  }}
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <label
                                    htmlFor={`ms-${ms.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {ms.name}
                                  </label>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Assignment Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !milestoneDateAssigned && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {milestoneDateAssigned ? format(milestoneDateAssigned, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={milestoneDateAssigned}
                    onSelect={setMilestoneDateAssigned}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="shrink-0 mt-2 border-t pt-4">
            <div className="flex items-center flex-1">
               <span className="text-xs text-muted-foreground">{selectedMilestoneIds.length} milestone(s) selected</span>
            </div>
            <Button variant="outline" onClick={() => setAssignMilestonesModal(false)} disabled={assigningMilestones}>Cancel</Button>
            <Button onClick={handleAssignMilestones} disabled={assigningMilestones || selectedMilestoneIds.length === 0}>
              {assigningMilestones && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Milestones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog open={!!assignmentModal} onOpenChange={(o) => (!o && setAssignmentModal(null))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign {assignmentModal?.type === 'task' ? 'Task' : 'Review'}</DialogTitle>
            <DialogDescription>
              Assign a new {assignmentModal?.type === 'task' ? 'task' : 'review'} to {intern?.name}. Choose a milestone to link it to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            
            {/* Target ID -> Now links to actual Intern Milestones */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Linked Milestone (Optional)</label>
              <Select value={assignmentModal?.targetId} onValueChange={(val) => setAssignmentModal(prev => prev ? { ...prev, targetId: val } : null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a milestone..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (General)</SelectItem>
                  {byTopic.map(({ topic, milestones: ms }) => (
                    <SelectGroup key={`sg-${topic.id}`}>
                      <SelectLabel className="font-semibold text-primary">{topic.name}</SelectLabel>
                      {ms.map((m: any) => (
                        <SelectItem key={`ms-${m.milestoneId}`} value={m.milestoneId} className="pl-6">
                          {m.milestone?.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{assignmentModal?.type === 'task' ? 'Task Name' : 'Review Title'} *</label>
              <Input 
                placeholder={assignmentModal?.type === 'task' ? 'e.g. Build API endpoint' : 'e.g. UI Component Review'} 
                value={assignmentModal?.title || ''}
                onChange={(e) => setAssignmentModal(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea 
                placeholder="Details..."
                rows={3}
                value={assignmentModal?.desc || ''}
                onChange={(e) => setAssignmentModal(prev => prev ? { ...prev, desc: e.target.value } : null)}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Assignment Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !assignmentModal?.dateReviewed && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {assignmentModal?.dateReviewed ? format(assignmentModal.dateReviewed, 'MMM d, yyyy') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={assignmentModal?.dateReviewed}
                      onSelect={(d) => setAssignmentModal(prev => prev ? { ...prev, dateReviewed: d } : null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Time *</label>
                <Input 
                  type="time" 
                  className="w-full"
                  value={assignmentModal?.timeOfDay || ''}
                  onChange={(e) => setAssignmentModal(prev => prev ? { ...prev, timeOfDay: e.target.value } : null)}
                />
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentModal(null)} disabled={assignmentModal?.loading}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assignmentModal?.loading}>
              {assignmentModal?.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  )
}
