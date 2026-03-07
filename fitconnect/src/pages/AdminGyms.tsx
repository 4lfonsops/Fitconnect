import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Mail, MapPin, Loader2, Building2 } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

type GymRow = {
  id?: string
  name?: string
  status?: string
  locations?: number
  location_count?: number
  renewals?: string
  admin_email?: string
  admin_name?: string
  plan_name?: string
  price?: number | string
  created_at?: string
  city?: string
  state?: string
  description?: string
  address?: string
  phone?: string
  image?: string
  opening_time?: string
  closing_time?: string
  is_active?: boolean
  plans?: Array<{
    id: string
    name: string
    price: number
    duration_days: number
    description: string
    is_active: boolean
  }>
}

const AdminGyms = () => {
  const [gyms, setGyms] = useState<GymRow[]>([])
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      const { data, error: err } = await supabase.from('gyms').select('*').order('created_at', { ascending: false })
      if (!active) return
      
      if (err) {
        setError(err.message)
        setGyms([])
      } else {
        // Cargar planes para cada gym
        const gymsWithPlans = await Promise.all(
          (data ?? []).map(async (gym: GymRow) => {
            const { data: plansData, error: plansError } = await supabase
              .from('subscription_plans')
              .select('*')
              .eq('gym_id', gym.id)

            if (plansError) {
              console.error(`Error loading plans for gym ${gym.id}:`, plansError)
            }

            console.log(`Plans for gym ${gym.id}:`, plansData)

            return {
              ...gym,
              plans: plansData ?? []
            }
          })
        )
        setGyms(gymsWithPlans)
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const toggle = (id: string) => {
    setOpen((prev) => {
      const currentState = prev[id]
      const newState = !currentState
      
      // Encontrar el índice del gym clickeado
      const clickedIndex = gyms.findIndex(gym => gym.id === id)
      
      // Calcular cuál es su pareja en la misma línea (grid de 2 columnas)
      const isLeftColumn = clickedIndex % 2 === 0
      const pairIndex = isLeftColumn ? clickedIndex + 1 : clickedIndex - 1
      
      const updatedOpen: Record<string, boolean> = {}
      
      // Abrir/cerrar solo el clickeado y su pareja en la misma línea
      if (gyms[clickedIndex]?.id) {
        updatedOpen[gyms[clickedIndex].id] = newState
      }
      if (gyms[pairIndex]?.id) {
        updatedOpen[gyms[pairIndex].id] = newState
      }
      
      return { ...prev, ...updatedOpen }
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Gimnasios</p>
        <h1 className="text-2xl font-bold">Contratos y sedes</h1>
      </div>

      <Card subtitle="Admin del gym, plan contratado y sedes">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="animate-spin" size={16} /> Cargando gimnasios
          </div>
        ) : error ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
        ) : gyms.length === 0 ? (
          <p className="text-sm text-text-secondary">Sin gimnasios registrados.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {gyms.map((gym) => {
              const id = gym.id ?? gym.name ?? Math.random().toString()
              const expanded = open[id]
              const locations = gym.location_count ?? gym.locations ?? 0
              const priceValue = gym.price !== undefined ? gym.price : undefined
              const price = typeof priceValue === 'number' ? `$${priceValue.toFixed(2)}` : priceValue

              return (
                <div key={id} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-text">{gym.name ?? 'Sin nombre'}</p>
                      <p className="text-xs text-text-secondary inline-flex items-center gap-1">
                        <Building2 size={14} /> Sedes: {locations}
                      </p>
                      {gym.city && (
                        <p className="text-xs text-text-secondary inline-flex items-center gap-1">
                          <MapPin size={14} /> {gym.city} {gym.state ? `• ${gym.state}` : ''}
                        </p>
                      )}
                      <div className="inline-flex gap-2 items-center text-xs text-text-secondary">
                        <Mail size={14} />
                        <span>{gym.admin_email ?? 'Sin email'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`pill text-xs ${gym.status === 'Activo' ? 'bg-success/15 text-success border-success/30' : gym.status === 'Revisión' ? 'bg-warning/15 text-warning border-warning/30' : 'bg-text-secondary/10 text-text border-border'}`}
                      >
                        {gym.status ?? 'Sin estado'}
                      </span>
                      <button
                        onClick={() => toggle(id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                      >
                        {expanded ? 'Ocultar' : 'Ver detalle'} {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="rounded-xl border border-border bg-surface p-3 text-sm space-y-2">
                      <p className="text-xs font-semibold text-text-secondary mb-2">Información del Gimnasio</p>
                      
                      {gym.image && (
                        <div className="rounded-lg overflow-hidden mb-2">
                          <img src={gym.image} alt={gym.name} className="w-full h-32 object-cover" />
                        </div>
                      )}
                      
                      {gym.description && (
                        <div>
                          <span className="text-text-secondary">Descripción</span>
                          <p className="font-semibold text-text text-xs">{gym.description}</p>
                        </div>
                      )}
                      
                      {gym.address && (
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary">Dirección</span>
                          <span className="font-semibold text-text text-xs">{gym.address}</span>
                        </div>
                      )}
                      
                      {gym.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary">Teléfono</span>
                          <span className="font-semibold text-text">{gym.phone}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-border pt-2 mt-2">
                        <p className="text-xs font-semibold text-text-secondary mb-2">Planes de Suscripción</p>
                        
                        {gym.plans && gym.plans.length > 0 ? (
                          <div className="space-y-2">
                            {gym.plans.map((plan) => (
                              <div key={plan.id} className="rounded-lg bg-background p-2 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-text">{plan.name}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${plan.is_active ? 'bg-success/15 text-success' : 'bg-text-secondary/10 text-text'}`}>
                                    {plan.is_active ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-text-secondary">Precio:</span>
                                  <span className="font-semibold text-text">${plan.price.toFixed(2)} / {plan.duration_days} días</span>
                                </div>
                                {plan.description && (
                                  <p className="text-xs text-text-secondary">{plan.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-text-secondary">Sin planes registrados</p>
                        )}
                      </div>
                      
                      {(gym.opening_time || gym.closing_time || gym.is_active !== undefined) && (
                        <div className="border-t border-border pt-2 mt-2">
                          <p className="text-xs font-semibold text-text-secondary mb-2">Horarios y Estado</p>
                          
                          {gym.opening_time && (
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">Apertura</span>
                              <span className="font-semibold text-text">{gym.opening_time}</span>
                            </div>
                          )}
                          
                          {gym.closing_time && (
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">Cierre</span>
                              <span className="font-semibold text-text">{gym.closing_time}</span>
                            </div>
                          )}
                          
                          {gym.is_active !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">Activo</span>
                              <span className={`font-semibold text-xs ${gym.is_active ? 'text-success' : 'text-warning'}`}>
                                {gym.is_active ? 'Sí' : 'No'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

export default AdminGyms
