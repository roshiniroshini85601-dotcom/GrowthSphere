'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  searchColumn?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchColumn,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const enhancedColumns = React.useMemo(() => {
    return [
      {
        id: 'serial_no',
        header: 'ID',
        cell: ({ row, table }) => {
          const index = (table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + row.index + 1;
          return <span className="text-[11px] font-black text-primary/40 w-6 inline-block text-center tabular-nums">{index.toString().padStart(2, '0')}</span>
        },
      } as ColumnDef<TData, any>,
      ...columns,
    ]
  }, [columns])

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize: 5 } },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search bar — masterfully redesigned */}
        {searchColumn && (
          <div className="relative w-full sm:max-w-md group">
            <div className="absolute inset-0 bg-primary/5 rounded-[1.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary pointer-events-none z-10" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
              onChange={(e) => table.getColumn(searchColumn)?.setFilterValue(e.target.value)}
              className="pl-12 h-12 text-sm rounded-[1.5rem] border-2 border-muted/50 bg-card/50 backdrop-blur-sm shadow-none focus-visible:ring-0 focus-visible:border-primary transition-all relative z-10 font-medium"
            />
          </div>
        )}

        {/* Page Size Selector */}
        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
          {[5, 10, 20].map((size) => (
            <button
              key={size}
              onClick={() => table.setPageSize(size)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                table.getState().pagination.pageSize === size 
                  ? "bg-background text-primary shadow-sm ring-1 ring-border/50" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {size}
            </button>
          ))}
          <span className="text-[10px] font-bold text-muted-foreground/60 px-2 uppercase tracking-tighter">Per Page</span>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="rounded-[2rem] border-2 border-muted/50 overflow-hidden bg-card/30 backdrop-blur-sm relative transition-all">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-2 border-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-14 text-[11px] font-black text-muted-foreground uppercase tracking-[0.15em] px-6 first:pl-8 last:pr-8"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-primary/[0.02] transition-colors border-b border-muted/30 last:border-0 group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-6 text-[13px] first:pl-8 last:pr-8 font-medium">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={enhancedColumns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Search size={32} className="opacity-10" />
                    <p className="text-sm font-bold opacity-40">No records matching the query.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination — Masterful Control */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4 order-2 sm:order-1">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-2xl border-2 border-muted/50 hover:border-primary/40 hover:text-primary transition-all active:scale-90"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="flex items-center gap-1.5 px-3 bg-muted/30 py-1.5 rounded-2xl border border-border/50">
               <span className="text-[11px] font-black text-foreground">{table.getState().pagination.pageIndex + 1}</span>
               <span className="text-[10px] text-muted-foreground font-black uppercase opacity-40">Of</span>
               <span className="text-[11px] font-black text-foreground">{Math.max(table.getPageCount(), 1)}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-2xl border-2 border-muted/50 hover:border-primary/40 hover:text-primary transition-all active:scale-90"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest order-1 sm:order-2">
           Found <span className="text-primary">{table.getFilteredRowModel().rows.length}</span> Total Assets
        </div>
      </div>
    </div>
  )
}
