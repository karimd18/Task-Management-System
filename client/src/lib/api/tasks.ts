import { API_BASE_URL, jsonHeaders } from './config'
import type { PaginatedResponse, Task, TaskCreateDTO, TaskUpdateDTO } from './types'

export const tasksApi = {
  list: async (
    filters?: {
      teamId?: string
      isPersonal?: boolean
      page?: number
      pageSize?: number
    }
  ): Promise<PaginatedResponse<Task>> => {
    const url = new URL(`${API_BASE_URL}/api/tasks`)
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.set(key, String(value))
      })
    }

    url.search = params.toString()
    
    const res = await fetch(url.toString(), {
      headers: {
        ...authHeader(),
        Accept: 'application/json',
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to fetch tasks')
    }

    return {
      data: await res.json(),
      total: parseInt(res.headers.get('X-Total-Count') || '0'),
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 20,
    }
  },

  create: async (task: TaskCreateDTO): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        ...authHeader(),
      },
      body: JSON.stringify(task),
    })

    if (!res.ok) {
      const error = await res.json()
      const message = error.errors ? 
        Object.values(error.errors).flat().join('\n') : 
        error.message
      throw new Error(message || 'Failed to create task')
    }

    return res.json()
  },

  update: async (id: string, updates: TaskUpdateDTO): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        ...jsonHeaders,
        ...authHeader(),
      },
      body: JSON.stringify(updates),
    })
    console.log('body', updates)
    if (res.status === 409) {
      throw new Error('Task modified by another user. Please refresh.')
    }

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to update task')
    }

    return res.json()
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to delete task')
    }
  },
}

// Shared auth header utility
function authHeader(): HeadersInit {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${token}` }
}