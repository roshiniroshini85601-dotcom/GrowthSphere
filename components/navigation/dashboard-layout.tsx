'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, UserCheck, UserCog, BookOpen,
  CalendarDays, CheckSquare, MessageSquare, LogOut, Menu,
  GraduationCap, ChevronRight, Sun, Moon, ChevronLeft
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

type Role = 'admin' | 'mentor' | 'intern'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: <LayoutDashboard size={20} /> },
  { label: 'Employees', href: '/admin/employees', icon: <Users size={20} /> },
  { label: 'Mentors', href: '/admin/mentors', icon: <UserCheck size={20} /> },
  { label: 'Mentees', href: '/admin/mentees', icon: <GraduationCap size={20} /> },
]

const mentorNav: NavItem[] = [
  { label: 'Assigned', href: '/mentor/mentees', icon: <UserCog size={20} /> },
  { label: 'Topics', href: '/mentor/topics', icon: <BookOpen size={20} /> },
]

const menteeNav: NavItem[] = [
  { label: 'Dashboard', href: '/mentee', icon: <LayoutDashboard size={20} /> },
  { label: 'Schedule', href: '/mentee/schedule', icon: <CalendarDays size={20} /> },
  { label: 'Progress', href: '/mentee/progress', icon: <CheckSquare size={20} /> },
  { label: 'Feedback', href: '/mentee/feedback', icon: <MessageSquare size={20} /> },
]

function getNav(role: Role) {
  if (role === 'admin') return adminNav
  if (role === 'mentor') return mentorNav
  return menteeNav
}

function getRoleLabel(role: Role) {
  if (role === 'admin') return 'Administrator'
  if (role === 'mentor') return 'Mentor'
  return 'Intern'
}

interface SidebarContentProps {
  role: Role
  userName: string
  userEmail: string
  isCollapsed?: boolean
  onToggle?: () => void
  onClose?: () => void
}

