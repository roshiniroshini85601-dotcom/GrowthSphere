'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, BookOpen, Edit2, Trash2, Layers, Search, ArrowUpRight } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { Button } from '@/components/ui/button'
import { useApi } from '@/lib/use-api'
import { cn } from '@/lib/utils'

type Topic = { id: string; name: string; milestones: { id: string; name: string }[] }

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const item: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

export default function MentorTopicsPage() {
  const router = useRouter()
  const { data: topics, loading, refetch } = useApi<Topic[]>('/api/topics')
  const { data: authData } = useApi<{ user: { id: string; name: string; email: string } }>('/api/auth/me')

  const currentMentor = authData?.user

  async function handleDeleteTopic(id: string, name: string) {
    try {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success(`"${name}" has been deleted.`)
      refetch()
    } catch {
      toast.error('Failed to delete topic. Please try again.')
    }
  }

  return (
    <DashboardLayout
      role="mentor"
      userName={currentMentor?.name ?? 'Mentor'}
      userEmail={currentMentor?.email ?? ''}
      pageTitle="Training Topics"
      pageSubtitle="Create and manage training topics for your interns"
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* Header Action Area */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border-2 border-muted/50 p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/10 transition-transform group-hover:rotate-6">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">Topics List</h2>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">Training Structure</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push('/mentor/topics/new')} 
            className="rounded-2xl h-12 px-8 font-black gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all relative z-10"
          >
            <Plus size={18} /> New Topic
          </Button>
        </motion.div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-black uppercase tracking-widest">Loading Topics...</p>
          </div>
        )}

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(topics ?? []).map((topic) => (
            <motion.div 
              key={topic.id} 
              variants={item}
              className="group relative bg-card border-2 border-muted/50 rounded-[2.5rem] p-7 transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer"
              onClick={() => router.push(`/mentor/topics/${topic.id}`)}
            >
              {/* Card Decoration */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight size={20} className="text-primary" />
              </div>

              <div className="space-y-6">
                <div className="w-14 h-14 rounded-[1.5rem] bg-muted/30 flex items-center justify-center text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary">
                  <BookOpen size={28} />
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
                    {topic.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-3">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border border-muted/50 px-2 py-0.5 rounded-lg">
                       {topic.milestones?.length ?? 0} Milestones
                     </span>
                     <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Topic</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                    onClick={(e) => { e.stopPropagation(); router.push(`/mentor/topics/${topic.id}`) }}
                   >
                     <Edit2 size={16} />
                   </Button>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id, topic.name) }}
                   >
                     <Trash2 size={16} />
                   </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && (topics ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-muted rounded-[3rem] opacity-40">
             <div className="w-16 h-16 rounded-3xl bg-muted/20 flex items-center justify-center mb-4">
                <Search size={32} />
             </div>
             <p className="text-sm font-black uppercase tracking-widest">Repository Empty</p>
             <p className="text-xs font-medium mt-1">Initialize your first training module to begin.</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
