import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth()
  const location = useLocation()
  const [showLoader, setShowLoader] = useState(false)

  // Prevent loader flicker for fast auth checks
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setShowLoader(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [loading])

  if (loading || showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div 
          role="status"
          aria-label="Checking authentication status"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
        />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          from: location,
          error: error || 'You need to be logged in to access this page'
        }} 
      />
    )
  }

  return <>{children}</>
}