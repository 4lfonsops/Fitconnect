import { MapPin, Phone, Star } from 'lucide-react'
import Card from '../components/Card'

const gyms = [
  {
    name: 'CrossFit One',
    distance: '1.2 km',
    rating: 4.8,
    perks: ['HIIT', 'Locker', 'WiFi'],
  },
  {
    name: 'Powerhouse Gym',
    distance: '2.0 km',
    rating: 4.6,
    perks: ['Fuerza', 'Sauna', 'Parking'],
  },
  {
    name: 'Fit Studio',
    distance: '2.8 km',
    rating: 4.4,
    perks: ['Pilates', 'Yoga', 'Café'],
  },
]

const Gyms = () => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-text-secondary">Gimnasios</p>
        <h1 className="text-2xl font-bold">Encuentra el spot perfecto</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gyms.map((gym) => (
          <Card key={gym.name} className="h-full">
            <div className="flex h-full flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary flex items-center gap-2">
                    <MapPin size={16} /> {gym.distance}
                  </p>
                  <p className="text-lg font-semibold text-text">{gym.name}</p>
                </div>
                <span className="pill text-xs"><Star size={14} className="text-warning" /> {gym.rating}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                {gym.perks.map((perk) => (
                  <span key={perk} className="pill bg-background">{perk}</span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between text-sm">
                <button className="rounded-xl bg-primary px-3 py-2 text-background font-semibold">Ver pases</button>
                <button className="rounded-xl border border-border px-3 py-2 font-semibold text-text inline-flex items-center gap-2">
                  <Phone size={16} /> Llamar
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Gyms
