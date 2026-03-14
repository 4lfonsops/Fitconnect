import Card from '../components/Card'

const AdminSettings = () => {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Ajustes</p>
        <h1 className="text-2xl font-bold">Parámetros del panel</h1>
      </div>
      <Card subtitle="Configuraciones básicas (rol, seguridad, integraciones sandbox)">
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-text">Seguridad</p>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              Enforce 2FA (admin)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              Expiración de sesión 30 min
            </label>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-text">Integraciones</p>
            <p className="text-text-secondary">Stripe sandbox, mapas/geolocalización (solo entorno pruebas)</p>
            <button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text">Configurar claves</button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AdminSettings