function SidebarContent({ role, userName, userEmail, isCollapsed, onToggle, onClose }: SidebarContentProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  
  React.useEffect(() => setMounted(true), [])
  const navItems = getNav(role)
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const activeCollapsed = isCollapsed && !isHovered

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col h-full bg-sidebar text-sidebar-foreground select-none relative transition-all duration-300"
    >
      
      {/* Brand & Toggle Button */}
      <div className={cn("px-4 pt-6 pb-8 flex items-center justify-between", activeCollapsed ? "justify-center px-0" : "")}>
        {!activeCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 px-2"
          >
            <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[15px] tracking-tight text-foreground">GrowthSphere</span>
              <span className="text-[9px] text-muted-foreground font-bold tracking-[0.1em] uppercase -mt-0.5">Systems</span>
            </div>
          </motion.div>
        )}
        {activeCollapsed && (
           <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer hover:rotate-6 transition-transform">
             <GraduationCap size={20} className="text-white" />
           </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isExact = item.href === '/admin' || item.href === '/mentor' || item.href === '/mentee'
          const isActive = isExact ? pathname === item.href : pathname.startsWith(item.href)
          
          return (
            <Link key={item.href} href={item.href} onClick={onClose} title={activeCollapsed ? item.label : undefined}>
              <motion.div
                whileHover={{ scale: 1.02, x: activeCollapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative group flex items-center gap-3 py-3 px-4 rounded-[2rem] transition-all duration-200 outline-none",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  activeCollapsed ? "justify-center px-0 w-11 h-11 mx-auto" : "w-full"
                )}
              >
                <div className={cn("shrink-0", isActive ? "scale-110" : "group-hover:scale-110 transition-transform")}>
                  {item.icon}
                </div>
                {!activeCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 font-bold text-[13px] whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!activeCollapsed && isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer / User Area */}
      <div className={cn("px-3 py-6 space-y-4", activeCollapsed ? "px-1" : "")}>
        {/* Toggle Expand/Collapse (Desktop Only) */}
        {/* {!onClose && (
          <button 
            onClick={onToggle}
            className="hidden lg:flex w-full items-center justify-center h-10 rounded-2xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all group"
          >
            <div className={cn("transition-transform duration-300", isCollapsed ? "rotate-180" : "")}>
              <ChevronLeft size={18} />
            </div>
            {!activeCollapsed && <span className="ml-2 text-[12px] font-bold">Collapse Sidebar</span>}
          </button>
        )} */}

        {/* Theme & User */}
        <div className={cn("flex flex-col gap-2", activeCollapsed ? "items-center" : "")}>
           <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              "flex items-center gap-3 h-11 px-4 rounded-2xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all",
              activeCollapsed ? "justify-center px-0 w-11" : "w-full px-4"
            )}
            title="Toggle Theme"
          >
            {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {!activeCollapsed && <span className="text-[13px] font-bold whitespace-nowrap overflow-hidden">{mounted && theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>}
          </button>

          <Link href="/login">
            <div 
              className={cn(
                "flex items-center gap-3 h-11 px-4 rounded-2xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all",
                activeCollapsed ? "justify-center px-0 w-11" : "w-full px-4"
              )}
              title="Logout"
            >
              <LogOut size={20} />
              {!activeCollapsed && <span className="text-[13px] font-bold whitespace-nowrap overflow-hidden">Sign Out</span>}
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className={cn(
          "bg-muted/40 rounded-[2rem] p-3 transition-all",
          activeCollapsed ? "p-1 rounded-2xl" : "p-3"
        )}>
          <div className={cn("flex items-center gap-3", activeCollapsed ? "justify-center" : "")}>
            <Avatar className="w-10 h-10 ring-2 ring-primary/10 shadow-sm shrink-0">
              <AvatarFallback className="bg-primary/5 text-primary text-[11px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!activeCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold text-foreground truncate">{userName}</div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{getRoleLabel(role)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
  role: Role
  userName?: string
  userEmail?: string
  pageTitle?: string
  pageSubtitle?: string
}

export function DashboardLayout({
  children,
  role,
  userName = 'Arjun Sharma',
  userEmail = 'arjun@org.com',
  pageTitle,
  pageSubtitle,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [isHovered, setIsHovered] = React.useState(false)

  const activeCollapsed = isCollapsed && !isHovered

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <motion.aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ width: activeCollapsed ? 80 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col shrink-0 border-r border-border/40 bg-card overflow-hidden relative z-50 shadow-2xl"
      >
        <SidebarContent 
          role={role} 
          userName={userName} 
          userEmail={userEmail} 
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </motion.aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Curved background decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[100px] -mr-96 -mt-96 pointer-events-none" />

        <header className="h-16 flex items-center px-6 gap-4 shrink-0 relative z-10">
          {/* Mobile hamburger */}
          <div className="lg:hidden mr-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl border-2">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0">
                <SidebarContent
                  role={role}
                  userName={userName}
                  userEmail={userEmail}
                  onClose={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1 min-w-0">
            {pageTitle && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-xl font-extrabold text-foreground tracking-tight leading-none">
                  {pageTitle}
                </h1>
                {pageSubtitle && (
                  <p className="text-[12px] text-muted-foreground font-medium mt-1 uppercase tracking-widest">{pageSubtitle}</p>
                )}
              </motion.div>
            )}
          </div>

          {/* User Profile Header (Small) */}
          <div className="hidden sm:flex items-center gap-4 bg-muted/30 p-1.5 pr-4 rounded-[2rem] border border-border/50">
             <Avatar className="w-8 h-8 ring-2 ring-primary/10 shadow-sm">
                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                  {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
             </Avatar>
             <div className="flex flex-col">
               <span className="text-[11px] font-bold text-foreground leading-none">{userName}</span>
               <span className="text-[9px] text-muted-foreground font-bold tracking-wider uppercase mt-0.5">{role}</span>
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pageTitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
