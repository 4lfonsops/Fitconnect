import Card from '../components/Card'

const AdminCodes = () => {
  const codes = [
    { gym: 'CrossFit One', code: 'CF-9X2A', status: 'Disponible', usedBy: '-', expires: '30 días' },
    { gym: 'Powerhouse', code: 'PH-44KD', status: 'Asignado', usedBy: 'carlos@demo.com', expires: '—' },
    { gym: 'Fit Studio', code: 'FS-11QW', status: 'Agotado', usedBy: '—', expires: '—' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Códigos</p>
        <h1 className="text-2xl font-bold">Códigos únicos de afiliación</h1>
      </div>
      <Card subtitle="Alta, agotamiento y asociación usuario↔gimnasio según SRS">
        <div className="flex flex-wrap gap-3 text-sm mb-4">
          <button className="pill bg-primary/15 text-primary border-primary/30">Generar lote</button>
          <button className="pill bg-secondary/15 text-secondary border-secondary/30">Exportar CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-text-secondary">
              <tr>
                <th className="py-2">Gimnasio</th>
                <th className="py-2">Código</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Asignado a</th>
                <th className="py-2">Vigencia</th>
                <th className="py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {codes.map((code) => (
                <tr key={code.code}>
                  <td className="py-3 font-semibold text-text">{code.gym}</td>
                  <td className="py-3">{code.code}</td>
                  <td className="py-3">
                    <span className={`pill text-xs ${code.status === 'Disponible' ? 'bg-success/15 text-success border-success/30' : code.status === 'Asignado' ? 'bg-primary/15 text-primary border-primary/30' : 'bg-error/15 text-error border-error/30'}`}>
                      {code.status}
                    </span>
                  </td>
                  <td className="py-3 text-text-secondary">{code.usedBy}</td>
                  <td className="py-3 text-text-secondary">{code.expires}</td>
                  <td className="py-3 text-right">
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text">Ver</button>
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

export default AdminCodes
