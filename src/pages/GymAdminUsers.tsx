import { useEffect, useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import { exportToCSV, formatDateForCSV, type CSVRow } from '../utils/csvExport'

type UserSubscription = {
  id: string
  user_id: string
  created_at: string
  subscription_plans: {
    id: string
    name: string
    gym_id: string
  }
}

type UserData = {
  id: string
  email: string
  full_name: string
  plan_name: string
  created_at: string
}

const GymAdminUsers = () => {
  const [gymId, setGymId] = useState<string | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
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

        // Buscar suscripciones activas del gimnasio
        const { data: subsData, error: subsError } = await supabase
          .from('user_subscriptions')
          .select('id, user_id, created_at, subscription_plans(id, name, gym_id)')
          .eq('status', 'active')

        if (subsError) throw subsError

        // Filtrar solo las suscripciones del gimnasio actual
        const gymSubs = (subsData ?? []).filter((sub) => {
          const planData = sub.subscription_plans as unknown as Record<string, unknown> | null
          return planData?.gym_id === currentGymId
        }) as unknown as UserSubscription[]

        // Obtener emails y nombres de los usuarios
        const userIds = gymSubs.map(sub => sub.user_id)
        
        let emails: Record<string, string> = {}
        let names: Record<string, string> = {}

        if (userIds.length > 0) {
          const { data: emailsData } = await supabase.rpc('get_user_emails', { user_ids: userIds })
          const { data: namesData } = await supabase.rpc('get_user_names', { user_ids: userIds })
          
          if (emailsData) {
            emails = Object.fromEntries(emailsData.map((e: { id: string; email: string }) => [e.id, e.email]))
          }
          if (namesData) {
            names = Object.fromEntries(namesData.map((n: { id: string; name: string }) => [n.id, n.name]))
          }
        }

        // Mapear datos
        const userData = gymSubs.map(sub => ({
          id: sub.user_id,
          email: emails[sub.user_id] ?? 'Desconocido',
          full_name: names[sub.user_id] ?? 'Sin nombre',
          plan_name: String((sub.subscription_plans as unknown as Record<string, unknown>)?.name ?? 'N/D'),
          created_at: sub.created_at
        }))

        if (!active) return
        setUsers(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const handleExportCSV = () => {
    console.log('Exporting users...', users.length)
    const csvData: CSVRow[] = users.map((user) => ({
      ID: user.id || '',
      Nombre: user.full_name || '',
      Email: user.email || '',
      Plan: user.plan_name || '',
      'Activo desde': user.created_at ? formatDateForCSV(user.created_at) : ''
    }))

    const now = new Date()
    const filename = `miembros-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`
    exportToCSV(csvData, filename)
  }

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={16} className="animate-spin" /> Cargando usuarios</div>
    }
    
    if (error) {
      return <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
    }
    
    if (users.length === 0) {
      return <p className="text-sm text-text-secondary">Sin miembros activos en este gimnasio.</p>
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-text-secondary">
            <tr>
              <th className="py-2">Nombre</th>
              <th className="py-2">Email</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-3 font-semibold text-text">{user.full_name}</td>
                <td className="py-3 text-text-secondary">{user.email}</td>
                <td className="py-3">{user.plan_name}</td>
                <td className="py-3 text-text-secondary">{new Date(user.created_at).toLocaleDateString()}</td>
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
        <p className="text-sm text-text-secondary">Usuarios</p>
        <h1 className="text-2xl font-bold">Miembros activos</h1>
        {gymId && <p className="text-xs text-text-secondary mt-1">Gym: {gymId}</p>}
      </div>

      <Card subtitle="Miembros con acceso activo" action={
        <button
          onClick={handleExportCSV}
          disabled={loading || users.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-primary/15 text-primary border border-primary/30 px-3 py-2 text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} /> Exportar
        </button>
      }>
        {renderContent()}
      </Card>
    </div>
  )
}

export default GymAdminUsers
