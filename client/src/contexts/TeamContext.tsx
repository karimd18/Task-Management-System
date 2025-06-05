import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react'
import type { Team, Member, TeamCreateDTO, TeamUpdateDTO, MemberUpdateDTO, PaginatedResponse } from '../lib/api/types'
import { teamsApi } from '../lib/api/teams'
import { useAuth } from './AuthContext'

interface TeamContextType {
  teams: Team[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  loadTeams: (page?: number, pageSize?: number) => Promise<void>
  createTeam: (data: TeamCreateDTO) => Promise<Team>
  updateTeam: (id: string, data: TeamUpdateDTO) => Promise<Team>
  deleteTeam: (id: string) => Promise<void>
  inviteMember: (teamId: string, identifier: string, role: string) => Promise<void>
  removeMember: (teamId: string, userId: string) => Promise<void>
  updateMemberRole: (teamId: string, userId: string, role: MemberUpdateDTO) => Promise<Member>
  getMembers: (teamId: string, page?: number, pageSize?: number) => Promise<PaginatedResponse<Member>>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })

  const loadTeams = useCallback(async (page = 1, pageSize = 10) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await teamsApi.list(page, pageSize)
      setTeams(response.data)
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams')
      console.error('Team load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user?.id) {
      loadTeams()
    } else {
      setTeams([])
      setLoading(false)
    }
  }, [user, loadTeams])

  const createTeam = async (dto: TeamCreateDTO) => {
    setError(null)
    try {
      const team = await teamsApi.create(dto)
      setTeams(prev => [...prev, team])
      return team
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create team'
      setError(message)
      throw err
    }
  }

  const updateTeam = async (id: string, dto: TeamUpdateDTO) => {
    setError(null)
    try {
      const team = await teamsApi.update(id, dto)
      setTeams(prev => prev.map(t => t.id === id ? team : t))
      return team
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update team'
      setError(message)
      throw err
    }
  }

  const deleteTeam = async (id: string) => {
    setError(null)
    try {
      await teamsApi.delete(id)
      setTeams(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete team'
      setError(message)
      throw err
    }
  }

  const inviteMember = async (teamId: string, identifier: string, role: string) => {
    setError(null)
    try {
      if(role !== 'admin' && role !== 'member') {
        throw new Error('Invalid role')
      }
      await teamsApi.sendInvite(teamId, {identifier, role})
      await loadTeams(pagination.page, pagination.pageSize)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to invite member'
      setError(message)
      throw err
    }
  }

  const removeMember = async (teamId: string, userId: string) => {
    setError(null)
    try {
      await teamsApi.removeMember(teamId, userId)
      await loadTeams(pagination.page, pagination.pageSize)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove member'
      setError(message)
      throw err
    }
  }

  const updateMemberRole = async (teamId: string, userId: string, role: MemberUpdateDTO) => {
    setError(null)
    try {
      const member = await teamsApi.updateMemberRole(teamId, userId, role)
      await loadTeams(pagination.page, pagination.pageSize)
      return member
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update role'
      setError(message)
      throw err
    }
  }

  const getMembers = async (teamId: string, page = 1, pageSize = 10) => {
    setError(null)
    try {
      return await teamsApi.getMembers(teamId, page, pageSize)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load members'
      setError(message)
      throw err
    }
  }

  return (
    <TeamContext.Provider value={{
      teams,
      loading,
      error,
      pagination,
      loadTeams,
      createTeam,
      updateTeam,
      deleteTeam,
      inviteMember,
      removeMember,
      updateMemberRole,
      getMembers
    }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam(): TeamContextType {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used within a TeamProvider')
  return ctx
}