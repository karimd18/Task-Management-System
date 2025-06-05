import { API_BASE_URL, jsonHeaders, handleErrors } from './config'
import type { AuthResponse, PublicUser } from './types'

function authHeader(): HeadersInit {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not authenticated')
  return { 'Authorization': `Bearer ${token}` }
}

export const authApi = {
  getCurrentUser: async (): Promise<PublicUser | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: authHeader()
      })
      if (res.status === 401) {
        localStorage.removeItem('token')
        return null
      }
      handleErrors(res, 'get current user')
      return res.json()
    } catch (error) {
      localStorage.removeItem('token')
      return null
    }
  },

  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ identifier, password }),
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Login failed')
    }

    const data: AuthResponse = await res.json()
    localStorage.setItem('token', data.token)
    return data
  },

  register: async (
    email: string,
    username: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email, username, password, confirmPassword }),
    })

    if (!res.ok) {
      const error = await res.json()
      const message = error.errors ? 
        Object.values(error.errors).join('\n') : 
        error.message
      throw new Error(message || 'Registration failed')
    }

    const data: AuthResponse = await res.json()
    localStorage.setItem('token', data.token)
    return data
  },

  logout: (): void => {
    localStorage.removeItem('token')
  },

  forgotPassword: async (email: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email }),
    });
    handleErrors(res, 'request password reset');
  },

  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
    handleErrors(res, 'reset password');
  },

  updatePassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/users/update-password`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email, code, newPassword }),
    })
    handleErrors(res, 'update password')
  }
}