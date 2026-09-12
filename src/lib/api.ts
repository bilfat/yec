/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
  }
}

/**
 * Standardized API client for the frontend.
 * @param endpoint The API endpoint (e.g. '/settings' will fetch '/api/settings'). If starting with 'http', it will use absolute URL.
 * @param options standard fetch RequestInit options
 * @returns A standardized ApiResponse
 */
export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    
    // Default headers
    const headers = new Headers(options.headers)
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data?.error?.code || response.status.toString(),
          message: data?.error?.message || data?.message || 'Terjadi kesalahan pada server'
        }
      }
    }

    // Adapt to potential API responses that might not wrap data in { data: ... }
    const responseData = data && typeof data === 'object' && 'data' in data ? data.data : data;

    return {
      success: true,
      data: responseData,
      message: data?.message || ''
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghubungi server'
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message
      }
    }
  }
}
