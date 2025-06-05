import { API_BASE_URL } from './config'
import type { PaginatedResponse, InvitationResponse } from './types'

export const invitationsApi = {
  list: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<InvitationResponse>> => {
    const url = new URL(`${API_BASE_URL}/api/invitations/mine`)
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
      throw new Error(error.message || 'Failed to fetch invitations')
    }

    return {
      data: await res.json(),
      total: parseInt(res.headers.get('X-Total-Count') || '0'),
      page,
      pageSize,
    }
  },

  accept: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/invitations/${id}/accept`, {
      method: 'POST',
      headers: authHeader(),
    })

    if (res.status === 409) {
      throw new Error('You are already a member of this team')
    }

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to accept invitation')
    }
  },

  decline: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/invitations/${id}/decline`, {
      method: 'POST',
      headers: authHeader(),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to decline invitation')
    }
  },
}

function authHeader(): HeadersInit {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${token}` }
}