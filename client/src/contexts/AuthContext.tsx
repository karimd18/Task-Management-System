import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { authApi } from '../lib/api/auth'
import type { PublicUser } from '../lib/api/types'

export interface AuthContextType {
  user: PublicUser | null
  loading: boolean
  error: string | null

  signIn: (identifier: string, password: string) => Promise<boolean>
  signUp: (
    email: string,
    username: string,
    password: string,
    confirmPassword: string
  ) => Promise<boolean>

  // 1️⃣ request a reset link
  forgotPassword: (email: string) => Promise<void>

  // 2️⃣ actually reset using token + new passwords
  resetPassword: (
    token: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>

  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // load current user if token exists
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authApi.getCurrentUser()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    if (localStorage.getItem('token')) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const signIn = async (identifier: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const { user: apiUser, token } = await authApi.login(identifier, password)
      localStorage.setItem('token', token)
      setUser(apiUser)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string,
    username: string,
    password: string,
    confirmPassword: string
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const { user: apiUser, token } = await authApi.register(
        email,
        username,
        password,
        confirmPassword
      )
      localStorage.setItem('token', token)
      setUser(apiUser)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await authApi.forgotPassword(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await authApi.resetPassword(token, newPassword, confirmPassword)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    setError(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signIn,
      signUp,
      forgotPassword,
      resetPassword,
      logout,
    }),
    [user, loading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
