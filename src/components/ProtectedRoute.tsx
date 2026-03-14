import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

type ProtectedRouteProps = {
  children: React.ReactNode
  requiredRole?: 'superadmin' | 'gym_admin'
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    let mounted = true

    const checkAuthorization = async () => {
      try {
        // Verificar si hay sesión activa
        const { data: auth } = await supabase.auth.getUser()

        if (!auth.user) {
          if (mounted) {
            setIsAuthorized(false)
            setIsLoading(false)
          }
          return
        }

        // Si no se especifica rol requerido, solo verificamos que esté autenticado
        if (!requiredRole) {
          if (mounted) {
            setIsAuthorized(true)
            setIsLoading(false)
          }
          return
        }

        // Verificar el rol del usuario en la tabla administrators
        const { data: admin, error: adminError } = await supabase
          .from('administrators')
          .select('role')
          .eq('user_id', auth.user.id)
          .maybeSingle()

        if (adminError) {
          console.error('Error checking role in ProtectedRoute:', adminError)
        }

        if (mounted) {
          const hasRequiredRole = !!(admin && admin.role === requiredRole)
          setIsAuthorized(hasRequiredRole)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error in authorization check:', error)
        if (mounted) {
          setIsAuthorized(false)
          setIsLoading(false)
        }
      }
    }

    checkAuthorization()

    return () => {
      mounted = false
    }
  }, [requiredRole])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface text-text flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          <p className="text-sm text-text-secondary">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
