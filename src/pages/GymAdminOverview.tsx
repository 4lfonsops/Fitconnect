import { useEffect, useState } from 'react'
import { Activity, CreditCard, Loader2, Users, Download } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import { exportToCSV, type CSVRow } from '../utils/csvExport'

type MonthlySeries = { labels: string[]; data: number[] }

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const getLastMonths = (count: number) => {
  const now = new Date()
  const months: { label: string; key: string }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ label: `${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`, key: `${date.getFullYear()}-${date.getMonth()}` })
  }
  return months
}

const rollupByMonth = (rows: { created_at: string | null }[]): MonthlySeries => {
  const months = getLastMonths(6)
  const counter = months.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.key]: 0 }), {})
  rows.forEach((row) => {
    if (!row.created_at) return
    const d = new Date(row.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (counter[key] !== undefined) counter[key] += 1
  })
  return { labels: months.map((m) => m.label), data: months.map((m) => counter[m.key] ?? 0) }
}

const rollupByMonthSum = (rows: { created_at: string | null; total_amount: number }[]): MonthlySeries => {
  const months = getLastMonths(6)
  const counter = months.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.key]: 0 }), {})
  rows.forEach((row) => {
    if (!row.created_at) return
    const d = new Date(row.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (counter[key] !== undefined) counter[key] += row.total_amount
  })
  return { labels: months.map((m) => m.label), data: months.map((m) => counter[m.key] ?? 0) }
}

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data.length) return <p className="text-sm text-text-secondary">Sin datos</p>
  const max = Math.max(...data, 1)
  const points = data.map((value, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * 100
    const y = 32 - (value / max) * 32
    return `${x},${y}`
  })
  return (
    <svg viewBox="0 0 100 32" className="w-full h-24" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points.join(' ')} />
    </svg>
  )
}

