import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

// Design system: only one Primary action per view; Danger always paired with a
// confirmation step — library-docs/12-ux-ui/design-system.md.
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

// Temporary: duplicated here until lms-front exists and exposes shared ui
// components for every portal to consume instead (ADR-006's flagged risk).

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white shadow-[var(--shadow-button)] hover:bg-primary-700 hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-px active:translate-y-0 active:shadow-[var(--shadow-button)] focus-visible:outline-primary-600',
  secondary:
    'bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',
  danger:
    'bg-error-600 text-white shadow-[0_1px_2px_rgb(15_23_42_/_0.05),0_4px_10px_-2px_rgb(225_29_72_/_0.3)] hover:bg-rose-700 hover:-translate-y-px active:translate-y-0 focus-visible:outline-error-600',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200',
}

export function Button({ variant = 'primary', isLoading, className, disabled, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
        'transition-[color,background-color,box-shadow,transform] duration-150 ease-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-y-0',
        variantClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
