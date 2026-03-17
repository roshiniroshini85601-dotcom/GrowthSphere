'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Pencil, Trash2, UserCog, Plus, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { DataTable } from '@/components/tables/data-table'
import { RoleBadge } from '@/components/dashboard/role-badge'
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal'
import { ChangeRoleModal } from '@/components/modals/change-role-modal'
import { Button } from '@/components/ui/button'
import { useApi } from '@/lib/use-api'
import type { Employee } from '@/types'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function AdminEmployeesPage() {
  const router = useRouter()
  const { data: allEmployees, loading, refetch } = useApi<Employee[]>('/api/employees')
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [deleteTarget, setDeleteTarget] = React.useState<Employee | null>(null)
  const [roleTarget, setRoleTarget] = React.useState<Employee | null>(null)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  React.useEffect(() => {
    if (allEmployees) setEmployees(allEmployees)
  }, [allEmployees])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/employees/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id))
      toast.success(`${deleteTarget.name} has been removed.`)
    } catch {
      toast.error('Failed to delete employee. Please try again.')
    } finally {
      setDeleteTarget(null)
      setDeleteLoading(false)
    }
  }

  async function handleRoleSave(id: string, newRole: string) {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error()
      toast.success('Role updated successfully.')
      refetch()
    } catch {
      toast.error('Failed to update role.')
    }
  }

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="py-1">
          <div className="font-bold text-foreground tracking-tight">{row.original.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">{row.original.degree}</div>
        </div>
      ),
    },
    { accessorKey: 'email', header: 'Email', cell: ({ row }) => <span className="text-muted-foreground font-medium">{row.original.email}</span> },
    { accessorKey: 'contactNo', header: 'Contact No', cell: ({ row }) => <span className="font-medium">{row.original.contactNo}</span> },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => <RoleBadge role={row.original.role.toLowerCase() as any} /> },
    { accessorKey: 'collegeName', header: 'College', cell: ({ row }) => <span className="text-muted-foreground italic text-sm">{row.original.collegeName}</span> },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="icon" className="h-8 w-8 rounded-xl border-muted transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/20"
            onClick={() => router.push(`/admin/employees/${row.original.id}/edit`)}
            title="Edit"
          >
            <Pencil size={12} />
          </Button>
          <Button
            variant="outline" size="icon" className="h-8 w-8 rounded-xl border-muted transition-all hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20"
            onClick={() => setDeleteTarget(row.original)}
            title="Delete"
          >
            <Trash2 size={12} />
          </Button>
          {row.original.role !== 'ADMIN' && (
            <Button
              variant="outline" size="icon" className="h-8 w-8 rounded-xl border-muted transition-all hover:bg-purple-500/5 hover:text-purple-500 hover:border-purple-500/20"
              onClick={() => setRoleTarget(row.original)}
              title="Change Role"
            >
              <UserCog size={12} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      role="admin"
      userName="Admin"
      userEmail="admin@org.com"
      pageTitle="Employees"
      pageSubtitle={loading ? 'Searching catalog...' : `Managing ${employees.length} team members`}
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border-2 border-muted/50 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Employee Directory</h2>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Corporate Registry</p>
            </div>
          </div>
          <Button className="rounded-2xl h-11 text-[13px] font-bold px-6 gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" onClick={() => router.push('/admin/employees/new')}>
            <Plus size={16} />
            Add New Member
          </Button>
        </motion.div>

        <motion.div variants={item} className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
          <DataTable
            columns={columns}
            data={employees}
            searchPlaceholder="Search by name, email, or role..."
            searchColumn="name"
          />
        </motion.div>
      </motion.div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onOpenChange={(o) => o === false && setDeleteTarget(null)}
        entityName={deleteTarget?.name ?? ''}
        entityType="Employee"
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
      <ChangeRoleModal
        open={!!roleTarget}
        onOpenChange={(o) => o === false && setRoleTarget(null)}
        employee={roleTarget}
        onSave={handleRoleSave}
      />
    </DashboardLayout>
  )
}
