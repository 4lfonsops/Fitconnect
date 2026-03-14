import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

type SubscriptionRow = {
  id?: string
  user_id?: string
  plan_id?: string
  user_email?: string
  user_name?: string
  gym_name?: string
  plan_name?: string
  status?: string
  start_date?: string
  end_date?: string
  created_at?: string
  stripe_payment_id?: string | null
}

const AdminSubscriptions = () => {
  const [subs, setSubs] = useState<SubscriptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      
      // Get user subscriptions with all related data
      const { data: subscriptionData, error: err } = await supabase
        .from('user_subscriptions')
        .select(
          `
          id,
          user_id,
          plan_id,
          start_date,
          end_date,
          status,
          stripe_payment_id,
          created_at,
          subscription_plans(
            id,
            name,
            gym_id,
            gyms(
              id,
              name
            )
          )
          `
        )
        .order('created_at', { ascending: false })

      if (!active) return
      
      if (err) {
        setError(err.message)
        setSubs([])
      } else {
        let processedData: SubscriptionRow[] = []
        
        if (subscriptionData && Array.isArray(subscriptionData) && subscriptionData.length > 0) {
          // Extract subscription data
          const userData = subscriptionData as Array<Record<string, unknown>>
          
          // Extract unique user IDs
          const userIds = [...new Set(userData.map((sub) => sub.user_id as string))]
          
          // Get user emails from auth.users using RPC function
          const { data: userEmails } = await supabase
            .rpc('get_user_emails', { user_ids: userIds })
          
          // Create email map
          const emailMap = new Map<string, string>()
          if (userEmails && Array.isArray(userEmails)) {
            userEmails.forEach((user: Record<string, unknown>) => {
              emailMap.set(user.id as string, (user.email as string) || '')
            })
          }
          
          // Get user names from profiles using RPC function
          const { data: userNames } = await supabase
            .rpc('get_user_names', { user_ids: userIds })
          
          // Create name map
          const nameMap = new Map<string, string>()
          if (userNames && Array.isArray(userNames)) {
            userNames.forEach((user: Record<string, unknown>) => {
              nameMap.set(user.id as string, (user.name as string) || '')
            })
          }
          
          // Process all subscriptions
          processedData = userData.map((sub) => {
            const userId = sub.user_id as string
            const userEmail = emailMap.get(userId)
            const userName = nameMap.get(userId)
            
            const planData = sub.subscription_plans as Array<Record<string, unknown>> | Record<string, unknown> | undefined
            let plan: Record<string, unknown> | undefined
            
            if (Array.isArray(planData) && planData.length > 0) {
              plan = planData[0]
            } else if (!Array.isArray(planData) && planData) {
              plan = planData
            }
            const gymsData = plan?.gyms as Array<Record<string, unknown>> | Record<string, unknown> | undefined
            let gym: Record<string, unknown> | undefined
            
            if (Array.isArray(gymsData) && gymsData.length > 0) {
              gym = gymsData[0]
            } else if (!Array.isArray(gymsData) && gymsData) {
              gym = gymsData
            }
            return {
              id: sub.id as string | undefined,
              user_id: userId,
              plan_id: sub.plan_id as string | undefined,
              user_email: userEmail || 'Sin correo',
              user_name: userName || 'Sin usuario',
              gym_name: (gym?.name as string) || 'Sin gimnasio',
              plan_name: (plan?.name as string) || 'Sin plan',
              status: sub.status as string | undefined,
              start_date: sub.start_date as string | undefined,
              end_date: sub.end_date as string | undefined,
              created_at: sub.created_at as string | undefined,
              stripe_payment_id: (sub.stripe_payment_id as string | null) || undefined
            }
          })
        }
        
        setSubs(processedData)
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const formatDate = (value?: string) => {
    if (!value) return '—'
    const date = new Date(value)
    return date.toLocaleDateString('es-ES')
  }

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/15 text-success border-success/30'
      case 'inactive':
        return 'bg-error/15 text-error border-error/30'
      case 'cancelled':
        return 'bg-warning/15 text-warning border-warning/30'
      default:
        return 'bg-text-secondary/10 text-text border-border'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Activa'
      case 'inactive':
        return 'Inactiva'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status ?? 'Sin estado'
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="animate-spin" size={16} /> Cargando suscripciones
        </div>
      )
    }

    if (error) {
      return (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
      )
    }

    if (subs.length === 0) {
      return (
        <p className="text-sm text-text-secondary">Sin suscripciones registradas.</p>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-text-secondary">
            <tr>
              <th className="py-2">Usuario</th>
              <th className="py-2">Email</th>
              <th className="py-2">Gimnasio</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Inicio</th>
              <th className="py-2">Vencimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subs.map((s) => (
              <tr key={s.id ?? `${s.user_email}-${s.plan_name}-${s.created_at}`}>
                <td className="py-3 font-semibold text-text">{s.user_name ?? 'Sin usuario'}</td>
                <td className="py-3 text-text-secondary">{s.user_email ?? 'Sin email'}</td>
                <td className="py-3">{s.gym_name ?? 'Sin gimnasio'}</td>
                <td className="py-3">{s.plan_name ?? 'N/D'}</td>
                <td className="py-3">
                  <span className={`pill text-xs ${getStatusBadgeColor(s.status)}`}>
                    {getStatusLabel(s.status)}
                  </span>
                </td>
                <td className="py-3 text-text-secondary">{formatDate(s.start_date)}</td>
                <td className="py-3 text-text-secondary">{formatDate(s.end_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Suscripciones</p>
        <h1 className="text-2xl font-bold">Asociación usuario ↔ gimnasio</h1>
      </div>
      <Card subtitle="Estado y vigencia de planes por gimnasio">
        {renderContent()}
      </Card>
    </div>
  )
}

export default AdminSubscriptions
