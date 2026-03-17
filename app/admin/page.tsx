'use client'

import * as React from 'react'
import { motion, type Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { TaskCompletionChart, AttendanceChart } from '@/components/charts/dashboard-charts'
import { useApi } from '@/lib/use-api'
import { Users, UserCheck, GraduationCap, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/types'
import Image from 'next/image'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: employees, loading } = useApi<Employee[]>('/api/employees')

  const active   = (employees ?? []).filter((e) => e.role !== 'NOT_EMPLOYEE' && (e as any).flagged !== true)
  const total    = active.length
  const interns  = active.filter((e) => e.role?.toUpperCase() === 'INTERN').length
  const mentors  = active.filter((e) => e.role?.toUpperCase() === 'MENTOR').length
  const admins   = active.filter((e) => e.role?.toUpperCase() === 'ADMIN').length

  return (
    <DashboardLayout
      role="admin"
      userName="Admin"
      userEmail="admin@org.com"
      pageTitle="Overview"
      pageSubtitle="Your organization's training program at a glance"
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* Premium Hero Section */}
        <motion.div 
          variants={item}
          className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-10 lg:p-14 text-white shadow-2xl group border border-white/5"
        >
          {/* Animated decorative elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-900 rounded-full blur-[100px] -ml-24 -mb-24 transition-transform duration-1000 group-hover:-translate-x-10" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-8 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mx-auto lg:mx-0"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.25em]">System active</span>
              </motion.div>
              
              <h1 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9] lg:leading-[0.85]">
                Manage Your <br/>
                <span className="text-white/40">Workforce.</span>
              </h1>
              
              <p className="text-lg text-white/50 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                Welcome back, Administrator. You are currently overseeing <span className="text-white font-bold underline decoration-white/20 underline-offset-4">{total} members</span> in your organization. Monitor progress and optimize training.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-5 pt-4">
                <Button className="h-14 px-10 rounded-3xl bg-white text-black font-black text-sm shadow-2xl shadow-black/20 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95" onClick={() => router.push('/admin/mentees')}>
                  View All Interns
                </Button>
                <Button variant="ghost" className="h-14 px-8 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-sm backdrop-blur-md hover:bg-white/10 transition-all active:scale-95 inline-flex items-center gap-3" onClick={() => router.push('/admin/mentors')}>
                  Manage Mentors <ArrowUpRight size={18} />
                </Button>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="relative w-full max-w-[440px] aspect-square flex items-center justify-center shrink-0"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
              <div className="relative w-full h-full">
                <Image 
                  src="/admin-hero.png" 
                  alt="Admin Dashboard Illustration" 
                  fill 
                  className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative z-10 p-4" 
                  priority
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={item}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Workforce"
            value={loading ? '…' : total}
            subtitle="Personnel Count"
            icon={<Users size={28} />}
            colorClass="bg-primary/10 text-primary"
            trend="+12%"
          />
          <StatCard
            title="Interns"
            value={loading ? '…' : interns}
            subtitle="Training Base"
            icon={<GraduationCap size={28} />}
            colorClass="bg-emerald-500/10 text-emerald-500"
            trend="Active"
          />
          <StatCard
            title="Mentors"
            value={loading ? '…' : mentors}
            subtitle="Guidance Layer"
            icon={<UserCheck size={28} />}
            colorClass="bg-blue-500/10 text-blue-500"
            trend="Stable"
          />
          <StatCard
            title="System Admins"
            value={loading ? '…' : admins}
            subtitle="Core Security"
            icon={<ShieldCheck size={28} />}
            colorClass="bg-rose-500/10 text-rose-500"
          />
        </motion.div>

        {/* Enhanced Charts Section */}
        <motion.div 
          variants={item}
          className="grid grid-cols-1 xl:grid-cols-2 gap-8"
        >
          <div className="bg-card border-2 border-muted/50 rounded-[3rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-primary/20 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-foreground">Task Trajectories</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Global Completion Metrics</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5 group-hover:rotate-6 transition-transform">
                <Sparkles size={20} />
              </div>
            </div>
            <div className="relative z-10 min-h-[300px]">
              <TaskCompletionChart />
            </div>
          </div>

          <div className="bg-card border-2 border-muted/50 rounded-[3rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-emerald-500/20 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-foreground">Active Presence</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Network Activity Heatmap</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/5 group-hover:rotate-6 transition-transform">
                <Users size={20} />
              </div>
            </div>
            <div className="relative z-10 min-h-[300px]">
              <AttendanceChart />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
