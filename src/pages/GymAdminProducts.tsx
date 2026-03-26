import { useEffect, useState, useRef } from 'react'
import { Loader2, Save, Trash2, Download } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import { exportToCSV, type CSVRow } from '../utils/csvExport'

type ProductRow = {
  id?: string
  name?: string
  description?: string
  price?: number | string
  stock?: number
  image_url?: string
  category?: string
  is_active?: boolean
  gym_id?: string
}

const GymAdminProducts = () => {
  const [gymId, setGymId] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [form, setForm] = useState<ProductRow>({ name: '', description: '', price: 0, stock: 0, image_url: '', category: '', is_active: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadGymId = async () => {
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth.user?.id
    if (!userId) throw new Error('No hay sesión activa')
    
    // Obtener gym_id de la tabla administrators
    const { data: admin, error: adminError } = await supabase
      .from('administrators')
      .select('gym_id')
      .eq('user_id', userId)
      .single()
    
    if (adminError) {
      console.error('Error cargando admin:', adminError)
      throw new Error(`Error al cargar administrador: ${adminError.message}`)
    }
    if (!admin?.gym_id) throw new Error('El administrador no tiene gimnasio asignado')
    
    return admin.gym_id
  }

  const loadProducts = async (currentGymId: string) => {
    const { data, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('gym_id', currentGymId)
      .order('created_at', { ascending: false })
    
    if (prodError) {
      console.error('Error cargando productos:', prodError)
      throw new Error(`Error al cargar productos: ${prodError.message}`)
    }
    setProducts(data ?? [])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      // Validar que sea formato de imagen permitido
      const validMimeTypes = ['image/jpeg', 'image/png']
      const validExtensions = ['.jpg', '.jpeg', '.png']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (!validMimeTypes.includes(file.type) || !validExtensions.includes(fileExtension)) {
        setError('Por favor sube solo archivos JPG o PNG')
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
      .from('products')
      .upload(fileName, file)

    if (uploadError) {
      throw new Error(`Error al subir imagen: ${uploadError.message}`)
    }

    // Obtener URL pública
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  useEffect(() => {
    let active = true
    const init = async () => {
      setLoading(true)
      setError('')
      try {
        const currentGymId = await loadGymId()
        if (!currentGymId) throw new Error('El perfil no tiene gimnasio asignado')
        if (!active) return
        setGymId(currentGymId)
        await loadProducts(currentGymId)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'No se pudieron cargar productos')
      } finally {
        if (active) setLoading(false)
      }
    }
    init()
    return () => {
      active = false
    }
  }, [])

  const handleSave = async () => {
    if (!gymId) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      let imageUrl = form.image_url
      
      // Si hay una imagen nueva, subirla
      if (imageFile) {
        console.log('Subiendo imagen...')
        imageUrl = await uploadImageToStorage(imageFile)
        console.log('Imagen subida:', imageUrl)
      }
      
      const payload = {
        ...form,
        gym_id: gymId,
        image_url: imageUrl,
        name: form.name?.trim(),
        description: form.description?.trim(),
        category: form.category?.trim()
      }
      console.log('Payload a guardar:', payload)
      
      if (!payload.name) throw new Error('El nombre es obligatorio')
      if (payload.name.length < 3 || payload.name.length > 80) throw new Error('El nombre debe tener entre 3 y 80 caracteres')

      const priceValue = typeof payload.price === 'number' ? payload.price : Number(payload.price)
      if (!Number.isFinite(priceValue) || priceValue < 1) throw new Error('El precio debe ser mayor a 1')

      const stockValue = payload.stock ?? 0
      if (!Number.isInteger(stockValue) || stockValue < 0) throw new Error('El stock debe ser un número entero mayor o igual a 0')

      if (payload.description && payload.description.length > 300) throw new Error('La descripción no puede exceder 300 caracteres')
      if (payload.category && payload.category.length > 60) throw new Error('La categoría no puede exceder 60 caracteres')
      
      if (payload.id) {
        console.log('Actualizando producto...')
        const { error: updateError } = await supabase.from('products').update(payload).eq('id', payload.id)
        if (updateError) {
          console.error('Error al actualizar:', updateError)
          throw updateError
        }
        setMessage('Producto actualizado')
      } else {
        console.log('Creando producto...')
        const { error: insertError } = await supabase.from('products').insert(payload)
        if (insertError) {
          console.error('Error al insertar:', insertError)
          throw insertError
        }
        setMessage('Producto creado')
      }
      await loadProducts(gymId)
      setForm({ name: '', description: '', price: 0, stock: 0, image_url: '', category: '', is_active: true })
      setImageFile(null)
      setImagePreview('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Error completo:', err)
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product: ProductRow) => {
    setForm(product)
  }

  const getButtonText = () => {
    if (saving) return 'Guardando…'
    if (form.id) return 'Actualizar'
    return 'Crear producto'
  }

  const getPriceValue = (price: number | string | undefined) => {
    if (price === undefined || price === null) return 0
    return typeof price === 'number' ? price : Number(price)
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const { error: delError } = await supabase.from('products').delete().eq('id', id)
      if (delError) throw delError
      if (gymId) await loadProducts(gymId)
      setMessage('Producto eliminado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally {
      setSaving(false)
    }
  }

  const handleExportCSV = () => {
    console.log('Exporting products...', products.length)
    const csvData: CSVRow[] = products.map((product) => ({
      ID: product.id || '',
      Nombre: product.name || '',
      Descripción: product.description || '',
      Categoría: product.category || '',
      Precio: typeof product.price === 'number' ? product.price.toFixed(2) : product.price,
      Stock: product.stock || 0,
      Estado: product.is_active ? 'Activo' : 'Inactivo'
    }))

    const now = new Date()
    const filename = `productos-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`
    exportToCSV(csvData, filename)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Productos</p>
        <h1 className="text-2xl font-bold">Inventario de la tienda</h1>
        {gymId && <p className="text-xs text-text-secondary mt-1">Gym: {gymId}</p>}
      </div>
      <Card subtitle="Controla precios, stock y visibilidad" action={
        <button
          onClick={handleExportCSV}
          disabled={loading || products.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-primary/15 text-primary border border-primary/30 px-3 py-2 text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} /> Exportar
        </button>
      }>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1 space-y-3">
            <p className="text-sm font-semibold text-text">Crear / editar</p>
            <input
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Nombre"
              value={form.name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              minLength={3}
              maxLength={80}
            />
            <textarea
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Descripción"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              maxLength={300}
            />
            <div>
              <label htmlFor="price-input" className="text-xs font-semibold text-text-secondary">Precio ($) (Mínimo 1.00)</label>
              <input
                id="price-input"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                type="number"
                min={1}
                step={0.01}
                placeholder="1.00"
                value={form.price === undefined || form.price === 0 ? '' : form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value ? Number(e.target.value) : 0 }))}
              />
            </div>
            <div>
              <label htmlFor="stock-input" className="text-xs font-semibold text-text-secondary">Stock (Unidades)</label>
              <input
                id="stock-input"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                type="number"
                min={0}
                step={1}
                placeholder="Ingresa el stock"
                value={form.stock === undefined || form.stock === 0 ? '' : form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value ? Number(e.target.value) : 0 }))}
              />
            </div>
            <div>
              <label htmlFor="image-input" className="text-xs font-semibold text-text-secondary">Imagen del producto (JPG o PNG)</label>
              <input
                id="image-input"
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleImageChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
              {imagePreview && (
                <div className="mt-2 overflow-hidden rounded-lg border border-border bg-surface/40">
                  <img src={imagePreview} alt="Preview" className="h-44 w-full object-contain" />
                </div>
              )}
            </div>
            <input
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Categoría"
              value={form.category ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              maxLength={60}
            />
            <label className="inline-flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={form.is_active ?? true}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              {' '}
              Activo en la tienda
            </label>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-60"
            >
              <Save size={16} />
              {' '}
              {getButtonText()}
            </button>
            {message && <p className="text-sm text-success">{message}</p>}
            {error && <p className="text-sm text-warning">{error}</p>}
          </div>

          <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-text-secondary md:col-span-2">
                <Loader2 className="animate-spin" size={16} />
                {' '}
                Cargando productos
              </div>
            )}
            {!loading && products.length === 0 && (
              <p className="text-sm text-text-secondary md:col-span-2">Sin productos cargados.</p>
            )}
            {!loading && products.length > 0 && products.map((item) => {
              const priceNum = getPriceValue(item.price)
              return (
                <div key={item.id ?? item.name} className="rounded-2xl border border-border bg-background p-4 space-y-2">
                  {item.image_url && (
                    <div className="overflow-hidden rounded-lg border border-border bg-surface/40">
                      <img src={item.image_url} alt={item.name} className="h-40 w-full object-contain" loading="lazy" />
                    </div>
                  )}
                  <p className="text-xs text-text-secondary">{item.category ?? 'Sin categoría'}</p>
                  <p className="text-base font-semibold text-text">{item.name ?? 'Sin nombre'}</p>
                  <p className="text-sm text-text-secondary line-clamp-2">{item.description ?? 'Sin descripción'}</p>
                  <p className="text-sm text-text-secondary">Stock: {item.stock ?? 0}</p>
                  <p className="text-sm text-text-secondary">Estado: {item.is_active ? 'Activo' : 'Oculto'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${priceNum.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg border border-error text-error px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default GymAdminProducts
