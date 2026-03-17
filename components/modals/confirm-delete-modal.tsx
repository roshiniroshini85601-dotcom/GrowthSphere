'use client'

import * as React from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string
  entityType?: string
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  entityName,
  entityType = 'record',
  onConfirm,
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-destructive" />
            </div>
            <DialogTitle className="text-[16px] font-semibold tracking-tight">Delete {entityType}</DialogTitle>
          </div>
          <DialogDescription className="text-[12px] leading-relaxed pl-1">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">{entityName}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2 pt-1">
          <Button variant="outline" className="rounded-full h-9 text-[12px]" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" className="rounded-full h-9 text-[12px]" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
