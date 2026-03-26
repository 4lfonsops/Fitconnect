import { useEffect, useState } from 'react'
import { Loader2, Save, Trash2, Edit2, Download } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import { exportToCSV, type CSVRow } from '../utils/csvExport'

type PlanRow = {
  id: string
  name: string
  price: number
  duration_days: number
  description: string
  is_active: boolean
}

type FormData = {
  name: string
  price: string
  duration_days: string
  description: string
  is_active: boolean
}

const GymAdminSubscriptions = () => {
  const [gymId, setGymId] = useState<string | null>(null)
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const [form, setForm] = useState<FormData>({
    name: '',
    price: '',
    duration_days: '',
    description: '',
    is_active: true
  })

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

  const loadPlans = async (currentGymId: string) => {
    const { data, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id, name, price, duration_days, description, is_active')
      .eq('gym_id', currentGymId)
      .order('name', { ascending: true })

    if (plansError) throw plansError
    setPlans(data ?? [])
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
        await loadPlans(currentGymId)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los planes')
      } finally {
        if (active) setLoading(false)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [])

  const resetForm = () => {
    setForm({
      name: '',
      price: '',
      duration_days: '',
      description: '',
      is_active: true
    })
    setEditingId(null)
  }

  const handleEdit = (plan: PlanRow) => {
    setForm({
      name: plan.name,
      price: plan.price.toString(),
      duration_days: plan.duration_days.toString(),
      description: plan.description,
      is_active: plan.is_active
    })
    setEditingId(plan.id)
  }

  const handleSave = async () => {
    if (!gymId) return
    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (!form.name.trim() || !form.price || !form.duration_days) {
        throw new Error('Nombre, precio y duración son obligatorios')
      }

      const trimmedName = form.name.trim()
      const trimmedDescription = form.description.trim()
      const priceValue = parseFloat(form.price)
      const durationValue = parseInt(form.duration_days)

      if (trimmedName.length < 3 || trimmedName.length > 80) {
        throw new Error('El nombre debe tener entre 3 y 80 caracteres')
      }

      if (!Number.isFinite(priceValue) || priceValue < 1) {
        throw new Error('El precio debe ser mayor a 1')
      }

      if (!Number.isInteger(durationValue) || durationValue <= 0 || durationValue > 3650) {
        throw new Error('La duración debe ser un número entero entre 1 y 3650 días')
      }

      if (trimmedDescription.length > 300) {
        throw new Error('La descripción no puede exceder 300 caracteres')
      }

      const payload = {
        name: trimmedName,
        price: priceValue,
        duration_days: durationValue,
        description: trimmedDescription,
        is_active: form.is_active
      }

      if (editingId) {
        // Actualizar
        const { error: updateError } = await supabase
          .from('subscription_plans')
          .update(payload)
          .eq('id', editingId)
          .eq('gym_id', gymId)
        
        if (updateError) throw updateError
        
        setPlans(plans.map(p => p.id === editingId ? { ...p, ...payload } : p))
        setMessage('✓ Plan actualizado correctamente')
      } else {
        // Crear nuevo
        const { data, error: insertError } = await supabase
          .from('subscription_plans')
          .insert([{ ...payload, gym_id: gymId }])
          .select()
        
        if (insertError) throw insertError
        
        if (data && data[0]) {
          setPlans([...plans, data[0]])
          setMessage('✓ Plan creado correctamente')
        }
      }
      
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (planId: string) => {
    setDeletingId(planId)
    setError('')
    setMessage('')

    try {
      const { error: deleteError } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId)
        .eq('gym_id', gymId)
      
      if (deleteError) throw deleteError
      
      setPlans(plans.filter(p => p.id !== planId))
      setMessage('✓ Plan eliminado correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    console.log('Exporting subscription plans...', plans.length)
    const csvData: CSVRow[] = plans.map((plan) => ({
      ID: plan.id || '',
      Nombre: plan.name || '',
      Precio: typeof plan.price === 'number' ? plan.price.toFixed(2) : plan.price,
      'Duración (días)': plan.duration_days || 0,
      Descripción: plan.description || '',
      Estado: plan.is_active ? 'Activo' : 'Inactivo'
    }))

    const now = new Date()
    const filename = `planes-suscripcion-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`
    exportToCSV(csvData, filename)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Suscripciones</p>
        <h1 className="text-2xl font-bold">Gestionar planes</h1>
        {gymId && <p className="text-xs text-text-secondary mt-1">Gym: {gymId}</p>}
      </div>

      <Card subtitle={editingId ? 'Editar plan de suscripción' : 'Crear nuevo plan de suscripción'}>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 size={16} className="animate-spin" />
            Cargando planes
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-text-secondary">Nombre del plan *</label>
              <input
                type="text"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Plan Básico, Plan Premium"
                minLength={3}
                maxLength={80}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary">Precio ($) * (Mínimo 1.00)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="1.00"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary">Duración (días) *</label>
              <input
                type="number"
                min="1"
                max="3650"
                step="1"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                value={form.duration_days}
                onChange={(e) => setForm(f => ({ ...f, duration_days: e.target.value }))}
                placeholder="30"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-text-secondary">Descripción</label>
              <textarea
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del plan (ej: Acceso a suplementos)"
                rows={2}
                maxLength={300}
              />
            </div>

            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="rounded"
                />
                Activar plan
              </label>
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear plan'}
              </button>
              
              {editingId && (
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-xl bg-text-secondary/10 px-4 py-2 text-sm font-semibold text-text hover:bg-text-secondary/20"
                >
                  Cancelar
                </button>
              )}

              {message && <p className="text-sm text-success self-center">{message}</p>}
              {error && <p className="text-sm text-warning self-center">{error}</p>}
            </div>
          </div>
        )}
      </Card>

      <Card subtitle="Lista de planes de suscripción" action={
        <button
          onClick={handleExportCSV}
          disabled={loading || plans.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-primary/15 text-primary border border-primary/30 px-3 py-2 text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} /> Exportar
        </button>
      }>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 size={16} className="animate-spin" />
            Cargando planes
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-text-secondary">Sin planes registrados. Crea uno nuevo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-text-secondary">
                <tr className="border-b border-border">
                  <th className="py-3 px-2">Nombre</th>
                  <th className="py-3 px-2">Precio</th>
                  <th className="py-3 px-2">Duración</th>
                  <th className="py-3 px-2">Descripción</th>
                  <th className="py-3 px-2">Estado</th>
                  <th className="py-3 px-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="py-3 px-2 font-semibold text-text">{plan.name}</td>
                    <td className="py-3 px-2 font-semibold">${plan.price.toFixed(2)}</td>
                    <td className="py-3 px-2 text-text-secondary">{plan.duration_days} días</td>
                    <td className="py-3 px-2 text-text-secondary text-xs max-w-xs truncate">{plan.description || '—'}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.is_active
                          ? 'bg-success/15 text-success border border-success/30'
                          : 'bg-text-secondary/10 text-text border border-border'
                      }`}>
                        {plan.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-1 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        disabled={deletingId === plan.id}
                        className="p-1 rounded-lg hover:bg-warning/20 text-warning transition-colors disabled:opacity-60"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
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

export default GymAdminSubscriptions
