import Card from '../components/Card'

const AdminOrders = () => {
  const orders = [
    { id: '#1254', user: 'jessica@demo.com', total: '$54.00', status: 'Borrador', items: 3 },
    { id: '#1253', user: 'carlos@demo.com', total: '$32.00', status: 'Pagado', items: 2 },
    { id: '#1252', user: 'marta@demo.com', total: '$18.50', status: 'Revisión', items: 1 },
  ]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Pedidos</p>
        <h1 className="text-2xl font-bold">Carrito y pedidos (sandbox)</h1>
      </div>
      <Card subtitle="Seguimiento de estados: Borrador, Confirmado, Pagado (pruebas), Revisión">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-text-secondary">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">Usuario</th>
                <th className="py-2">Items</th>
                <th className="py-2">Total</th>
                <th className="py-2">Estado</th>
                <th className="py-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 font-semibold text-text">{o.id}</td>
                  <td className="py-3">{o.user}</td>
                  <td className="py-3">{o.items}</td>
                  <td className="py-3">{o.total}</td>
                  <td className="py-3">
                    <span className={`pill text-xs ${o.status === 'Pagado' ? 'bg-success/15 text-success border-success/30' : o.status === 'Revisión' ? 'bg-warning/15 text-warning border-warning/30' : 'bg-primary/15 text-primary border-primary/30'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text">Detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AdminOrders
