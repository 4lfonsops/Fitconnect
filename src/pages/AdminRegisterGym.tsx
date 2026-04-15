import type { FormEvent } from 'react'
import { useState, useRef } from 'react'
import { Building2, Loader2, Upload } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import { isValidEmail, isValidPhone10Digits, normalizePhoneDigits } from '../lib/validators'

const AdminRegisterGym = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    owner_name: '',
    owner_email: '',
    owner_password: '',
    is_active: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.currentTarget

    if (name === 'phone') {
      setFormData({
        ...formData,
        phone: normalizePhoneDigits(value),
      })
      return
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.currentTarget as HTMLInputElement).checked : value,
    })
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

    // Obtener URL pública
    const { data } = supabase.storage
      .from('gym-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback('')
    setCreating(true)

    // Validar campos requeridos
    const trimmedName = formData.name.trim()
    const trimmedAddress = formData.address.trim()
    const trimmedPhone = normalizePhoneDigits(formData.phone)
    const trimmedDescription = formData.description.trim()
    const trimmedOwnerName = formData.owner_name.trim()
    const trimmedOwnerEmail = formData.owner_email.trim().toLowerCase()
    const trimmedOwnerPassword = formData.owner_password

    if (!trimmedName || !trimmedAddress || !trimmedPhone) {
      setFeedback('Por favor completa todos los campos requeridos')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    if (!trimmedOwnerName || !trimmedOwnerEmail || !trimmedOwnerPassword) {
      setFeedback('Por favor completa los datos del dueño del gimnasio')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    if (!isValidPhone10Digits(trimmedPhone)) {
      setFeedback('El teléfono debe tener exactamente 10 dígitos')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    if (!isValidEmail(trimmedOwnerEmail)) {
      setFeedback('El correo del dueño no es válido')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    if (trimmedOwnerPassword.length < 8) {
      setFeedback('La contraseña del dueño debe tener al menos 8 caracteres')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    if (trimmedName.length < 3 || trimmedName.length > 80) {
      setFeedback('El nombre debe tener entre 3 y 80 caracteres')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    if (trimmedAddress.length < 8 || trimmedAddress.length > 180) {
      setFeedback('La dirección debe tener entre 8 y 180 caracteres')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    if (trimmedDescription.length > 400) {
      setFeedback('La descripción no puede exceder 400 caracteres')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    if (!imageFile) {
      setFeedback('Por favor sube una imagen para el gimnasio')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    try {
      // Subir imagen a storage
      const imageUrl = await uploadImageToStorage(imageFile)

      // Crear gimnasio con la URL de la imagen
      const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .insert({
          name: trimmedName,
          address: trimmedAddress,
          phone: trimmedPhone,
          description: trimmedDescription || null,
          image: imageUrl,
          is_active: formData.is_active,
        })
        .select('id')
        .single()

      if (gymError) {
        throw new Error(`Error al crear gimnasio: ${gymError.message}`)
      }

      const createdGymId = gymData.id

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedOwnerEmail,
        password: trimmedOwnerPassword,
        options: {
          data: {
            full_name: trimmedOwnerName,
            role: 'gym_admin',
            gym_name: trimmedName,
          },
        },
      })

      if (authError) {
        await supabase.from('gyms').delete().eq('id', createdGymId)

        const authMessage = authError.message?.toLowerCase() || ''
        if (authMessage.includes('rate limit')) {
          throw new Error('Supabase bloqueó temporalmente el alta por límite de correos (rate limit). No se creó ni el usuario ni el administrador. Espera unos minutos e intenta de nuevo.')
        }

        throw new Error(`Error al crear usuario del dueño: ${authError.message}`)
      }

      const ownerUserId = authData.user?.id
      if (!ownerUserId) {
        await supabase.from('gyms').delete().eq('id', createdGymId)
        throw new Error('No se pudo obtener el ID del usuario creado')
      }

      const { error: adminError } = await supabase.from('administrators').insert({
        user_id: ownerUserId,
        full_name: trimmedOwnerName,
        email: trimmedOwnerEmail,
        gym_id: createdGymId,
        role: 'gym_admin',
      })

      if (adminError) {
        await supabase.from('gyms').delete().eq('id', createdGymId)
        throw new Error(`Error al crear administrador: ${adminError.message}`)
      }

      setFeedback('✓ Gimnasio y dueño registrados exitosamente')
      setFeedbackType('success')
      setFormData({
        name: '',
        address: '',
        phone: '',
        description: '',
        owner_name: '',
        owner_email: '',
        owner_password: '',
        is_active: true,
      })
      setImageFile(null)
      setImagePreview('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Error desconocido')
      setFeedbackType('error')
    } finally {
      setCreating(false)
    }
  }

  const getFeedbackClass = () => {
    if (feedbackType === 'success') return 'text-success'
    if (feedbackType === 'error') return 'text-error'
    return 'text-text-secondary'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Registro de gimnasios</p>
          <h1 className="text-2xl font-bold">Registrar nuevo gimnasio</h1>
          <p className="text-sm text-text-secondary mt-1">Completa los datos del gimnasio para agregarlo a la plataforma.</p>
        </div>
        <span className="pill bg-primary/15 text-primary border-primary/30 inline-flex items-center gap-2">
          <Building2 size={16} /> Nuevo gimnasio
        </span>
      </div>

      <Card title="Información del gimnasio" subtitle="Todos los campos marcados con * son obligatorios">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-1 text-sm font-semibold text-text md:col-span-2" htmlFor="name">
            Nombre del gimnasio *
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              minLength={3}
              maxLength={80}
              placeholder="ej: Powerhouse Downtown"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-text" htmlFor="address">
            Dirección *
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              minLength={8}
              maxLength={180}
              placeholder="ej: Calle Principal 123"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-text" htmlFor="phone">
            Teléfono *
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              minLength={10}
              maxLength={10}
              title="Ingresa 10 dígitos numéricos"
              placeholder="ej: 5512345678"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-text" htmlFor="owner_name">
            Nombre del dueño *
            <input
              id="owner_name"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleInputChange}
              required
              minLength={3}
              maxLength={80}
              placeholder="ej: Juan Pérez"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-text" htmlFor="owner_email">
            Correo del dueño *
            <input
              id="owner_email"
              name="owner_email"
              type="email"
              value={formData.owner_email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              placeholder="ej: dueno@gimnasio.com"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-text md:col-span-2" htmlFor="owner_password">
            Contraseña del dueño *
            <input
              id="owner_password"
              name="owner_password"
              type="password"
              value={formData.owner_password}
              onChange={handleInputChange}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-text md:col-span-2" htmlFor="description">
            Descripción
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="ej: Gimnasio de alta calidad con equipos modernos, clases personalizadas, piscina..."
              rows={3}
              maxLength={400}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-text md:col-span-2" htmlFor="image">
            Imagen del gimnasio *
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          {imagePreview && (
            <div className="md:col-span-2 rounded-xl overflow-hidden border border-border bg-surface/40">
              <img src={imagePreview} alt="Vista previa" className="w-full h-52 object-contain" />
            </div>
          )}

          <label className="space-y-1 text-sm font-semibold text-text flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-border"
            />
            Gimnasio activo
          </label>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-60 inline-flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registrando…
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Registrar gimnasio
                </>
              )}
            </button>
            {feedback && (
              <p className={`text-sm ${getFeedbackClass()}`}>
                {feedback}
              </p>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}

export default AdminRegisterGym
