import { ShoppingBag } from 'lucide-react'
import Card from './Card'

const supplements = [
  {
    name: 'Proteína aislada 1kg',
    brand: 'PureFuel',
    price: '$32.00',
    tag: 'Recovery',
  },
  {
    name: 'Creatina monohidratada',
    brand: 'Elevate Labs',
    price: '$18.50',
    tag: 'Fuerza',
  },
  {
    name: 'Pre-workout citrus',
    brand: 'Ignite',
    price: '$24.90',
    tag: 'Energía',
  },
]

const SupplementList = () => {
  return (
    <Card
      title="Suplementos recomendados"
      subtitle="Basado en tu meta de fuerza y recuperación"
      action={
        <button className="pill bg-primary/15 text-primary border-primary/30">
          <ShoppingBag size={16} /> Ver tienda
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {supplements.map((item) => (
          <div key={item.name} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-text-secondary">{item.brand}</p>
                <p className="text-base font-semibold text-text">{item.name}</p>
              </div>
              <span className="pill text-text-secondary text-xs bg-background">{item.tag}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-text">{item.price}</p>
              <button className="rounded-xl bg-primary/90 px-3 py-2 text-xs font-semibold text-background hover:opacity-90">
                Añadir
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default SupplementList
