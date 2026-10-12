import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { apiClient, type ShellError } from 'shell/apiClient'
import type { Book, Paginated } from '../../types'

type ViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'data'; books: Book[] }

type EditFieldErrors = Partial<Record<'title' | 'author' | 'category' | 'year' | 'totalCopies', string>>

// Implements HU-05 (search) and HU-09 (edit)
// (library-docs/04-requirements/user-stories.md):
// "As the administrator, I want to search the catalog and edit a book's details."
//
// Four states, per rules/2-anexos/H-front.md — loading, error with retry,
// empty, and data.
export function BooksListPage() {
  const [view, setView] = useState<ViewState>({ status: 'loading' })
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', author: '', category: '', year: '', totalCopies: '' })
  const [editFieldErrors, setEditFieldErrors] = useState<EditFieldErrors>({})
  const [editError, setEditError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Rules/2-anexos/H-front.md: "Una petición más nueva reemplaza a la anterior".
  const latestRequestId = useRef(0)

  async function load(query: string) {
    const requestId = ++latestRequestId.current
    setView({ status: 'loading' })
    try {
      const { data } = await apiClient.get<Paginated<Book>>('/books', { params: { search: query } })
      if (requestId !== latestRequestId.current) return
      setView(data.data.length === 0 ? { status: 'empty' } : { status: 'data', books: data.data })
    } catch (err) {
      if (requestId !== latestRequestId.current) return
      const shellError = err as ShellError
      setView({ status: 'error', message: shellError.message ?? 'Unable to load books.' })
    }
  }

  useEffect(() => {
    load('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    load(search)
  }

  function startEdit(book: Book) {
    setEditingId(book.id)
    setEditForm({
      title: book.title,
      author: book.author,
      category: book.category,
      year: String(book.year),
      totalCopies: String(book.totalCopies),
    })
    setEditFieldErrors({})
    setEditError(null)
  }

  async function saveEdit(id: string) {
    setEditFieldErrors({})
    setEditError(null)
    try {
      await apiClient.patch(`/books/${id}`, {
        ...editForm,
        year: Number(editForm.year),
        totalCopies: Number(editForm.totalCopies),
      })
      setEditingId(null)
      load(search)
    } catch (err) {
      const shellError = err as ShellError
      if (shellError.details?.length) {
        const next: EditFieldErrors = {}
        const knownFields: Record<string, 0> = { title: 0, author: 0, category: 0, year: 0 }
        for (const detail of shellError.details) {
          if (detail.field in knownFields) {
            next[detail.field as keyof EditFieldErrors] = detail.message
          }
        }
        setEditFieldErrors(next)
      }
      setEditError(shellError.message ?? 'Unable to update the book.')
    }
  }

  async function deleteBook(id: string) {
    if (!window.confirm('Delete this book? This cannot be undone.')) return
    setDeletingId(id)
    setDeleteError(null)
    try {
      await apiClient.delete(`/books/${id}`)
      load(search)
    } catch (err) {
      const shellError = err as ShellError
      setDeleteError(shellError.message ?? 'Unable to delete the book.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Catalog</h1>
          <p className="text-sm text-slate-500">Search the book catalog, check availability, and edit details.</p>
        </div>
        <Link to="new">
          <Button>Register book</Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, or ISBN"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {view.status === 'loading' && (
        <Card className="p-6 text-center text-sm text-slate-400">Loading books…</Card>
      )}

      {view.status === 'error' && (
        <Card className="space-y-3 p-6 text-center">
          <p role="alert" className="text-sm text-error-600">{view.message}</p>
          <Button variant="secondary" onClick={() => load(search)}>Try again</Button>
        </Card>
      )}

      {view.status === 'empty' && (
        <Card className="p-6 text-center text-sm text-slate-400">No books found.</Card>
      )}

      {view.status === 'data' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">Title</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">Author</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">ISBN</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">Year</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">Copies</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {view.books.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-slate-50/60">
                  {editingId === b.id ? (
                    <>
                      <td className="px-4 py-2 align-top">
                        <input
                          value={editForm.title}
                          onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                          aria-invalid={Boolean(editFieldErrors.title)}
                          aria-describedby={editFieldErrors.title ? `title-error-${b.id}` : undefined}
                          className="w-full rounded border border-slate-300 px-2 py-1"
                        />
                        {editFieldErrors.title && (
                          <p id={`title-error-${b.id}`} role="alert" className="mt-1 text-xs text-error-600">{editFieldErrors.title}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <input
                          value={editForm.author}
                          onChange={(e) => setEditForm((f) => ({ ...f, author: e.target.value }))}
                          aria-invalid={Boolean(editFieldErrors.author)}
                          aria-describedby={editFieldErrors.author ? `author-error-${b.id}` : undefined}
                          className="w-full rounded border border-slate-300 px-2 py-1"
                        />
                        {editFieldErrors.author && (
                          <p id={`author-error-${b.id}`} role="alert" className="mt-1 text-xs text-error-600">{editFieldErrors.author}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-500">{b.isbn}</td>
                      <td className="px-4 py-2 align-top">
                        <input
                          value={editForm.category}
                          onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                          aria-invalid={Boolean(editFieldErrors.category)}
                          aria-describedby={editFieldErrors.category ? `category-error-${b.id}` : undefined}
                          className="w-full rounded border border-slate-300 px-2 py-1"
                        />
                        {editFieldErrors.category && (
                          <p id={`category-error-${b.id}`} role="alert" className="mt-1 text-xs text-error-600">{editFieldErrors.category}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <input
                          type="number"
                          value={editForm.year}
                          onChange={(e) => setEditForm((f) => ({ ...f, year: e.target.value }))}
                          aria-invalid={Boolean(editFieldErrors.year)}
                          aria-describedby={editFieldErrors.year ? `year-error-${b.id}` : undefined}
                          className="w-20 rounded border border-slate-300 px-2 py-1"
                        />
                        {editFieldErrors.year && (
                          <p id={`year-error-${b.id}`} role="alert" className="mt-1 text-xs text-error-600">{editFieldErrors.year}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <input
                          type="number"
                          min={1}
                          value={editForm.totalCopies}
                          onChange={(e) => setEditForm((f) => ({ ...f, totalCopies: e.target.value }))}
                          aria-invalid={Boolean(editFieldErrors.totalCopies)}
                          aria-describedby={editFieldErrors.totalCopies ? `totalCopies-error-${b.id}` : undefined}
                          className="w-20 rounded border border-slate-300 px-2 py-1"
                        />
                        <p className="mt-1 text-xs text-slate-400">{b.availableCopies} available now</p>
                        {editFieldErrors.totalCopies && (
                          <p id={`totalCopies-error-${b.id}`} role="alert" className="mt-1 text-xs text-error-600">{editFieldErrors.totalCopies}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div className="flex gap-2">
                          <Button onClick={() => saveEdit(b.id)}>Save</Button>
                          <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                        {editError && <p role="alert" className="mt-1 text-xs text-error-600">{editError}</p>}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-slate-900">{b.title}</td>
                      <td className="px-4 py-3 text-slate-500">{b.author}</td>
                      <td className="px-4 py-3 text-slate-500 tabular-nums">{b.isbn}</td>
                      <td className="px-4 py-3 text-slate-500">{b.category}</td>
                      <td className="px-4 py-3 text-slate-500 tabular-nums">{b.year}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {b.availableCopies > 0 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-success-600 ring-1 ring-emerald-600/10 ring-inset">
                            <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                            {b.availableCopies}/{b.totalCopies} available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-error-600 ring-1 ring-rose-600/10 ring-inset">
                            <span className="h-1.5 w-1.5 rounded-full bg-error-500" />
                            0/{b.totalCopies} available
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => startEdit(b)}>Edit</Button>
                          <Button
                            variant="ghost"
                            isLoading={deletingId === b.id}
                            onClick={() => deleteBook(b.id)}
                            className="hover:bg-error-50 hover:text-error-600"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {deleteError && <p role="alert" className="px-4 py-3 text-sm text-error-600">{deleteError}</p>}
        </Card>
      )}
    </div>
  )
}
