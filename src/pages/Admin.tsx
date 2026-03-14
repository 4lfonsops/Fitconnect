import { BarChart3, Loader2, Ticket, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

type MonthlySeries = {
  labels: string[]
  data: number[]
}

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const getLastMonths = (count: number) => {
  const now = new Date()
  const months: { label: string; key: string }[] = []

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    months.push({ label: `${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`, key })
  }

  return months
}

const rollupByMonth = (rows: { created_at: string | null }[]): MonthlySeries => {
  const months = getLastMonths(6)
  const counter = months.reduce<Record<string, number>>((acc, month) => {
    acc[month.key] = 0
    return acc
  }, {})

  rows.forEach((row) => {
    if (!row.created_at) return
    const date = new Date(row.created_at)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    if (counter[key] !== undefined) {
      counter[key] += 1
    }
  })

  return {
    labels: months.map((month) => month.label),
    data: months.map((month) => counter[month.key] ?? 0),
  }
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
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points.join(' ')}
      />
    </svg>
  )
}

const Admin = () => {
  const [userCount, setUserCount] = useState(0)
  const [gymCount, setGymCount] = useState(0)
  const [subscriptionCount, setSubscriptionCount] = useState(0)
  const [userSeries, setUserSeries] = useState<MonthlySeries>({ labels: [], data: [] })
  const [gymSeries, setGymSeries] = useState<MonthlySeries>({ labels: [], data: [] })
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const lastMonths = useMemo(() => getLastMonths(6), [])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setErrorMessage('')

      const since = new Date()
      since.setMonth(since.getMonth() - 5, 1)
      since.setHours(0, 0, 0, 0)

      try {
        const [usersCountRes, gymsCountRes, subsCountRes, usersSeriesRes, gymsSeriesRes] = await Promise.all([
          supabase.from('profiles').select('id'),
          supabase.from('gyms').select('id', { count: 'exact', head: true }),
          supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('profiles').select('created_at').gte('created_at', since.toISOString()),
          supabase.from('gyms').select('created_at').gte('created_at', since.toISOString()),
        ])

        if (!active) return

        console.log('Usuarios data:', usersCountRes.data)
        console.log('Usuarios count:', usersCountRes.data?.length)
        console.log('Usuarios error:', usersCountRes.error)
        
        setUserCount(usersCountRes.data?.length ?? 0)
        setGymCount(gymsCountRes.count ?? 0)
        setSubscriptionCount(subsCountRes.count ?? 0)

        setUserSeries(rollupByMonth(usersSeriesRes.data ?? []))
        setGymSeries(rollupByMonth(gymsSeriesRes.data ?? []))

        const errors = [usersCountRes.error, gymsCountRes.error, subsCountRes.error, usersSeriesRes.error, gymsSeriesRes.error]
        const firstError = errors.find(Boolean)
        if (firstError) {
          setErrorMessage(firstError.message)
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar los datos')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Panel superadmin</p>
          <h1 className="text-2xl font-bold">Overview global</h1>
          <p className="text-sm text-text-secondary mt-1">Usuarios, gimnasios y suscripciones en tiempo real.</p>
        </div>
        <span className="pill bg-error/15 text-error border-error/30">Acceso restringido</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Usuarios" subtitle="Cuentas creadas" action={<Users size={16} className="text-text-secondary" />}>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{loading ? '…' : userCount}</p>
            {!loading && userCount === 0 && <span className="text-sm text-text-secondary">Sin datos</span>}
          </div>
        </Card>
        <Card title="Gimnasios" subtitle="Contratados" action={<BarChart3 size={16} className="text-text-secondary" />}>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{loading ? '…' : gymCount}</p>
            {!loading && gymCount === 0 && <span className="text-sm text-text-secondary">Sin datos</span>}
          </div>
        </Card>
        <Card title="Suscripciones" subtitle="Planes activos" action={<Ticket size={16} className="text-text-secondary" />}>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{loading ? '…' : subscriptionCount}</p>
            {!loading && subscriptionCount === 0 && <span className="text-sm text-text-secondary">Sin datos</span>}
          </div>
        </Card>
      </div>

      <Card title="Gestión rápida" subtitle="Acceso directo">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to="/superadmin/register-gym"
            className="pill bg-primary/15 text-primary border-primary/30 inline-flex items-center gap-2"
          >
            Registrar gimnasio
          </Link>
        </div>
      </Card>

      <Card title="Crecimiento" subtitle="Últimos 6 meses">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Nuevos usuarios</p>
                <p className="text-lg font-semibold">{loading ? 'Cargando…' : `${userSeries.data.reduce((acc, v) => acc + v, 0)} en ventana`}</p>
              </div>
              <span className="pill bg-success/10 text-success border-success/20">Usuarios</span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Loader2 size={16} className="animate-spin" /> Cargando
              </div>
            ) : (
              <Sparkline data={userSeries.data} color="rgb(99, 102, 241)" />
            )}
            <div className="grid grid-cols-3 gap-2 text-xs text-text-secondary">
              {lastMonths.map((month, index) => (
                <div key={month.key} className="flex items-center justify-between">
                  <span>{month.label}</span>
                  <span className="font-semibold text-text">{userSeries.data[index] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Nuevos gimnasios</p>
                <p className="text-lg font-semibold">{loading ? 'Cargando…' : `${gymSeries.data.reduce((acc, v) => acc + v, 0)} en ventana`}</p>
              </div>
              <span className="pill bg-warning/10 text-warning border-warning/20">Gimnasios</span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Loader2 size={16} className="animate-spin" /> Cargando
              </div>
            ) : (
              <Sparkline data={gymSeries.data} color="rgb(251, 146, 60)" />
            )}
            <div className="grid grid-cols-3 gap-2 text-xs text-text-secondary">
              {lastMonths.map((month, index) => (
                <div key={month.key} className="flex items-center justify-between">
                  <span>{month.label}</span>
                  <span className="font-semibold text-text">{gymSeries.data[index] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {errorMessage && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          {errorMessage}
        </div>
      )}
    </div>
  )
}

export default Admin
