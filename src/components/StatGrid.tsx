import { Activity, Flame, HeartPulse, TrendingUp } from 'lucide-react'

const stats = [
  {
    label: 'Calorías quemadas',
    value: '520 kcal',
    trend: '+8%',
    icon: Flame,
  },
  {
    label: 'Tiempo activo',
    value: '62 min',
    trend: '+12%',
    icon: Activity,
  },
  {
    label: 'Frecuencia cardíaca',
    value: '132 bpm',
    trend: 'estable',
    icon: HeartPulse,
  },
  {
    label: 'Progreso semanal',
    value: '74%',
    trend: '+5%',
    icon: TrendingUp,
  },
]

const StatGrid = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, trend, icon: Icon }) => (
        <div
          key={label}
          className="card-panel flex items-start gap-3"
        >
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-text">{value}</p>
              <span className="text-xs text-success font-semibold">{trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatGrid
