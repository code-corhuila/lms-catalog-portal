// Mirrors the Catalog-relevant subset of
// library-docs/07-api/contracts/openapi/library-api.yaml component schemas.

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  year: number
  totalCopies: number
  availableCopies: number
  createdAt: string
  updatedAt: string
}

// GET /books doesn't exist in lms-catalog-api yet (declared gap,
// library-docs/07-api/guidelines.md and this repo's README) — this type
// describes the contract BooksListPage expects once it's added, matching
// the full {total,page,limit,totalPages} envelope every other list endpoint
// in this project uses.
export interface PaginatedMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginatedMeta
}
