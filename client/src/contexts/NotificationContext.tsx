import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { invitationsApi } from '../lib/api/invitations'
import type { InvitationResponse } from '../lib/api/types'
import { useAuth } from './AuthContext'

interface NotificationContextType {
  invites: InvitationResponse[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  accept: (id: string) => Promise<void>
  decline: (id: string) => Promise<void>
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [invites, setInvites] = useState<InvitationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })

  const refresh = useCallback(async (page: number = 1, pageSize: number = 10) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await invitationsApi.list(page, pageSize)
      setInvites(response.data)
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations')
      console.error('Notification refresh failed:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user?.id) {
      refresh()
    } else {
      setInvites([])
      setLoading(false)
    }
  }, [user, refresh])

  const handleInvitationAction = async (
    action: (id: string) => Promise<void>, 
    id: string
  ) => {
    setError(null)
    try {
      await action(id)
      await refresh(pagination.page, pagination.pageSize)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed'
      setError(message)
      throw err
    }
  }

  const accept = (id: string) => handleInvitationAction(invitationsApi.accept, id)
  const decline = (id: string) => handleInvitationAction(invitationsApi.decline, id)

  return (
    <NotificationContext.Provider value={{ 
      invites, 
      loading, 
      error,
      refresh, 
      accept, 
      decline,
      pagination
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider')
  return ctx
}