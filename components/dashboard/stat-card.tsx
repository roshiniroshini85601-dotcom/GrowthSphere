'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  colorClass?: string
  trend?: string
}

export function StatCard({ title, value, subtitle, icon, colorClass = 'bg-primary/10 text-primary', trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative group bg-card rounded-[2.5rem] border-2 border-muted/50 p-7 flex items-start gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden cursor-default"
    >
      {/* Decorative background glass blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      
      {/* Curved Icon Container */}
      <div className={cn(
        'w-16 h-16 rounded-[1.75rem] flex items-center justify-center shrink-0 shadow-2xl shadow-black/5 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 relative z-10',
        colorClass
      )}>
        <div className="absolute inset-0 rounded-[1.75rem] bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 relative z-10 pt-1">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-muted-foreground/50 mb-2 transition-colors group-hover:text-primary/70">
          {title}
        </div>
        <div className="flex items-baseline gap-2">
           <div className="text-[34px] font-black text-foreground leading-none tracking-tighter">
             {value}
           </div>
           {trend && (
             <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 mb-0.5">
               {trend}
             </span>
           )}
        </div>
        {subtitle && (
          <div className="text-[11px] font-bold text-muted-foreground/60 mt-3 flex items-center gap-1.5 uppercase tracking-wider">
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            {subtitle}
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary group-hover:w-full transition-all duration-500 opacity-20" />
    </motion.div>
  )
}
