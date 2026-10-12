// Screens under construction — real content lands with each feat/HU-XX branch.
// See library-docs/12-ux-ui/navigation-map.md for what this screen will do.
//
// Temporary: duplicated here until lms-front exists and exposes shared ui
// components for every portal to consume instead (ADR-006's flagged risk).
interface EmptyStateProps {
  title: string
  description: string
  hu: string
}

export function EmptyState({ title, description, hu }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-[var(--shadow-card)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.4 0 2.27-1.52 1.57-2.73L13.57 4.27a1.8 1.8 0 0 0-3.14 0L3.36 16.27C2.66 17.48 3.53 19 4.93 19Z" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      <span className="mt-4 inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
        Implemented in {hu}
      </span>
    </div>
  )
}
