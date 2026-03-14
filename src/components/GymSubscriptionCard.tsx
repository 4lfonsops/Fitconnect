import { MapPin, ShieldCheck, Wifi } from 'lucide-react'
import Card from './Card'

const GymSubscriptionCard = () => {
  return (
    <Card
      title="Suscripción al gimnasio"
      subtitle="Tu pase está activo y listo para usar"
      action={
        <button className="pill bg-secondary/15 text-secondary border-secondary/30">
          <ShieldCheck size={16} /> Activa
        </button>
      }
    >
      <div className="flex flex-col gap-3 text-sm text-text">
        <div className="flex items-center gap-2 text-text-secondary">
          <MapPin size={16} />
          CrossFit One - 1.2 km
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
          <span className="pill">Clases HIIT</span>
          <span className="pill">Zona fuerza</span>
          <span className="pill inline-flex items-center gap-1"><Wifi size={14} /> WiFi</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary">Renueva</p>
            <p className="text-lg font-semibold">24 Feb 2026</p>
          </div>
          <button className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-text hover:border-primary/40">
            Ver pases
          </button>
        </div>
      </div>
    </Card>
  )
}

export default GymSubscriptionCard
