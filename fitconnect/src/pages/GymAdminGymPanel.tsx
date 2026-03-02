import { useEffect, useState, useRef } from 'react'
import { Loader2, Save } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

type GymRow = {
  id?: string
  name?: string
  description?: string
  address?: string
  phone?: string
  image?: string
  opening_time?: string
  closing_time?: string
  is_active?: boolean
}

const GymAdminGymPanel = () => {
  const [gymId, setGymId] = useState<string | null>(null)
  const [form, setForm] = useState<GymRow>({
    name: '',
    description: '',
    address: '',
    phone: '',
    image: '',
    opening_time: '',
    closing_time: '',
    is_active: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const loadGym = async (currentGymId: string) => {
    const { data, error: gymError } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', currentGymId)
      .single()
    
    if (gymError) throw gymError
    
    setForm({
      id: data.id,
      name: data.name || '',
      description: data.description || '',
      address: data.address || '',
      phone: data.phone || '',
      image: data.image || '',
      opening_time: data.opening_time || '',
      closing_time: data.closing_time || '',
      is_active: data.is_active ?? true
    })
    
    if (data.image) {
      setImagePreview(data.image)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImageToStorage = async (file: File): Promise<string> => {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`
    
    const { error: uploadError } = await supabase.storage
      .from('gym-images')
      .upload(fileName, file)

    if (uploadError) {
      throw new Error(`Error al subir imagen: ${uploadError.message}`)
    }

    const { data } = supabase.storage
      .from('gym-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const handleSave = async () => {
    if (!gymId) return
    setSaving(true)
    setError('')
    setMessage('')
    
    try {
      let imageUrl = form.image
      
      // Si hay una imagen nueva, subirla
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile)
      }
      
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || null,
        address: form.address?.trim(),
        phone: form.phone?.trim(),
        image: imageUrl,
        opening_time: form.opening_time || null,
        closing_time: form.closing_time || null,
        is_active: form.is_active
      }
      
      if (!payload.name || !payload.address || !payload.phone) {
        throw new Error('Nombre, dirección y teléfono son obligatorios')
      }
      
      const { error: updateError } = await supabase
        .from('gyms')
        .update(payload)
        .eq('id', gymId)
      
      if (updateError) throw updateError
      
      setMessage('✓ Gimnasio actualizado correctamente')
      setImageFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
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
        await loadGym(currentGymId)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'No se pudo cargar el gimnasio')
      } finally {
        if (active) setLoading(false)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Mi gimnasio</p>
        <h1 className="text-2xl font-bold">Editar información</h1>
        {gymId && <p className="text-xs text-text-secondary mt-1">Gym: {gymId}</p>}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 size={16} className="animate-spin" />
          Cargando gimnasio
        </div>
      ) : error && loading ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
      ) : (
        <>
          <Card subtitle="Información principal del gimnasio">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Nombre *</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                  value={form.name || ''}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre del gimnasio"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary">Teléfono *</label>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                  value={form.phone || ''}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Teléfono de contacto"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-text-secondary">Dirección *</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                  value={form.address || ''}
                  onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Dirección completa"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-text-secondary">Descripción</label>
                <textarea
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                  value={form.description || ''}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción del gimnasio"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card subtitle="Horario de atención">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary">Hora de Apertura</label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                    value={form.opening_time || ''}
                    onChange={(e) => setForm(f => ({ ...f, opening_time: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary">Hora de Cierre</label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                    value={form.closing_time || ''}
                    onChange={(e) => setForm(f => ({ ...f, closing_time: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            <Card subtitle="Imagen del gimnasio">
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                )}
              </div>
            </Card>
          </div>

          <Card>
            <label className="inline-flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active ?? true}
                onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                className="rounded"
              />
              Gimnasio activo
            </label>
          </Card>

          <div className="flex gap-3 items-center">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-background disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {message && <p className="text-sm text-success">{message}</p>}
            {error && <p className="text-sm text-warning">{error}</p>}
          </div>
        </>
      )}
    </div>
  )
}

export default GymAdminGymPanel