const GymAdminOverview = () => {
  const [gymId, setGymId] = useState<string | null>(null)
  const [memberCount, setMemberCount] = useState(0)
  const [activeSubs, setActiveSubs] = useState(0)
  const [salesAmount, setSalesAmount] = useState(0)
  const [userSeries, setUserSeries] = useState<MonthlySeries>({ labels: [], data: [] })
  const [subSeries, setSubSeries] = useState<MonthlySeries>({ labels: [], data: [] })
  const [salesSeries, setSalesSeries] = useState<MonthlySeries>({ labels: [], data: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data: auth } = await supabase.auth.getUser()
        const userId = auth.user?.id
        if (!userId) throw new Error('No hay sesión activa')

        // Obtener gym_id de la tabla administrators
        const { data: admin, error: adminError } = await supabase
          .from('administrators')
          .select('gym_id')
          .eq('user_id', userId)
          .single()
        
        if (adminError) throw adminError
        if (!admin?.gym_id) throw new Error('El administrador no tiene gimnasio asignado')
        
        const currentGymId = admin.gym_id
        if (!active) return
        setGymId(currentGymId)

        const since = new Date()
        since.setMonth(since.getMonth() - 5, 1)
        since.setHours(0, 0, 0, 0)

        // Buscar suscripciones activas del gimnasio (miembros)
        const { data: subsData, error: subsError } = await supabase
          .from('user_subscriptions')
          .select('id, created_at, subscription_plans(gym_id)')
          .eq('status', 'active')

        console.log('Subs data:', subsData)
        console.log('Subs error:', subsError)

        if (subsError) throw subsError

        // Filtrar solo las suscripciones del gimnasio actual
        const gymSubs = (subsData ?? []).filter((sub) => {
          const planData = sub.subscription_plans as unknown as Record<string, unknown> | null
          console.log('Checking sub:', sub.id, 'plan gym_id:', planData?.gym_id, 'current gym:', currentGymId)
          return planData?.gym_id === currentGymId
        })

        // Buscar planes activos del gimnasio (sin filtro de fecha)
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('gym_id', currentGymId)
          .eq('is_active', true)

        console.log('Plans query params:', { gym_id: currentGymId, is_active: true })
        console.log('Plans data:', plansData)
        console.log('Plans error:', plansError)

        if (plansError) throw plansError

        // Buscar órdenes del gimnasio (ventas tienda) de los últimos 6 meses
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        sixMonthsAgo.setHours(0, 0, 0, 0)

        // Primero traer TODAS las órdenes para ver qué valores tienen
        const { data: allOrders, error: allOrdersError } = await supabase
          .from('orders')
          .select('id, total_amount, created_at, gym_id, status')

        console.log('ALL Orders:', allOrders)
        console.log('Current gym_id:', currentGymId)
        console.log('Date filter (6 months ago):', sixMonthsAgo.toISOString())

        if (allOrdersError) throw allOrdersError

        // Filtrar manualmente las órdenes del gimnasio actual con status paid
        const filteredOrders = (allOrders ?? []).filter(order => {
          const isGymMatch = order.gym_id === currentGymId
          const isStatusMatch = order.status === 'paid'
          const isDateMatch = new Date(order.created_at) >= sixMonthsAgo
          console.log(`Order ${order.id}:`, { gym_id: order.gym_id, status: order.status, created_at: order.created_at, isGymMatch, isStatusMatch, isDateMatch })
          return isGymMatch && isStatusMatch && isDateMatch
        })

        console.log('Filtered Orders:', filteredOrders)

        const activeMembersRes = gymSubs.filter((sub) => sub.created_at !== null)
        const activePlansRes = (plansData ?? []).map((_plan) => ({ created_at: null }))
        const totalSales = (filteredOrders ?? []).reduce((sum, order) => sum + (order.total_amount ?? 0), 0)
        const salesRes = rollupByMonthSum(filteredOrders ?? [])

        if (!active) return
        
        setMemberCount(gymSubs.length)
        setActiveSubs(plansData?.length ?? 0)
        setSalesAmount(totalSales)
        setUserSeries(rollupByMonth(activeMembersRes))
        setSubSeries(rollupByMonth(activePlansRes))
        setSalesSeries(salesRes)

        if (!active) return
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const handleExportSummaryCSV = () => {
    console.log('Exporting gym summary')
    const now = new Date()
    const summaryData: CSVRow[] = [
      {
        Métrica: 'Miembros Activos',
        Valor: memberCount,
        Timestamp: now.toLocaleString('es-ES')
      },
      {
        Métrica: 'Planes Activos',
        Valor: activeSubs,
        Timestamp: now.toLocaleString('es-ES')
      },
      {
        Métrica: 'Ventas (Últimos 6 meses)',
        Valor: `$${salesAmount.toFixed(2)}`,
        Timestamp: now.toLocaleString('es-ES')
      }
    ]

    const filename = `resumen-gym-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`
    exportToCSV(summaryData, filename)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Panel del gimnasio</p>
          <h1 className="text-2xl font-bold">Resumen operativo</h1>
          {gymId && <p className="text-xs text-text-secondary mt-1">Gym: {gymId}</p>}
        </div>
        <span className="pill bg-primary/15 text-primary border-primary/30">Admin</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Miembros activos" subtitle="Usuarios con acceso" action={<Users size={16} className="text-text-secondary" />}>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{loading ? '…' : memberCount}</p>
            {!loading && memberCount === 0 && <span className="text-sm text-text-secondary">Sin datos</span>}
          </div>
        </Card>
        <Card title="Suscripciones activas" subtitle="Planes vigentes" action={<Activity size={16} className="text-text-secondary" />}>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{loading ? '…' : activeSubs}</p>
            {!loading && activeSubs === 0 && <span className="text-sm text-text-secondary">Sin datos</span>}
          </div>
        </Card>
        <Card title="Ventas tienda" subtitle="Últimos 6 meses" action={<CreditCard size={16} className="text-text-secondary" />}>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{loading ? '…' : `$${salesAmount.toFixed(2)}`}</p>
            {!loading && salesAmount === 0 && <span className="text-sm text-text-secondary">Sin datos</span>}
          </div>
        </Card>
        <Card title="Series" subtitle="Usuarios / Subs / Ventas" action={<Activity size={16} className="text-text-secondary" />}>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 className="animate-spin" size={16} /> Cargando</div>
          ) : (
            <div className="space-y-2">
              <Sparkline data={userSeries.data} color="rgb(99,102,241)" />
              <Sparkline data={subSeries.data} color="rgb(16,185,129)" />
              <Sparkline data={salesSeries.data} color="rgb(239,68,68)" />
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Tareas rápidas" subtitle="Acciones diarias">
          <div className="flex flex-wrap gap-3 text-sm">
            <button className="pill bg-primary/15 text-primary border-primary/30">Agregar miembro</button>
            <button className="pill bg-secondary/15 text-secondary border-secondary/30">Crear clase</button>
            <button className="pill bg-success/15 text-success border-success/30">Registrar pago</button>
            <button 
              onClick={handleExportSummaryCSV}
              disabled={loading}
              className="pill bg-text-secondary/10 text-text border-border hover:bg-text-secondary/20 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} /> Exportar CSV
            </button>
          </div>
        </Card>
        <Card title="Alertas" subtitle="Lo que necesita atención">
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• Revisa membresías próximas a vencer</li>
            <li>• Monitorea pagos en revisión</li>
            <li>• Checa stock bajo en tienda</li>
          </ul>
        </Card>
        <Card title="Renovaciones" subtitle="Semana en curso">
          <p className="text-sm text-text-secondary">Consulta detalle en Suscripciones</p>
        </Card>
      </div>

      {error && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
      )}
    </div>
  )
}

export default GymAdminOverview
