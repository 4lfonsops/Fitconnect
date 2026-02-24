import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

type PlanRow = {
  id: string
  name: string
  is_active: boolean
}

const GymAdminSubscriptions = () => {
  const [gymId, setGymId] = useState<string | null>(null)
  const [plans, setPlans] = useState<PlanRow[]>([])
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

        // Buscar planes activos del gimnasio
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('id, name, is_active')
          .eq('gym_id', currentGymId)
          .eq('is_active', true)

        if (!active) return
        if (plansError) {
          setError(plansError.message)
          setPlans([])
        } else {
          setPlans(plansData ?? [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los planes')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={16} className="animate-spin" /> Cargando planes</div>
    }
    
    if (error) {
      return <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
    }
    
    if (plans.length === 0) {
      return <p className="text-sm text-text-secondary">Sin planes activos registrados.</p>
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-text-secondary">
            <tr>
              <th className="py-2">Nombre del Plan</th>
              <th className="py-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="py-3 font-semibold text-text">{plan.name}</td>
                <td className="py-3">
                  <span className={`pill text-xs ${plan.is_active ? 'bg-success/15 text-success border-success/30' : 'bg-text-secondary/10 text-text border-border'}`}>
                    {plan.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
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
        <h1 className="text-2xl font-bold">Planes activos del gimnasio</h1>
        {gymId && <p className="text-xs text-text-secondary mt-1">Gym: {gymId}</p>}
      </div>
      <Card subtitle="Planes disponibles para tus miembros">
        {renderContent()}
      </Card>
    </div>
  )
}

export default GymAdminSubscriptions
