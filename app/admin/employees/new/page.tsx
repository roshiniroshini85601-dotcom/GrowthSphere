'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Users } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { EmployeeForm, type EmployeeFormValues } from '@/components/forms/employee-form'

export default function NewEmployeePage() {
  const router = useRouter()

  async function handleSubmit(values: EmployeeFormValues) {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        password: values.password || 'changeme123',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? 'Failed to create employee.')
      return
    }

    toast.success('New employee initialized successfully.')
    router.push('/admin/employees')
  }

  return (
    <DashboardLayout
      role="admin"
      userName="Admin"
      userEmail="admin@org.com"
      pageTitle="Intelligence Hub"
      pageSubtitle="Personnel Onboarding & Role Assignment"
    >
      <div className="max-w-4xl mx-auto py-4">
        <div className="relative">
          {/* Background Decoration */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />

          <div className="relative bg-card border-2 border-muted/50 rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-black/[0.02]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-muted/50">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-foreground">Add Employee</h2>
                <p className="text-sm text-muted-foreground font-medium">Configure new access nodes for the organization.</p>
              </div>
              <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary">
                <Users size={32} />
              </div>
            </div>

            <EmployeeForm
              onSubmit={handleSubmit}
              onCancel={() => router.push('/admin/employees')}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
