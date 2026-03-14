import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

type PaymentRow = {
  id?: string
  user_id?: string
  user_name?: string
  user_email?: string
  total_amount?: number | string
  status?: string
  stripe_payment_intent_id?: string
  created_at?: string
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      
      // Get all orders
      const { data: orderData, error: err } = await supabase
        .from('orders')
        .select('id, user_id, total_amount, status, stripe_payment_intent_id, created_at')
        .order('created_at', { ascending: false })
      
      if (!active) return
      
      if (err) {
        setError(err.message)
        setPayments([])
      } else {
        let processedData: PaymentRow[] = []
        
        if (orderData && Array.isArray(orderData) && orderData.length > 0) {
          // Extract subscription data
          const userData = orderData as Array<Record<string, unknown>>
          
          // Extract unique user IDs
          const userIds = [...new Set(userData.map((order) => order.user_id as string))]
          
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
          
          // Process all orders
          processedData = userData.map((order) => {
            const userId = order.user_id as string
            const userEmail = emailMap.get(userId)
            const userName = nameMap.get(userId)
            
            return {
              id: order.id as string | undefined,
              user_id: userId,
              user_name: userName || 'Sin usuario',
              user_email: userEmail || 'Sin correo',
              total_amount: order.total_amount as number | string | undefined,
              status: order.status as string | undefined,
              stripe_payment_intent_id: (order.stripe_payment_intent_id as string) || undefined,
              created_at: order.created_at as string | undefined
            }
          })
        }
        
        setPayments(processedData)
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const formatAmount = (value?: number | string) => {
    if (value === undefined || value === null) return 'N/D'
    if (typeof value === 'number') return `$${value.toFixed(2)}`
    return String(value)
  }

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/15 text-success border-success/30'
      case 'pending':
        return 'bg-warning/15 text-warning border-warning/30'
      case 'failed':
        return 'bg-error/15 text-error border-error/30'
      default:
        return 'bg-text-secondary/10 text-text border-border'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'pending':
        return 'Pendiente'
      case 'failed':
        return 'Fallido'
      default:
        return status ?? 'Desconocido'
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="animate-spin" size={16} /> Cargando pagos
        </div>
      )
    }

    if (error) {
      return (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
      )
    }

    if (payments.length === 0) {
      return (
        <p className="text-sm text-text-secondary">Sin pagos registrados.</p>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-text-secondary">
            <tr>
              <th className="py-2">ID Orden</th>
              <th className="py-2">Usuario</th>
              <th className="py-2">Monto Total</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Referencia Stripe</th>
              <th className="py-2">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p) => (
              <tr key={p.id ?? `${p.user_name}-${p.created_at}`}>
                <td className="py-3 font-semibold text-text">{p.id ? p.id.substring(0, 8) : '—'}</td>
                <td className="py-3">{p.user_name ?? 'Sin usuario'}</td>
                <td className="py-3">{formatAmount(p.total_amount)}</td>
                <td className="py-3">
                  <span className={`pill text-xs ${getStatusBadgeColor(p.status)}`}>
                    {getStatusLabel(p.status)}
                  </span>
                </td>
                <td className="py-3 text-text-secondary text-xs">{p.stripe_payment_intent_id?.substring(0, 20) ?? '—'}...</td>
                <td className="py-3 text-text-secondary">{p.created_at ? new Date(p.created_at).toLocaleString('es-ES') : '—'}</td>
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
        <p className="text-sm text-text-secondary">Pagos</p>
        <h1 className="text-2xl font-bold">Órdenes y transacciones</h1>
      </div>
      <Card subtitle="Pagos y órdenes registradas en la tabla orders">
        {renderContent()}
      </Card>
    </div>
  )
}

export default AdminPayments
