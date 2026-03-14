import { useEffect, useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import { exportToCSV, formatDateForCSV, type CSVRow } from '../utils/csvExport'

type PaymentRow = {
  id?: string
  user_id?: string
  user_email?: string
  user_name?: string
  total_amount?: number | string
  stripe_payment_intent_id?: string
  status?: string
  created_at?: string
  stripe_fee?: number
}

type MetricData = {
  totalIncome: number
  successfulTransactions: number
  stripeFees: number
  averageTransaction: number
}

const GymAdminPayments = () => {
  const [gymId, setGymId] = useState<string | null>(null)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [metrics, setMetrics] = useState<MetricData>({ totalIncome: 0, successfulTransactions: 0, stripeFees: 0, averageTransaction: 0 })
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
    
    if (adminError) throw adminError
    if (!admin?.gym_id) throw new Error('El administrador no tiene gimnasio asignado')
    
    return admin.gym_id
  }

  const loadPayments = async (currentGymId: string) => {
    const { data, error: payError } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, stripe_payment_intent_id, status, created_at')
      .eq('gym_id', currentGymId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
    
    if (payError) {
      console.error('Error cargando pagos:', payError)
      throw new Error(`Error al cargar pagos: ${payError.message}`)
    }

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id))]
      
      const { data: emails } = await supabase.rpc('get_user_emails', { user_ids: userIds })
      const { data: names } = await supabase.rpc('get_user_names', { user_ids: userIds })
      
      const emailMap = Object.fromEntries(emails?.map((e: any) => [e.id, e.email]) ?? [])
      const namesMap = Object.fromEntries(names?.map((n: any) => [n.id, n.full_name ?? n.name]) ?? [])
      
      const enriched: PaymentRow[] = data.map(p => {
        const amount = typeof p.total_amount === 'number' ? p.total_amount : Number(p.total_amount)
        const stripeFee = (amount * 0.029) + 0.3 // 2.9% + $0.30
        return {
          ...p,
          user_email: emailMap[p.user_id] || 'Sin email',
          user_name: namesMap[p.user_id] || 'Sin nombre',
          stripe_fee: stripeFee
        }
      })
      
      setPayments(enriched)
      
      // Calcular métricas de los últimos 30 días
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
      
      const recentPayments = enriched.filter(p => p.created_at && new Date(p.created_at) >= thirtyDaysAgo)
      const totalIncome = recentPayments.reduce((sum, p) => {
        const val = typeof p.total_amount === 'number' ? p.total_amount : Number(p.total_amount)
        return sum + (isNaN(val) ? 0 : val)
      }, 0)
      
      const totalFees = recentPayments.reduce((sum, p) => sum + (p.stripe_fee || 0), 0)
      const average = recentPayments.length > 0 ? totalIncome / recentPayments.length : 0
      
      setMetrics({
        totalIncome,
        successfulTransactions: recentPayments.length,
        stripeFees: totalFees,
        averageTransaction: average
      })
    } else {
      setPayments([])
      setMetrics({ totalIncome: 0, successfulTransactions: 0, stripeFees: 0, averageTransaction: 0 })
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
        await loadPayments(currentGymId)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los pagos')
      } finally {
        if (active) setLoading(false)
      }
    }
    init()
    return () => {
      active = false
    }
  }, [])

  const formatAmount = (value?: number | string) => {
    if (value === undefined || value === null) return '$0.00'
    const num = typeof value === 'number' ? value : Number(value)
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`
  }

  const handleExportCSV = () => {
    console.log('Exporting payments...', payments.length)
    const csvData: CSVRow[] = payments.map((payment) => ({
      ID: payment.id || '',
      Cliente: payment.user_name || 'Sin nombre',
      Email: payment.user_email || 'Sin email',
      Monto: typeof payment.total_amount === 'number' ? payment.total_amount.toFixed(2) : payment.total_amount,
      'Comisión Stripe': payment.stripe_fee ? payment.stripe_fee.toFixed(2) : '0.00',
      'ID Stripe': payment.stripe_payment_intent_id || 'N/A',
      Fecha: payment.created_at ? formatDateForCSV(payment.created_at) : ''
    }))

    const now = new Date()
    const filename = `pagos-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`
    exportToCSV(csvData, filename)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Pagos</p>
        <h1 className="text-2xl font-bold">Cobros y depósitos</h1>
        {gymId && <p className="text-xs text-text-secondary mt-1">Gym: {gymId}</p>}
      </div>

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">Ingresos (mes)</p>
              <p className="text-2xl font-bold">{formatAmount(metrics.totalIncome)}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">Transacciones</p>
              <p className="text-2xl font-bold">{metrics.successfulTransactions}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">Comisión Stripe</p>
              <p className="text-2xl font-bold">{formatAmount(metrics.stripeFees)}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">Promedio</p>
              <p className="text-2xl font-bold">{formatAmount(metrics.averageTransaction)}</p>
            </div>
          </Card>
        </div>
      )}

      <Card subtitle="Transacciones Stripe procesadas" action={
        <button
          onClick={handleExportCSV}
          disabled={loading || payments.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-primary/15 text-primary border border-primary/30 px-3 py-2 text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} /> Exportar
        </button>
      }>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 size={16} className="animate-spin" />
            Cargando pagos
          </div>
        ) : error ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
        ) : payments.length === 0 ? (
          <p className="text-sm text-text-secondary">Sin pagos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-text-secondary">
                <tr className="border-b border-border">
                  <th className="py-3 px-2">Cliente</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Monto</th>
                  <th className="py-3 px-2">Comisión</th>
                  <th className="py-3 px-2">ID Stripe</th>
                  <th className="py-3 px-2">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-2 font-semibold text-text">{p.user_name || 'Sin nombre'}</td>
                    <td className="py-3 px-2 text-text-secondary text-xs">{p.user_email || 'Sin email'}</td>
                    <td className="py-3 px-2 font-semibold">{formatAmount(p.total_amount)}</td>
                    <td className="py-3 px-2 text-warning">{formatAmount(p.stripe_fee)}</td>
                    <td className="py-3 px-2 text-xs text-text-secondary">
                      {p.stripe_payment_intent_id 
                        ? p.stripe_payment_intent_id.substring(0, 20) + '...' 
                        : '—'}
                    </td>
                    <td className="py-3 px-2 text-text-secondary text-xs">
                      {p.created_at ? new Date(p.created_at).toLocaleString('es-ES') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default GymAdminPayments
