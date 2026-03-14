import { ShoppingBag } from 'lucide-react'
import Card from '../components/Card'

const products = [
  {
    name: 'Combo protein + creatina',
    price: '$46.00',
    tag: 'Popular',
  },
  {
    name: 'Amino Recovery Citrus',
    price: '$21.00',
    tag: 'Recovery',
  },
  {
    name: 'Bundle energía + focus',
    price: '$29.00',
    tag: 'Energía',
  },
]

const Store = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Tienda</p>
          <h1 className="text-2xl font-bold">Suplementos curados para tus metas</h1>
        </div>
        <button className="pill bg-primary/15 text-primary border-primary/30">
          <ShoppingBag size={16} /> Carrito (2)
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <Card key={product.name} className="h-full">
            <div className="flex h-full flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">{product.tag}</p>
                <span className="pill text-xs bg-secondary/15 text-secondary border-secondary/30">Fit pick</span>
              </div>
              <p className="text-lg font-semibold text-text">{product.name}</p>
              <div className="flex items-center justify-between mt-auto">
                <p className="text-xl font-bold text-text">{product.price}</p>
                <button className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-background">
                  Añadir
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Store
