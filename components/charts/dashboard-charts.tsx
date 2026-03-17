'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from 'recharts'
import { useApi } from '@/lib/use-api'
import { Skeleton } from '@/components/ui/skeleton'

const tooltipStyle = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  fontSize: '12px',
  color: 'var(--color-card-foreground)',
  boxShadow: 'var(--shadow-dropdown)',
  padding: '8px 12px',
}

interface AdminStatsResponse {
  weeklyTaskStats: { day: string, completed: number, incomplete: number }[]
  attendanceStats: { date: string, count: number }[]
}

export function TaskCompletionChart() {
  const { data, loading } = useApi<AdminStatsResponse>('/api/admin/stats')

  return (
    <div className="bg-card rounded-2xl border border-border p-6 card-elevated">
      <div className="mb-5">
        <h3 className="text-[14px] font-semibold text-foreground tracking-tight">Task Completion</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Completed vs incomplete tasks this week</p>
      </div>
      {loading ? (
        <Skeleton className="w-full h-[210px] rounded-xl bg-muted/50" />
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data?.weeklyTaskStats ?? []} barSize={14} barGap={3} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} strokeOpacity={0.7} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-accent)', radius: 8 }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
            <Bar dataKey="completed" name="Completed" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="incomplete" name="Incomplete" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} opacity={0.75} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function AttendanceChart() {
  const { data, loading } = useApi<AdminStatsResponse>('/api/admin/stats')

  return (
    <div className="bg-card rounded-2xl border border-border p-6 card-elevated">
      <div className="mb-5">
        <h3 className="text-[14px] font-semibold text-foreground tracking-tight">Attendance Trend</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Daily intern attendance over the past week</p>
      </div>
      {loading ? (
        <Skeleton className="w-full h-[210px] rounded-xl bg-muted/50" />
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={data?.attendanceStats ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} strokeOpacity={0.7} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="count"
              name="Attendance"
              stroke="var(--color-chart-2)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--color-card)', stroke: 'var(--color-chart-2)', strokeWidth: 2.5, r: 4 }}
              activeDot={{ r: 6, fill: 'var(--color-chart-2)', stroke: 'var(--color-card)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
