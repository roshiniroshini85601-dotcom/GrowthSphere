'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Eye, EyeOff, Loader2, ArrowRight, Sparkles, ShieldCheck, UserCircle, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

const DEMO_ACCOUNTS = [
  {
    email: 'xavier.babu@org.com',
    password: 'password123',
    role: 'admin',
    name: 'Xavier Babu',
    icon: ShieldCheck,
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-600',
    initials: 'AS'
  },
  {
    email: 'xavier.praveen@org.com',
    password: 'password123',
    role: 'mentor',
    name: 'Xavier Praveen',
    icon: UserCircle,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600',
    initials: 'PN'
  },
  {
    email: 'roshini@org.com',
    password: 'password123',
    role: 'intern',
    name: 'Roshini',
    icon: Briefcase,
    color: 'from-purple-500/20 to-pink-500/20 text-purple-600',
    initials: 'SI'
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [forgotOpen, setForgotOpen] = React.useState(false)
  const [forgotEmail, setForgotEmail] = React.useState('')
  const [forgotLoading, setForgotLoading] = React.useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginValues) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Invalid credentials')
        setLoading(false)
        return
      }

      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`)

      const rolePath = data.user.role === 'ADMIN' ? '/admin' :
        data.user.role === 'MENTOR' ? '/mentor/mentees' : '/mentee'

      router.push(rolePath)
    } catch (err) {
      toast.error('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      toast.error('Please enter a valid email address.')
      return
    }
    setForgotLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setForgotLoading(false)
    toast.success('Reset link sent — check your inbox.')
    setForgotOpen(false)
    setForgotEmail('')
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">

      {/* ── Left Decorative Panel ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex flex-col w-[50%] relative overflow-hidden bg-slate-950"
      >
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 scale-105"
          style={{ backgroundImage: 'url("/login-bg.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/40 to-transparent" />

        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full px-16 py-12 justify-between">

          {/* Top: Brand Logo */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              <GraduationCap size={24} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">GrowthSphere</span>
          </motion.div>

          {/* Middle: Hero Content */}
          <div className="max-w-md space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6">
                <Sparkles size={14} className="text-blue-400" />
                <span className="text-[11px] font-bold text-blue-100 uppercase tracking-widest">Next-Gen Mentorship</span>
              </div>
              <h2 className="text-5xl font-extrabold text-white leading-tight mb-4">
                Accelerate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">professional journey.</span>
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed font-medium">
                The ultimate workspace for interns, mentors, and administrators to collaborate and grow together.
              </p>
            </motion.div>
          </div>

          {/* Bottom: Demo Accounts Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-4">
              Instant Access Demo
            </p>
            <div className="grid grid-cols-3 gap-4">
              {DEMO_ACCOUNTS.map((a, i) => (
                <motion.button
                  key={a.email}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => form.reset({ email: a.email, password: a.password })}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-center group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-lg group-hover:shadow-primary/20`}>
                    <a.icon size={20} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-white capitalize">{a.role}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{a.initials} Account</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Right Form Panel ───────────────────────────── */}
      <div className="flex-1 flex flex-col relative items-center justify-center p-6 lg:p-12 bg-background overflow-y-auto">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-[80px] -ml-20 -mb-20" />

        {/* Decorative elements for mobile */}
        <div className="lg:hidden absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-[420px] relative z-10"
        >
          {/* Card Container */}
          <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-sm">
            
            {/* Mobile Brand Logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl">
                <GraduationCap size={24} className="text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight">GrowthSphere</span>
            </div>

            <div className="space-y-2 text-center mb-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Sign In</h1>
              <p className="text-muted-foreground font-medium text-sm">Welcome back to your professional hub.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[11px] font-bold text-foreground/50 uppercase tracking-[0.15em] ml-1">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@company.com"
                          className="h-13 rounded-2xl border-2 border-muted bg-muted/20 hover:border-primary/20 focus-visible:border-primary/50 transition-all px-5 text-sm font-medium shadow-none outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px] font-medium px-1" />
                    </FormItem>
                  )} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <FormLabel className="text-[11px] font-bold text-foreground/50 uppercase tracking-[0.15em]">Password</FormLabel>
                        <button
                          type="button"
                          onClick={() => setForgotOpen(true)}
                          className="text-[11px] font-bold text-primary/80 hover:text-primary transition-colors uppercase tracking-widest"
                        >
                          Forgot?
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="h-13 rounded-2xl border-2 border-muted bg-muted/20 hover:border-primary/20 focus-visible:border-primary/50 transition-all px-5 pr-12 text-sm font-medium shadow-none outline-none"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-all"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px] font-medium px-1" />
                    </FormItem>
                  )} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl text-[15px] font-bold shadow-[0_10px_30px_rgba(var(--primary),0.2)] hover:shadow-[0_15px_35px_rgba(var(--primary),0.3)] active:scale-[0.98] transition-all bg-primary text-primary-foreground group"
                    disabled={loading}
                  >
                    {loading
                      ? <><Loader2 size={18} className="mr-2 animate-spin" /> Authenticating...</>
                      : <>Continue <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                    }
                  </Button>
                </motion.div>
              </form>
            </Form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 space-y-8"
            >
          

             
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom micro-copy */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.3em]">
            © 2026 GrowthSphere • Empowering Potential
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-sm rounded-3xl overflow-hidden p-0 border-none">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold text-white">Reset Password</DialogTitle>
              <DialogDescription className="text-blue-100 font-medium">
                No worries! Enter your email and we&apos;ll get you back on track.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Email Address</label>
              <Input
                type="email"
                placeholder="you@org.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="h-12 rounded-2xl border-2 border-muted focus-visible:border-primary transition-all px-4 text-sm font-medium shadow-none"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold border-2" onClick={() => setForgotOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 rounded-2xl h-12 font-bold shadow-lg" onClick={handleForgotPassword} disabled={forgotLoading}>
                {forgotLoading ? <><Loader2 size={16} className="mr-2 animate-spin" />Sending...</> : 'Reset Link'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
