'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus, Trash2, CheckCircle2, Loader2, Edit3, Sparkles, AlertCircle
} from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useApi } from '@/lib/use-api'

const milestoneSchema = z.object({
  name: z.string().min(2, 'Milestone name is required'),
  content: z.string().optional(),
  link: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

const wizardSchema = z.object({
  topicName: z.string().min(2, 'Topic name is required'),
  milestones: z.array(milestoneSchema).min(1, 'At least one milestone is required'),
})

type WizardValues = z.infer<typeof wizardSchema>

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVars: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

export default function EditTopicPage() {
  const router = useRouter()
  const params = useParams()
  const topicId = params.id as string

  const { data: authData } = useApi<{ user: { id: string; name: string; email: string } }>('/api/auth/me')
  const { data: topics } = useApi<any[]>('/api/topics')

  const [submitting, setSubmitting] = React.useState(false)
  const [initialized, setInitialized] = React.useState(false)

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      topicName: '',
      milestones: [{ name: '', content: '', link: '' }],
    },
  })

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone, replace } =
    useFieldArray({ control: form.control, name: 'milestones' })

  // Pre-fill form when topic data is loaded
  React.useEffect(() => {
    if (topics && !initialized) {
      const topic = topics.find((t: any) => t.id === topicId)
      if (topic) {
        form.setValue('topicName', topic.name)
        if (topic.milestones?.length > 0) {
          replace(topic.milestones.map((m: any) => ({
            name: m.name || '',
            content: m.content || '',
            link: m.link || '',
          })))
        }
        setInitialized(true)
      }
    }
  }, [topics, topicId, initialized, form, replace])

  async function handleSave(values: WizardValues) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.topicName,
          milestones: values.milestones,
        }),
      })
      if (!res.ok) throw new Error('Failed to update topic')
      toast.success('Module configuration updated!')
      router.push('/mentor/topics')
    } catch (err: any) {
      toast.error(err.message || 'Transmission update failed')
    } finally {
      setSubmitting(false)
    }
  }

  const mentor = authData?.user

  return (
    <DashboardLayout
      role="mentor"
      userName={mentor?.name ?? 'Mentor'}
      userEmail={mentor?.email ?? ''}
      pageTitle="Edit Topic"
      pageSubtitle="Update the existing training topic"
    >
      <div className="max-w-4xl mx-auto pb-32">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <motion.div 
              variants={containerVars}
              initial="hidden"
              animate="show"
              className="space-y-10"
            >
              {/* Header Visual */}
              <motion.div variants={itemVars} className="relative bg-slate-950 rounded-[3rem] p-12 overflow-hidden shadow-2xl group min-h-[320px] flex items-center">
                 <div className="absolute inset-0 z-0">
                    <img 
                      src="/topics-hero.png" 
                      alt="Hero" 
                      className="w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                 </div>
                 
                 <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 text-center md:text-left">
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/20 backdrop-blur-md">
                          <Sparkles size={12} className="text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Configuration Interface</span>
                       </div>
                       <div className="space-y-2">
                       <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white leading-none">Edit <span className="text-primary">Topic</span></h1>
                       <p className="text-slate-400 font-bold text-lg max-w-md leading-relaxed">Update the training topic for your interns.</p>
                       </div>
                    </div>
                    <div className="hidden lg:flex w-40 h-40 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 items-center justify-center text-white rotate-6 hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-primary/20">
                       <Edit3 size={64} className="opacity-40" />
                    </div>
                 </div>
                 
                 {/* Decorative elements */}
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mb-32 animate-pulse" />
              </motion.div>

              {/* Basic Section */}
              <motion.div variants={itemVars} className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Topic Details</h2>
                </div>
                
                <FormField control={form.control} name="topicName" render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-lg font-black tracking-tight ml-1">Topic Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Advanced System Architecture" className="h-14 rounded-2xl border-2 border-muted/50 bg-muted/20 px-6 font-bold focus-visible:border-primary transition-all text-base" {...field} />
                    </FormControl>
                    <FormMessage className="font-bold text-xs" />
                  </FormItem>
                )} />
              </motion.div>

              {/* Milestones Section */}
              <motion.div variants={itemVars} className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                     <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Milestones</h2>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="rounded-xl font-bold h-9 px-4 gap-2 border-2" onClick={() => appendMilestone({ name: '', content: '', link: '' })}>
                    <Plus size={14} /> Add Milestone
                  </Button>
                </div>

                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {milestoneFields.map((field, idx) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        key={field.id}
                        className="group relative bg-muted/30 border-2 border-transparent hover:border-primary/10 rounded-[2rem] p-6 lg:p-8 transition-all"
                      >
                        <div className="flex items-start justify-between gap-6 mb-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-primary text-sm border border-border/50">
                                {idx + 1}
                              </div>
                              <h3 className="font-extrabold text-foreground tracking-tight">Milestone</h3>
                           </div>
                           {milestoneFields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all" onClick={() => removeMilestone(idx)}>
                              <Trash2 size={16} />
                            </Button>
                           )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name={`milestones.${idx}.name`} render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-[11px] font-bold text-muted-foreground ml-1 uppercase tracking-widest">Descriptor *</FormLabel>
                              <FormControl><Input placeholder="Objective name" className="h-12 border-2 border-muted/50 rounded-xl bg-background/50 focus-visible:border-primary transition-all font-bold px-5" {...field} /></FormControl>
                              <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                          )} />
                          
                          <FormField control={form.control} name={`milestones.${idx}.link`} render={({ field }) => (
                            <FormItem className="md:col-span-1">
                              <FormLabel className="text-[11px] font-bold text-muted-foreground ml-1 uppercase tracking-widest">Reference URL</FormLabel>
                              <FormControl><Input placeholder="https://resource.com" className="h-12 border-2 border-muted/50 rounded-xl bg-background/50 focus-visible:border-primary transition-all font-bold px-5" {...field} /></FormControl>
                              <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name={`milestones.${idx}.content`} render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-[11px] font-bold text-muted-foreground ml-1 uppercase tracking-widest">Description</FormLabel>
                              <FormControl><Textarea placeholder="Define secondary objectives or notes..." rows={3} className="border-2 border-muted/50 rounded-2xl bg-background/50 focus-visible:border-primary transition-all font-medium px-5 py-4 resize-none" {...field} /></FormControl>
                              <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                          )} />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex justify-center pt-4">
                  <Button type="button" variant="ghost" className="rounded-full px-8 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/5" onClick={() => appendMilestone({ name: '', content: '', link: '' })}>
                    <Plus size={14} className="mr-2" /> Add New Milestone
                  </Button>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVars} className="flex items-center justify-between gap-6 pt-6 bg-card border-2 border-muted/50 rounded-[2.5rem] p-6 shadow-sm">
                <div className="hidden sm:flex items-center gap-3 text-muted-foreground/60 px-4">
                   <AlertCircle size={16} />
                   <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Changes are updated for all assigned interns.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="ghost" className="rounded-xl h-12 px-8 font-bold text-muted-foreground hover:bg-muted" onClick={() => router.push('/mentor/topics')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="rounded-2xl h-12 px-10 font-black shadow-xl shadow-primary/20 transition-all active:scale-95 min-w-[180px]">
                    {submitting ? (
                      <><Loader2 size={18} className="mr-2 animate-spin" /> Persisting...</>
                    ) : (
                      <><CheckCircle2 size={18} className="mr-2" /> Save Changes</>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  )
}
