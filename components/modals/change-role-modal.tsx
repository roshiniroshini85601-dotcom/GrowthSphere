'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Employee } from '@/types'

// Use uppercase roles matching the DB
const roleSchema = z.object({
  role: z.enum(['MENTOR', 'NOT_MENTOR', 'INTERN', 'NOT_EMPLOYEE']),
})

type RoleFormValues = z.infer<typeof roleSchema>

const allowedTransitions: Record<string, string[]> = {
  INTERN: ['NOT_MENTOR'],
  NOT_MENTOR: ['MENTOR', 'INTERN'],
  MENTOR: ['NOT_MENTOR'],
}

interface ChangeRoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
  onSave: (id: string, newRole: string) => void
}

export function ChangeRoleModal({ open, onOpenChange, employee, onSave }: ChangeRoleModalProps) {
  const [loading, setLoading] = React.useState(false)
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { role: 'NOT_MENTOR' },
  })

  React.useEffect(() => {
    if (employee) {
      const transitions = allowedTransitions[employee.role] ?? []
      form.reset({ role: (transitions[0] as RoleFormValues['role']) ?? 'NOT_MENTOR' })
    }
  }, [employee, form])

  if (!employee) return null

  const transitions = allowedTransitions[employee.role] ?? []

  if (employee.role === 'ADMIN' || transitions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold tracking-tight">Change Role</DialogTitle>
            <DialogDescription className="text-[12px]">
              {employee.role === 'ADMIN'
                ? 'Admin roles cannot be changed from here.'
                : `No role transitions available for "${employee.role}".`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-2">
            <Button variant="outline" className="rounded-full h-9 text-[12px] px-5" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  async function onSubmit(values: RoleFormValues) {
    if (!employee) return
    setLoading(true)
    try {
      await onSave(employee.id, values.role)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const roleLabels: Record<string, string> = {
    INTERN: 'Intern',
    NOT_MENTOR: 'Not Mentor',
    MENTOR: 'Mentor',
    NOT_EMPLOYEE: 'Not Employee',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold tracking-tight">Change Role</DialogTitle>
          <DialogDescription className="text-[12px]">
            Update role for <span className="font-semibold text-foreground">{employee.name}</span>.<br/>
            Current: <span className="font-semibold text-foreground capitalize">{employee.role.toLowerCase().replace('_', ' ')}</span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-semibold">New Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-full h-10 text-sm px-4">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {transitions.map((r) => (
                        <SelectItem key={r} value={r} className="text-[13px]">{roleLabels[r] ?? r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" className="rounded-full h-9 text-[12px] px-5" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
              <Button type="submit" className="rounded-full h-9 text-[12px] px-5" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
