import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

type GymRow = {
  id?: string
  name?: string
  address?: string
  status?: string
  capacity?: number
  rooms?: string
  staff_count?: number
  services?: string[] | null
  schedule?: string | null
  city?: string
  state?: string
}

const GymAdminGymPanel = () => {
  const [gymId, setGymId] = useState<string | null>(null)
  const [gym, setGym] = useState<GymRow | null>(null)
  const [servicesInput, setServicesInput] = useState('')
  const [scheduleInput, setScheduleInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      setSaved('')
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

        const { data, error: gymError } = await supabase
          .from('gyms')
          .select('*')
          .eq('id', currentGymId)
          .single()
        if (!active) return
        if (gymError) throw gymError
        setGym(data as GymRow)
        setServicesInput(Array.isArray(data?.services) ? data.services.join(', ') : '')
        setScheduleInput((data?.schedule as string) ?? '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el gimnasio')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const handleSave = async () => {
    if (!gymId) return
    setSaving(true)
    setSaved('')
    setError('')
    const services = servicesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const updates: Partial<GymRow> = {
      services,
      schedule: scheduleInput,
    }
    const { error: updateError } = await supabase.from('gyms').update(updates).eq('id', gymId)
    if (updateError) {
      setError(updateError.message)
    } else {
      setSaved('Guardado')
      setGym((prev) => (prev ? { ...prev, ...updates } : prev))
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Mi gimnasio</p>
        <h1 className="text-2xl font-bold">Operación y sedes</h1>
        {gymId && <p className="text-xs text-text-secondary mt-1">Gym: {gymId}</p>}
      </div>

      <Card title="Datos principales" subtitle="Información visible para tus usuarios">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 size={16} className="animate-spin" /> Cargando</div>
        ) : error ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
        ) : !gym ? (
          <p className="text-sm text-text-secondary">No se encontró el gimnasio.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-text">{gym.name ?? 'Sin nombre'}</p>
              <p className="text-text-secondary">{gym.address ?? 'Sin dirección'}</p>
              <p className={`pill inline-flex ${gym.status === 'Abierto' ? 'bg-success/15 text-success border-success/30' : 'bg-text-secondary/10 text-text border-border'}`}>
                {gym.status ?? 'Sin estado'}
              </p>
            </div>
            <div className="space-y-2 text-text-secondary">
              <p>Capacidad: {gym.capacity ?? 'N/D'}</p>
              <p>Salas: {gym.rooms ?? 'N/D'}</p>
              <p>Staff activo: {gym.staff_count ?? 'N/D'}</p>
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Horario" subtitle="Personaliza apertura y días especiales">
          <textarea
            value={scheduleInput}
            onChange={(e) => setScheduleInput(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm min-h-[120px]"
            placeholder="Ej: L-V 6:00-22:00; Sab 7:00-18:00; Dom 8:00-14:00"
          />
        </Card>
        <Card title="Servicios" subtitle="Separados por coma">
          <textarea
            value={servicesInput}
            onChange={(e) => setServicesInput(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm min-h-[120px]"
            placeholder="Locker, Clases grupales, Wi-Fi, Parqueadero"
          />
          <div className="flex flex-wrap gap-2 text-sm text-text-secondary mt-2">
            {servicesInput
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => (
                <span key={s} className="pill bg-primary/10 text-primary border-primary/30">
                  {s}
                </span>
              ))}
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-60"
        >
          <Save size={16} /> {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {saved && <span className="text-sm text-success">{saved}</span>}
        {error && !loading && <span className="text-sm text-warning">{error}</span>}
      </div>
    </div>
  )
}

export default GymAdminGymPanel
