import { type FormEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { apiClient, type ShellError } from 'shell/apiClient'

type FieldErrors = Partial<Record<'title' | 'author' | 'isbn' | 'category' | 'year' | 'totalCopies', string>>

// Implements HU-04 (library-docs/04-requirements/user-stories.md):
// "As the administrator, I want to register new books... so that the library
// catalog is populated."
export function BookFormPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [category, setCategory] = useState('')
  const [year, setYear] = useState('')
  const [totalCopies, setTotalCopies] = useState('1')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // One key for this whole registration intent, reused on every retry —
  // rules/2-anexos/H-front.md: "Idempotency-Key por intención, reutilizada
  // al reintentar".
  const idempotencyKey = useRef(crypto.randomUUID())

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setIsSubmitting(true)
    try {
      await apiClient.post(
        '/books',
        { title, author, isbn, category, year: Number(year), totalCopies: Number(totalCopies) },
        { headers: { 'Idempotency-Key': idempotencyKey.current } },
      )
      navigate('/')
    } catch (err) {
      const shellError = err as ShellError
      if (shellError.details?.length) {
        const next: FieldErrors = {}
        const knownFields: Record<string, 0> = { title: 0, author: 0, isbn: 0, category: 0, year: 0, totalCopies: 0 }
        for (const detail of shellError.details) {
          if (detail.field in knownFields) {
            next[detail.field as keyof FieldErrors] = detail.message
          }
        }
        setFieldErrors(next)
      }
      setFormError(shellError.message ?? 'Unable to register the book. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Register book</h1>
        <p className="text-sm text-slate-500">HU-04 — populates the catalog with a new title.</p>
      </div>

      <Card>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? 'title-error' : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
            {fieldErrors.title && <p id="title-error" role="alert" className="mt-1 text-sm text-error-600">{fieldErrors.title}</p>}
          </div>

          <div>
            <label htmlFor="author" className="mb-1 block text-sm font-medium text-slate-700">Author</label>
            <input id="author" required value={author} onChange={(e) => setAuthor(e.target.value)}
              aria-invalid={Boolean(fieldErrors.author)}
              aria-describedby={fieldErrors.author ? 'author-error' : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
            {fieldErrors.author && <p id="author-error" role="alert" className="mt-1 text-sm text-error-600">{fieldErrors.author}</p>}
          </div>

          <div>
            <label htmlFor="isbn" className="mb-1 block text-sm font-medium text-slate-700">ISBN</label>
            <input id="isbn" required value={isbn} onChange={(e) => setIsbn(e.target.value)}
              aria-invalid={Boolean(fieldErrors.isbn)}
              aria-describedby={fieldErrors.isbn ? 'isbn-error' : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
            {fieldErrors.isbn && <p id="isbn-error" role="alert" className="mt-1 text-sm text-error-600">{fieldErrors.isbn}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <input id="category" required value={category} onChange={(e) => setCategory(e.target.value)}
                aria-invalid={Boolean(fieldErrors.category)}
                aria-describedby={fieldErrors.category ? 'category-error' : undefined}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
              {fieldErrors.category && <p id="category-error" role="alert" className="mt-1 text-sm text-error-600">{fieldErrors.category}</p>}
            </div>
            <div>
              <label htmlFor="year" className="mb-1 block text-sm font-medium text-slate-700">Year</label>
              <input id="year" type="number" required value={year} onChange={(e) => setYear(e.target.value)}
                aria-invalid={Boolean(fieldErrors.year)}
                aria-describedby={fieldErrors.year ? 'year-error' : undefined}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
              {fieldErrors.year && <p id="year-error" role="alert" className="mt-1 text-sm text-error-600">{fieldErrors.year}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="totalCopies" className="mb-1 block text-sm font-medium text-slate-700">Total copies</label>
            <input id="totalCopies" type="number" min={1} required value={totalCopies} onChange={(e) => setTotalCopies(e.target.value)}
              aria-invalid={Boolean(fieldErrors.totalCopies)}
              aria-describedby={fieldErrors.totalCopies ? 'totalCopies-error' : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
            {fieldErrors.totalCopies && <p id="totalCopies-error" role="alert" className="mt-1 text-sm text-error-600">{fieldErrors.totalCopies}</p>}
          </div>

          {formError && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-error-600">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/')} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Register book</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
