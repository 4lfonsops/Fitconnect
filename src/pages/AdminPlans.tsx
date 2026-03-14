import Card from '../components/Card'

const AdminPlans = () => {
  const plans = [
    { gym: 'CrossFit One', name: 'Mensual', price: '$35', cycle: '30 días', status: 'Activo' },
    { gym: 'Powerhouse', name: 'Trimestral', price: '$90', cycle: '90 días', status: 'Activo' },
    { gym: 'Fit Studio', name: 'Pruebas', price: '$0', cycle: '7 días', status: 'Pruebas' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Planes</p>
        <h1 className="text-2xl font-bold">Planes de suscripción por gimnasio</h1>
      </div>
      <Card subtitle="Definición de precios, ciclos y beneficios">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-text-secondary">
              <tr>
                <th className="py-2">Gimnasio</th>
                <th className="py-2">Plan</th>
                <th className="py-2">Precio</th>
                <th className="py-2">Ciclo</th>
                <th className="py-2">Estado</th>
                <th className="py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.map((plan) => (
                <tr key={`${plan.gym}-${plan.name}`}>
                  <td className="py-3 font-semibold text-text">{plan.gym}</td>
                  <td className="py-3">{plan.name}</td>
                  <td className="py-3">{plan.price}</td>
                  <td className="py-3">{plan.cycle}</td>
                  <td className="py-3">
                    <span className={`pill text-xs ${plan.status === 'Activo' ? 'bg-success/15 text-success border-success/30' : 'bg-warning/15 text-warning border-warning/30'}`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text">Editar</button>
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

export default AdminPlans
