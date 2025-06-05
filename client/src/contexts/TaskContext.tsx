import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { tasksApi } from '../lib/api/tasks'
import type { Task, TaskCreateDTO, TaskUpdateDTO } from '../lib/api/types'
import { useAuth } from './AuthContext'

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  loadTasks: (filters?: {
    teamId?: string
    isPersonal?: boolean
    page?: number
    pageSize?: number
  }) => Promise<void>
  createTask: (task: TaskCreateDTO) => Promise<Task>
  updateTask: (id: string, updates: TaskUpdateDTO) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })

  const loadTasks = useCallback(async (filters: { teamId?: string; isPersonal?: boolean; page?: number; pageSize?: number } = {}) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await tasksApi.list({
        ...filters,
        page: filters.page || pagination.page,
        pageSize: filters.pageSize || pagination.pageSize
      })
      
      setTasks(response.data)
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
      console.error('Task load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, pagination.page, pagination.pageSize])

  const refresh = useCallback(() => loadTasks(), [loadTasks])

  useEffect(() => {
    if (user?.id) {
      loadTasks()
    } else {
      setTasks([])
      setLoading(false)
    }
  }, [user, loadTasks])

  const createTask = async (task: TaskCreateDTO) => {
    setError(null)
    try {
      const newTask = await tasksApi.create(task)
      setTasks(prev => [newTask, ...prev])
      return newTask
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task'
      setError(message)
      throw err
    }
  }

  const updateTask = async (id: string, updates: TaskUpdateDTO) => {
    setError(null)
    try {
      const updatedTask = await tasksApi.update(id, updates)
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t))
      return updatedTask
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      setError(message)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    setError(null)
    try {
      await tasksApi.delete(id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task'
      setError(message)
      throw err
    }
  }

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      loading, 
      error,
      pagination,
      loadTasks,
      createTask,
      updateTask,
      deleteTask,
      refresh
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks(): TaskContextType {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider')
  return ctx
}