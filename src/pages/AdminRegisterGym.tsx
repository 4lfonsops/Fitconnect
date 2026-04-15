import type { FormEvent } from 'react'
import { useState, useRef } from 'react'
import { Building2, Loader2, Upload } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import { isValidPhone10Digits, normalizePhoneDigits } from '../lib/validators'

const AdminRegisterGym = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    is_active: true,
  })
  const [adminData, setAdminData] = useState({
    full_name: '',
    email: '',
    password: '',
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

    // Campos de admin
    if (name === 'adminFullName') {
      setAdminData({
        ...adminData,
        full_name: value,
      })
      return
    }

    if (name === 'adminEmail') {
      setAdminData({
        ...adminData,
        email: value,
      })
      return
    }

    if (name === 'adminPassword') {
      setAdminData({
        ...adminData,
        password: value,
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
      // Validar que sea formato de imagen permitido
      const validMimeTypes = ['image/jpeg', 'image/png']
      const validExtensions = ['.jpg', '.jpeg', '.png']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (!validMimeTypes.includes(file.type) || !validExtensions.includes(fileExtension)) {
        setFeedback('Por favor sube solo archivos JPG o PNG')
        setFeedbackType('error')
        return
      }
      
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

    // Validar campos requeridos del gym
    const trimmedName = formData.name.trim()
    const trimmedAddress = formData.address.trim()
    const trimmedPhone = normalizePhoneDigits(formData.phone)
    const trimmedDescription = formData.description.trim()

    // Validar campos requeridos del admin
    const trimmedAdminFullName = adminData.full_name.trim()
    const trimmedAdminEmail = adminData.email.trim()
    const trimmedAdminPassword = adminData.password.trim()

    if (!trimmedName || !trimmedAddress || !trimmedPhone) {
      setFeedback('Por favor completa todos los campos requeridos del gimnasio')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    if (!trimmedAdminFullName || !trimmedAdminEmail || !trimmedAdminPassword) {
      setFeedback('Por favor completa todos los campos del administrador del gimnasio')
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

    if (trimmedAdminFullName.length < 3 || trimmedAdminFullName.length > 80) {
      setFeedback('El nombre del administrador debe tener entre 3 y 80 caracteres')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    if (trimmedAdminPassword.length < 6) {
      setFeedback('La contraseña debe tener al menos 6 caracteres')
      setFeedbackType('error')
      setCreating(false)
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedAdminEmail)) {
      setFeedback('Por favor ingresa un email válido')
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
      const { data: gymData, error: gymError } = await supabase.from('gyms').insert({
        name: trimmedName,
        address: trimmedAddress,
        phone: trimmedPhone,
        description: trimmedDescription || null,
        image: imageUrl,
        is_active: formData.is_active,
      }).select()

      if (gymError) {
        setFeedback(`Error al crear gimnasio: ${gymError.message}`)
        setFeedbackType('error')
        setCreating(false)
        return
      }

      if (!gymData || gymData.length === 0) {
        setFeedback('Error: No se pudo obtener el ID del gimnasio registrado')
        setFeedbackType('error')
        setCreating(false)
        return
      }

      const gymId = gymData[0].id

      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: trimmedAdminEmail,
        password: trimmedAdminPassword,
        email_confirm: true,
      })

      if (authError) {
        setFeedback(`Error al crear usuario autenticado: ${authError.message}`)
        setFeedbackType('error')
        setCreating(false)
        return
      }

      if (!authData.user?.id) {
        setFeedback('Error: No se pudo obtener el ID del usuario autenticado')
        setFeedbackType('error')
        setCreating(false)
        return
      }

      const userId = authData.user.id

      // Crear usuario admin del gimnasio
      const { error: userError } = await supabase.from('administrators').insert({
        user_id: userId,
        full_name: trimmedAdminFullName,
        email: trimmedAdminEmail,
        gym_id: gymId,
        role: 'gym_admin',
      })

      if (userError) {
        setFeedback(`Error al crear administrador: ${userError.message}`)
        setFeedbackType('error')
        setCreating(false)
        return
      }

      setFeedback('✓ Gimnasio y administrador registrados exitosamente')
      setFeedbackType('success')
      setFormData({
        name: '',
        address: '',
        phone: '',
        description: '',
        is_active: true,
      })
      setAdminData({
        full_name: '',
        email: '',
        password: '',
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
          <p className="text-sm text-text-secondary mt-1">Completa los datos del gimnasio y del administrador para agregarlo a la plataforma.</p>
        </div>
        <span className="pill bg-primary/15 text-primary border-primary/30 inline-flex items-center gap-2">
          <Building2 size={16} /> Nuevo gimnasio
        </span>
      </div>

      <Card title="Información del gimnasio y administrador" subtitle="Todos los campos marcados con * son obligatorios">
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
            Imagen del gimnasio * (JPG o PNG)
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
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

          {/* Separador */}
          <div className="md:col-span-2 h-px bg-border my-2" />

          {/* Sección de Administrador del Gimnasio */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-text mb-3">Administrador del Gimnasio *</h3>
            <p className="text-xs text-text-secondary mb-4">Estos datos se utilizarán para crear la cuenta del administrador del gimnasio</p>
          </div>

          <label className="space-y-1 text-sm font-semibold text-text" htmlFor="adminFullName">
            Nombre completo del administrador *
            <input
              id="adminFullName"
              name="adminFullName"
              value={adminData.full_name}
              onChange={handleInputChange}
              required
              minLength={3}
              maxLength={80}
              placeholder="ej: Juan García"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-text" htmlFor="adminEmail">
            Email del administrador *
            <input
              id="adminEmail"
              name="adminEmail"
              type="email"
              value={adminData.email}
              onChange={handleInputChange}
              required
              maxLength={100}
              placeholder="ej: admin@gimnasio.com"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-text md:col-span-2" htmlFor="adminPassword">
            Contraseña del administrador *
            <input
              id="adminPassword"
              name="adminPassword"
              type="password"
              value={adminData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
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
                  Registrar gimnasio y administrador
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
