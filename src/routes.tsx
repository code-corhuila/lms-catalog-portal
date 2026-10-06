import type { RouteObject } from 'react-router-dom'

import { BookFormPage } from './pages/books/BookFormPage'
import { BooksListPage } from './pages/books/BooksListPage'

// Exposed to lms-front via Module Federation (vite.config.ts's
// federation({ exposes })). Paths are relative to wherever the shell mounts
// this portal — this portal doesn't know or care what that prefix is.
export const catalogRoutes: RouteObject[] = [
  { index: true, element: <BooksListPage /> },
  { path: 'new', element: <BookFormPage /> },
]
