// Ambient types for what lms-front (the container) exposes — see
// lms-membership-portal's identical file for the full rationale
// (rules/2-anexos/H-front.md).
declare module 'shell/apiClient' {
  export interface ShellApiClient {
    get<T>(url: string, config?: { params?: Record<string, unknown> }): Promise<{ data: T }>
    post<T>(url: string, body?: unknown, config?: { headers?: Record<string, string> }): Promise<{ data: T }>
    patch<T>(url: string, body?: unknown): Promise<{ data: T }>
  }
  export const apiClient: ShellApiClient

  export interface ShellError {
    error: string
    message: string
    details?: { field: string; message: string }[]
    traceId?: string
  }
}

declare module 'shell/session' {
  export function getToken(): string | null
  export function isAuthenticated(): boolean
  export function clearSession(): void
}
