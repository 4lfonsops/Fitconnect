import { CheckCircle2, Clock, Trophy, UserRound } from 'lucide-react'
import Card from '../components/Card'

const Profile = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Perfil</p>
          <h1 className="text-2xl font-bold">Tu resumen y progreso</h1>
        </div>
        <button className="pill bg-primary/15 text-primary border-primary/30">Editar perfil</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Datos personales">
          <ul className="space-y-2 text-sm text-text">
            <li className="flex items-center justify-between"><span className="text-text-secondary">Nombre</span><span>Jessica Mills</span></li>
            <li className="flex items-center justify-between"><span className="text-text-secondary">Edad</span><span>29</span></li>
            <li className="flex items-center justify-between"><span className="text-text-secondary">Meta</span><span>Hipertrofia</span></li>
          </ul>
        </Card>
        <Card title="Progreso físico">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-text-secondary">Peso</span><span className="font-semibold">62.4 kg</span></div>
            <div className="flex items-center justify-between"><span className="text-text-secondary">Grasa</span><span className="font-semibold">19.3%</span></div>
            <div className="flex items-center justify-between"><span className="text-text-secondary">Masa magra</span><span className="font-semibold">50.3 kg</span></div>
          </div>
        </Card>
        <Card title="Suscripción" subtitle="Plan Plus activo">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-success"><CheckCircle2 size={16} /> Acceso a rutinas premium</div>
            <div className="flex items-center gap-2 text-success"><Trophy size={16} /> Retos mensuales</div>
            <div className="flex items-center gap-2 text-success"><Clock size={16} /> Soporte prioritario</div>
          </div>
        </Card>
      </div>

      <Card title="Logros recientes" subtitle="Sigue acumulando streaks">
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="pill bg-primary/15 text-primary border-primary/30 inline-flex items-center gap-2"><UserRound size={16} /> 30 días activos</span>
          <span className="pill bg-success/15 text-success border-success/30">5k calorías quemadas</span>
          <span className="pill bg-warning/15 text-warning border-warning/30">Top 10% comunidad</span>
        </div>
      </Card>
    </div>
  )
}

export default Profile
