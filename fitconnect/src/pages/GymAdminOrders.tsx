import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

type OrderRow = {
  id?: string
  user_id?: string
  user_email?: string
  user_name?: string
  total_amount?: number | string
  status?: string
  created_at?: string
}

type MetricData = {
  totalIncome: number
  completedOrders: number
  pendingOrders: number
}

const GymAdminOrders = () => {
  const [gymId, setGymId] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [metrics, setMetrics] = useState<MetricData>({ totalIncome: 0, completedOrders: 0, pendingOrders: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadGymId = async () => {
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth.user?.id
    if (!userId) throw new Error('No hay sesión activa')
    
    const { data: admin, error: adminError } = await supabase
      .from('administrators')
      .select('gym_id')
      .eq('user_id', userId)
      .single()
    
    if (adminError) {
      console.error('Error cargando admin:', adminError)
      throw new Error(`Error al cargar administrador: ${adminError.message}`)
    }
    if (!admin?.gym_id) throw new Error('El administrador no tiene gimnasio asignado')
    
    return admin.gym_id
  }

  const loadOrders = async (currentGymId: string) => {
    const { data, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, status, created_at')
      .eq('gym_id', currentGymId)
      .order('created_at', { ascending: false })
    
    if (ordersError) {
      console.error('Error cargando órdenes:', ordersError)
      throw new Error(`Error al cargar órdenes: ${ordersError.message}`)
    }

    // Obtener emails y nombres de usuarios
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(o => o.user_id))]
      
      const { data: emails } = await supabase.rpc('get_user_emails', { user_ids: userIds })
      const { data: names } = await supabase.rpc('get_user_names', { user_ids: userIds })
      
      const emailMap = Object.fromEntries(emails?.map((e: any) => [e.id, e.email]) ?? [])
      const namesMap = Object.fromEntries(names?.map((n: any) => [n.id, n.full_name ?? n.name]) ?? [])
      
      const enriched = data.map(o => ({
        ...o,
        user_email: emailMap[o.user_id] || 'Sin email',
        user_name: namesMap[o.user_id] || 'Sin nombre'
      }))
      
      setOrders(enriched)
      
      // Calcular métricas
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const monthOrders = enriched.filter(o => new Date(o.created_at) >= monthStart)
      const totalIncome = monthOrders
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => {
          const val = typeof o.total_amount === 'number' ? o.total_amount : Number(o.total_amount)
          return sum + (isNaN(val) ? 0 : val)
        }, 0)
      
      setMetrics({
        totalIncome,
        completedOrders: enriched.filter(o => o.status === 'paid').length,
        pendingOrders: enriched.filter(o => o.status === 'pending').length
      })
    } else {
      setOrders([])
      setMetrics({ totalIncome: 0, completedOrders: 0, pendingOrders: 0 })
    }
  }

  useEffect(() => {
    let active = true
    const init = async () => {
      setLoading(true)
      setError('')
      try {
        const currentGymId = await loadGymId()
        if (!active) return
        setGymId(currentGymId)
        await loadOrders(currentGymId)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los pedidos')
      } finally {
        if (active) setLoading(false)
      }
    }
    init()
    return () => {
      active = false
    }
  }, [])

  const getTotalValue = (val: number | string | undefined) => {
    if (val === undefined || val === null) return 0
    return typeof val === 'number' ? val : Number(val)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Pedidos</p>
        <h1 className="text-2xl font-bold">Ventas y logística</h1>
        {gymId && <p className="text-xs text-text-secondary mt-1">Gym: {gymId}</p>}
      </div>

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">Ingresos del mes</p>
              <p className="text-2xl font-bold">${metrics.totalIncome.toFixed(2)}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">Órdenes completadas</p>
              <p className="text-2xl font-bold">{metrics.completedOrders}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">Órdenes pendientes</p>
              <p className="text-2xl font-bold">{metrics.pendingOrders}</p>
            </div>
          </Card>
        </div>
      )}

      <Card subtitle="Flujo de carrito → pago → entrega">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 size={16} className="animate-spin" />
            Cargando pedidos
          </div>
        ) : error ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-text-secondary">Sin pedidos en este gimnasio.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-text-secondary">
                <tr className="border-b border-border">
                  <th className="py-3 px-2">Cliente</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Monto</th>
                  <th className="py-3 px-2">Estado</th>
                  <th className="py-3 px-2">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => {
                  const totalVal = getTotalValue(o.total_amount)
                  return (
                    <tr key={o.id}>
                      <td className="py-3 px-2 font-semibold text-text">{o.user_name || 'Sin nombre'}</td>
                      <td className="py-3 px-2 text-text-secondary">{o.user_email || 'Sin email'}</td>
                      <td className="py-3 px-2 font-semibold">${totalVal.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            o.status === 'paid'
                              ? 'bg-success/15 text-success border border-success/30'
                              : o.status === 'pending'
                                ? 'bg-warning/15 text-warning border border-warning/30'
                                : 'bg-text-secondary/10 text-text border border-border'
                          }`}
                        >
                          {o.status === 'paid' ? 'Pagado' : o.status === 'pending' ? 'Pendiente' : o.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-text-secondary">
                        {o.created_at ? new Date(o.created_at).toLocaleString('es-ES') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default GymAdminOrders
