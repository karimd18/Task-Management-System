import React, { useState, useEffect } from 'react'
import {
  Plus,
  Settings,
  UserPlus,
  Users,
  X,
  Trash2,
  Shield
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTeam } from '../contexts/TeamContext'
import type { Team, TeamCreateDTO, TeamUpdateDTO, MemberInviteDTO } from '../lib/api/types'
import { teamsApi } from '../lib/api/teams'
import { Navbar } from '../components/Navbar'

interface TeamModalProps {
  team: Team | null
  isOpen: boolean
  onClose: () => void
  onCreate: (data: TeamCreateDTO) => Promise<void>
  onUpdate: (id: string, data: TeamUpdateDTO) => Promise<void>
  onDelete?: () => Promise<void>
  mode: 'create' | 'edit'
}

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (dto: MemberInviteDTO) => Promise<void>
}

const TeamModal: React.FC<TeamModalProps> = ({
  team,
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  mode
}) => {
  const [name, setName] = useState(team?.name || '')
  const [description, setDescription] = useState(team?.description || '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setName(team?.name || '')
    setDescription(team?.description || '')
    setError(null)
  }, [isOpen, team])

  const validateInput = () => {
    if (!name.trim()) {
      setError('Team name is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateInput()) return

    try {
      if (mode === 'create') {
        await onCreate({
          name: name.trim(),
          description: description.trim()
        })
      } else if (team?.id) {
        await onUpdate(team.id, {
          name: name.trim(),
          description: description.trim()
        })
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this team? This cannot be undone.')) return
    try {
      await onDelete?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {mode === 'create' ? 'Create Team' : 'Edit Team'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                         focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                         focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          <div className="flex justify-between">
            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 dark:border-red-500 text-red-700 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-5 w-5 inline mr-2" /> Delete Team
              </button>
            )}
            <div className="flex ml-auto space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
              >
                {mode === 'create' ? 'Create Team' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setRole('member')
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    try {
      await onInvite({
        identifier: email.trim(),
        role
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invite Member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                       focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          />

          <label htmlFor="role" className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Role *
          </label>
          <select
            id="role"
            value={role}
            onChange={e => setRole(e.target.value as 'admin' | 'member')}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                       focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TeamsBoard({ onViewTasks }: { onViewTasks: (teamId: string | null) => void }) {
  const { user } = useAuth()
  const { teams, loadTeams, createTeam, updateTeam, deleteTeam } = useTeam()
  const [state, setState] = useState({
    showTeamModal: false,
    showInviteModal: false,
    editingTeam: null as Team | null,
    modalMode: 'create' as 'create' | 'edit',
    inviteTeamId: null as string | null,
    error: ''
  })

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadTeams()
      } catch (err) {
        setState(s => ({ ...s, error: err instanceof Error ? err.message : 'Failed to load teams' }))
      }
    }
    initialize()
  }, [])

  const checkAdmin = async (teamId: string) => {
    console.log('Checking admin for team:', teamId)
    console.log('User:', user)
    if (!user) return false
    try {
      console.log('Checking if user is admin:', await teamsApi.isTeamAdmin(teamId, user.id))
      return await teamsApi.isTeamAdmin(teamId, user.id)
    } catch (err) {
      setState(s => ({ ...s, error: err instanceof Error ? err.message : 'Authorization check failed' }))
      return false
    }
  }

  const handleCreateTeam = async (dto: TeamCreateDTO) => {
    try {
      await createTeam(dto)
      await loadTeams()
    } catch (err) {
      setState(s => ({ ...s, error: err instanceof Error ? err.message : 'Failed to create team' }))
    }
  }

  const handleUpdateTeam = async (id: string, dto: TeamUpdateDTO) => {
    try {
      await updateTeam(id, dto)
      await loadTeams()
    } catch (err) {
      setState(s => ({ ...s, error: err instanceof Error ? err.message : 'Failed to update team' }))
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId)
      await loadTeams()
    } catch (err) {
      setState(s => ({ ...s, error: err instanceof Error ? err.message : 'Failed to delete team' }))
    }
  }

  const handleInviteMember = async (dto: MemberInviteDTO) => {
    if (!state.inviteTeamId) return
    try {
      await teamsApi.sendInvite(state.inviteTeamId, dto);
      await teamsApi.updateMemberRole(state.inviteTeamId, dto.identifier, { role: dto.role })
      await loadTeams()
    } catch (err) {
      setState(s => ({ ...s, error: err instanceof Error ? err.message : 'Failed to send invitation' }))
    }
  }

  const openEditModal = async (team: Team) => {
    if (!user) return
    try {
      const isAdmin = await checkAdmin(team.id)
      console.log('isAdmin:', isAdmin)
      if (!isAdmin) {
        setState(s => ({ ...s, error: 'Only team admins can edit teams' }))
        return
      }
      setState(s => ({ ...s, editingTeam: team, modalMode: 'edit', showTeamModal: true }))
    } catch (err) {
      setState(s => ({ ...s, error: 'Failed to verify admin permissions' }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4">
        {state.error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {state.error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
          </div>
          <button
            onClick={() => setState(s => ({ ...s, showTeamModal: true, modalMode: 'create' }))}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" /> New Team
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personal Tasks Card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Personal Tasks</h3>
            <p className="text-white/80 mb-6">Manage your individual tasks and projects</p>
            <button
              onClick={() => onViewTasks(null)}
              className="w-full px-4 py-2 bg-white/20 rounded-md hover:bg-white/30"
            >
              View Tasks
            </button>
          </div>

          {/* Team Cards */}
          {teams.map(team => (
            <div key={team.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                  {team.members?.some(m => m.userId === user?.id && m.role === 'admin') && (
                    <Shield className="h-5 w-5 text-indigo-600" />
                  )}
                </div>
                <button 
                  onClick={() => openEditModal(team)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onViewTasks(team.id)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  View Tasks
                </button>
                <button
                  onClick={() => setState(s => ({ ...s, inviteTeamId: team.id, showInviteModal: true }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <UserPlus className="inline mr-2 h-4 w-4" /> Invite Members
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modals */}
        <TeamModal
          team={state.editingTeam}
          isOpen={state.showTeamModal}
          onClose={() => setState(s => ({ ...s, showTeamModal: false }))}
          onCreate={handleCreateTeam}
          onUpdate={handleUpdateTeam}
          onDelete={state.editingTeam ? () => handleDeleteTeam(state.editingTeam!.id) : undefined}
          mode={state.modalMode}
        />

        <InviteModal
          isOpen={state.showInviteModal}
          onClose={() => setState(s => ({ ...s, showInviteModal: false }))}
          onInvite={handleInviteMember}
        />
      </main>
    </div>
  )
}