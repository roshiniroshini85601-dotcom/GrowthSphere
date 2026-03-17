'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ShieldCheck, UserCircle, GraduationCap, Users } from 'lucide-react'

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  contactNo: z.string().min(10, 'Contact number must be at least 10 digits'),
  role: z.enum(['ADMIN', 'INTERN', 'MENTOR']),
  address: z.string().min(5, 'Address is required'),
  collegeName: z.string().min(2, 'College name is required'),
  degree: z.string().min(2, 'Degree is required'),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>

const roleOptions = [
  { value: 'INTERN', label: 'Intern', icon: <GraduationCap size={20} />, description: 'A student undergoing training' },
  { value: 'MENTOR', label: 'Mentor', icon: <Users size={20} />, description: 'A guide/teacher for interns' },
  { value: 'ADMIN', label: 'Admin', icon: <ShieldCheck size={20} />, description: 'Full system management access' },
]

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues>
  onSubmit: (values: EmployeeFormValues) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVars = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export function EmployeeForm({ defaultValues, onSubmit, onCancel, isEdit = false }: EmployeeFormProps) {
  const [loading, setLoading] = React.useState(false)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      password: '',
      contactNo: defaultValues?.contactNo ?? '',
      role: (defaultValues?.role as EmployeeFormValues['role']) ?? 'INTERN',
      address: defaultValues?.address ?? '',
      collegeName: defaultValues?.collegeName ?? '',
      degree: defaultValues?.degree ?? '',
    },
  })

  async function handleSubmit(values: EmployeeFormValues) {
    setLoading(true)
    try {
      await onSubmit(values)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {/* Section: Role Selection */}
          <motion.div variants={itemVars} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">System Role</label>
            </div>
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem className="space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roleOptions.map((opt) => {
                    const active = field.value === opt.value
                    return (
                      <div
                        key={opt.value}
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          "relative cursor-pointer p-4 rounded-[1.5rem] border-2 transition-all duration-300 group overflow-hidden",
                          active 
                            ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                            : "bg-muted/30 border-muted-foreground/10 hover:border-primary/40 text-foreground"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-colors",
                          active ? "bg-white/20 text-white" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                        )}>
                          {opt.icon}
                        </div>
                        <div className="font-extrabold text-[14px] leading-tight mb-1">{opt.label}</div>
                        <div className={cn("text-[10px] font-medium leading-snug", active ? "text-white/70" : "text-muted-foreground")}>
                          {opt.description}
                        </div>
                        {active && (
                          <motion.div 
                            layoutId="active-check"
                            className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg"
                          >
                            <ShieldCheck size={12} className="text-primary" />
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <FormMessage className="mt-2 text-xs font-bold" />
              </FormItem>
            )} />
          </motion.div>

          {/* Section: Personal Info */}
          <motion.div variants={itemVars} className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Credentials & Contact</label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground ml-1">Full Identity</FormLabel>
                  <FormControl><Input placeholder="e.g. Arjun Sharma" className="rounded-2xl h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all" {...field} /></FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground ml-1">Email Protocol</FormLabel>
                  <FormControl><Input type="email" placeholder="arjun@growth.com" className="rounded-2xl h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all" {...field} /></FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground ml-1">
                    Security Key {isEdit && <span className="opacity-50">(optional)</span>}
                  </FormLabel>
                  <FormControl><Input type="password" placeholder={isEdit ? '••••••••' : 'Min. 6 chars'} className="rounded-2xl h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all" {...field} /></FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactNo" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground ml-1">Communication Line</FormLabel>
                  <FormControl><Input placeholder="+91 98765..." className="rounded-2xl h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all" {...field} /></FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )} />
            </div>
          </motion.div>

          {/* Section: Education Info */}
          <motion.div variants={itemVars} className="space-y-6">
             <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Education Background</label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField control={form.control} name="collegeName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground ml-1">Institution</FormLabel>
                  <FormControl><Input placeholder="University Name" className="rounded-2xl h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all" {...field} /></FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )} />
              <FormField control={form.control} name="degree" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground ml-1">Academic Degree</FormLabel>
                  <FormControl><Input placeholder="e.g. B.Tech Computer Science" className="rounded-2xl h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all" {...field} /></FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold text-muted-foreground ml-1">Residential Sector</FormLabel>
                <FormControl><Input placeholder="Full mailing address" className="rounded-2xl h-11 bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all" {...field} /></FormControl>
                <FormMessage className="text-[10px] font-bold" />
              </FormItem>
            )} />
          </motion.div>

          {/* Footer Actions */}
          <motion.div variants={itemVars} className="flex gap-3 justify-end pt-6">
            <Button type="button" variant="ghost" className="rounded-full h-12 px-8 font-bold text-muted-foreground hover:bg-muted" onClick={onCancel} disabled={loading}>
              Discard
            </Button>
            <Button type="submit" className="rounded-full h-12 px-10 font-black shadow-xl shadow-primary/20 transition-all active:scale-95" disabled={loading}>
              {loading ? 'Processing...' : isEdit ? 'Update Node' : 'Initialize Employee'}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </Form>
  )
}
