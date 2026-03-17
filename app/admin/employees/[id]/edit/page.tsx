'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { EmployeeForm, type EmployeeFormValues } from '@/components/forms/employee-form'
import { useApi } from '@/lib/use-api'

type Employee = {
  id: string
  name: string
  email: string
  contactNo: string
  role: string
  address: string | null
  collegeName: string | null
  degree: string | null
}

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // Fetch the specific employee from the real API
  const { data: employee, loading } = useApi<Employee>(`/api/employees/${id}`)

  // Calls PATCH /api/employees/[id] with updated values
  async function handleSubmit(values: EmployeeFormValues) {
    const payload: Record<string, string> = {
      name: values.name,
      email: values.email,
      contactNo: values.contactNo,
      role: values.role,
      address: values.address,
      collegeName: values.collegeName,
      degree: values.degree,
    }
    // Only send password if user actually typed one
    if (values.password && values.password.trim()) {
      payload.password = values.password
    }

    const res = await fetch(`/api/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error()
      toast.success('Employee updated successfully.')
      router.push('/admin/employees')
    } catch {
      toast.error('Failed to update employee.')
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin" userName="Admin" userEmail="admin@org.com" pageTitle="Edit Employee">
        <div className="flex items-center justify-center h-48 text-muted-foreground animate-pulse">Loading employee details...</div>
      </DashboardLayout>
    )
  }

  if (!employee) {
    return (
      <DashboardLayout role="admin" userName="Admin" userEmail="admin@org.com" pageTitle="Edit Employee">
        <div className="flex items-center justify-center h-48 text-muted-foreground">Employee not found (ID: {id}).</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      role="admin"
      userName="Admin"
      userEmail="admin@org.com"
      pageTitle="Edit Employee"
      pageSubtitle={`Editing details for ${employee.name}`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-base font-semibold mb-5 text-foreground">Employee Information</h2>
          <EmployeeForm
            defaultValues={employee as any}
            isEdit
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/employees')}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
