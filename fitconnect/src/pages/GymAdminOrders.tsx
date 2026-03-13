import { useEffect, useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import { exportToCSV, formatDateForCSV, type CSVRow } from '../utils/csvExport'

type OrderRow = {
  id?: string
  user_id?: string
  user_email?: string
  user_name?: string
  total_amount?: number | string
  status?: string
  created_at?: string
  delivery_status?: string
  delivery_date?: string
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
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

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
      .select('id, user_id, total_amount, status, created_at, delivery_status, delivery_date')
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

  const handleExportCSV = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🔵 handleExportCSV called')
    console.log('📊 Total orders:', orders.length)
    
    if (orders.length === 0) {
      console.warn('⚠️ No orders to export')
      alert('No hay órdenes para exportar')
      return
    }

    try {
      const csvData: CSVRow[] = orders.map((order) => ({
        ID: order.id || '',
        Cliente: order.user_name || 'Sin nombre',
        Email: order.user_email || 'Sin email',
        Monto: typeof order.total_amount === 'number' ? order.total_amount.toFixed(2) : order.total_amount,
        'Estado de Pago': order.status === 'paid' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : order.status,
        'Estado Entrega': order.delivery_status === 'delivered' ? 'Entregado' : 'Pendiente',
        Fecha: order.created_at ? formatDateForCSV(order.created_at) : '',
        'Fecha Entrega': order.delivery_date ? formatDateForCSV(order.delivery_date) : ''
      }))

      console.log('✅ CSV data prepared:', csvData.length, 'rows')

      const now = new Date()
      const filename = `ordenes-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`
      
      console.log('📥 Starting export to file:', filename)
      exportToCSV(csvData, filename)
      console.log('✨ Export completed')
    } catch (error) {
      console.error('❌ Export error:', error)
      alert('Error al exportar: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    }
  }

  const handleMarkAsDelivered = async (orderId: string) => {
    setUpdatingOrderId(orderId)
    try {
      const now = new Date().toISOString()
      const { error: updateError } = await supabase
        .from('orders')
        .update({ delivery_status: 'delivered', delivery_date: now })
        .eq('id', orderId)
      
      if (updateError) throw updateError
      
      // Actualizar el estado local
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === orderId
            ? { ...o, delivery_status: 'delivered', delivery_date: now }
            : o
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar como entregado')
    } finally {
      setUpdatingOrderId(null)
    }
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

      <Card subtitle="Flujo de carrito → pago → entrega" action={
        <button
          onClick={handleExportCSV}
          disabled={loading || orders.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-primary/15 text-primary border border-primary/30 px-3 py-2 text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} /> Exportar
        </button>
      }>
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
                  <th className="py-3 px-2">ID Pedido</th>
                  <th className="py-3 px-2">Cliente</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Monto</th>
                  <th className="py-3 px-2">Estado</th>
                  <th className="py-3 px-2">Entrega</th>
                  <th className="py-3 px-2">Fecha</th>
                  <th className="py-3 px-2">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => {
                  const totalVal = getTotalValue(o.total_amount)
                  return (
                    <tr key={o.id}>
                      <td className="py-3 px-2 font-mono text-xs text-text-secondary">{o.id || '—'}</td>
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
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            o.delivery_status === 'delivered'
                              ? 'bg-success/15 text-success border border-success/30'
                              : 'bg-warning/15 text-warning border border-warning/30'
                          }`}
                        >
                          {o.delivery_status === 'delivered' ? 'Entregado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-text-secondary">
                        {o.delivery_status === 'delivered' && o.delivery_date
                          ? new Date(o.delivery_date).toLocaleString('es-ES')
                          : o.created_at
                            ? new Date(o.created_at).toLocaleString('es-ES')
                            : '—'}
                      </td>
                      <td className="py-3 px-2">
                        {o.delivery_status !== 'delivered' && (
                          <button
                            onClick={() => handleMarkAsDelivered(o.id!)}
                            disabled={updatingOrderId === o.id}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-60 transition-colors"
                          >
                            {updatingOrderId === o.id ? 'Actualizando...' : 'Marcar entregada'}
                          </button>
                        )}
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
