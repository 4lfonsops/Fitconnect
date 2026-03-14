import Card from '../components/Card'

const AdminProducts = () => {
  const products = [
    { name: 'Proteína aislada', sku: 'PF-101', stock: 84, price: '$32.00' },
    { name: 'Creatina 300g', sku: 'EL-233', stock: 42, price: '$18.50' },
    { name: 'Pre-workout', sku: 'IG-889', stock: 15, price: '$24.90' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Productos</p>
        <h1 className="text-2xl font-bold">Inventario y catálogo</h1>
      </div>
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          {products.map((item) => (
            <div key={item.sku} className="rounded-2xl border border-border bg-background p-4 space-y-2">
              <p className="text-xs text-text-secondary">SKU {item.sku}</p>
              <p className="text-base font-semibold text-text">{item.name}</p>
              <p className="text-sm text-text-secondary">Stock: {item.stock}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{item.price}</span>
                <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-background">Editar</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default AdminProducts
