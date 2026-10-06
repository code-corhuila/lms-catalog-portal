import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

// Design system: only one Primary action per view; Danger always paired with a
// confirmation step — library-docs/12-ux-ui/design-system.md.
//
// Temporary: duplicated here until lms-front exists and exposes shared ui
// components for every portal to consume instead (ADR-006's flagged risk).
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-600',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  danger: 'bg-error-600 text-white hover:bg-rose-700 focus-visible:outline-error-600',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
}

export function Button({ variant = 'primary', isLoading, className, disabled, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
        'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
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
