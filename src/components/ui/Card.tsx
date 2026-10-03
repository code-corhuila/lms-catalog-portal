import { clsx } from 'clsx'
import type { PropsWithChildren } from 'react'

// Temporary: duplicated here until lms-front exists and exposes shared ui
// components for every portal to consume instead (ADR-006's flagged risk).
export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={clsx('rounded-xl border border-slate-200 bg-white p-6 shadow-sm', className)}>
      {children}
    </div>
  )
}
