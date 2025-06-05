import { API_BASE_URL, jsonHeaders } from './config'
import type { PaginatedResponse, Status, StatusCreateDTO, StatusUpdateDTO } from './types'

export const statusesApi = {
  list: async (teamId?: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Status>> => {
    const url = new URL(`${API_BASE_URL}/api/statuses`)
    if (teamId) url.searchParams.set('teamId', teamId)
    url.searchParams.set('page', page.toString())
    url.searchParams.set('pageSize', pageSize.toString())

    const res = await fetch(url.toString(), {
      headers: {
        ...authHeader(),
        Accept: 'application/json',
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to fetch statuses')
    }

    return {
      data: await res.json(),
      total: parseInt(res.headers.get('X-Total-Count') || '0'),
      page,
      pageSize,
    }
  },

  create: async (payload: StatusCreateDTO): Promise<Status> => {
    const res = await fetch(`${API_BASE_URL}/api/statuses`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        ...authHeader(),
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json()
      const message = error.errors ? 
        Object.values(error.errors).flat().join('\n') : 
        error.message
      throw new Error(message || 'Failed to create status')
    }

    return res.json()
  },

  update: async (id: string, payload: StatusUpdateDTO): Promise<Status> => {
    const res = await fetch(`${API_BASE_URL}/api/statuses/${id}`, {
      method: 'PUT',
      headers: {
        ...jsonHeaders,
        ...authHeader(),
      },
      body: JSON.stringify(payload),
    })

    if (res.status === 409) {
      throw new Error('Status name already exists')
    }

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to update status')
    }

    return res.json()
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/statuses/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    })

    if (res.status === 400) {
      const error = await res.json()
      throw new Error(error.message || 'Cannot delete status - no fallback available')
    }

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to delete status')
    }
  },
}

// Shared auth header utility
function authHeader(): HeadersInit {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${token}` }
}