import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { ServiceWorkerManager, ServiceWorkerUtils } from '../lib/service-worker-register'

const UpdatePrompt = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Configurar callback para cuando hay actualizaciones disponibles
    ServiceWorkerManager.onUpdate(() => {
      console.log('Update available')
      setIsVisible(true)
    })
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      // Notificar al Service Worker que salte la espera
      ServiceWorkerUtils.skipWaiting()
      // El controllerchange event recargará la página automáticamente
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="rounded-2xl bg-primary/10 border border-primary/30 backdrop-blur px-4 py-3 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">Nueva versión disponible</p>
            <p className="text-xs text-text-secondary mt-1">Se ha actualizado la aplicación</p>
          </div>
          
          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="flex-shrink-0 text-primary/60 hover:text-primary disabled:opacity-50 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-background px-3 py-2 text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {isUpdating && <Loader2 size={14} className="animate-spin" />}
            {isUpdating ? 'Actualizando...' : 'Actualizar'}
          </button>
          
          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="flex-1 rounded-lg bg-primary/20 text-primary border border-primary/30 px-3 py-2 text-xs font-semibold hover:bg-primary/30 disabled:opacity-60 transition-colors"
          >
            Más tarde
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdatePrompt
