import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <Outlet />
}
