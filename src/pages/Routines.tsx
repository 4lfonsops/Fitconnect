import { BadgeCheck, Clock, Dumbbell, Filter, PlayCircle, Sparkles } from 'lucide-react'
import Card from '../components/Card'

const routines = [
  {
    name: 'Upper Power',
    goal: 'Fuerza',
    level: 'Intermedio',
    duration: '45 min',
    status: 'Activa',
  },
  {
    name: 'Lower Burn',
    goal: 'Hipertrofia',
    level: 'Intermedio',
    duration: '50 min',
    status: 'Completada',
  },
  {
    name: 'Mobility Flow',
    goal: 'Movilidad',
    level: 'Básico',
    duration: '30 min',
    status: 'Activa',
  },
]

const Routines = () => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-text-secondary">Rutinas</p>
        <h1 className="text-2xl font-bold">Organiza y filtra tus entrenamientos</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="pill bg-surface">
          <Filter size={16} /> Objetivo
        </button>
        <button className="pill bg-surface">
          <Sparkles size={16} /> Nivel
        </button>
        <button className="pill bg-surface">
          <BadgeCheck size={16} /> Estado
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {routines.map((routine) => (
          <Card key={routine.name} className="h-full">
            <div className="flex flex-col gap-3 h-full">
              <div>
                <p className="text-sm text-text-secondary">{routine.goal} • {routine.level}</p>
                <p className="text-lg font-semibold text-text">{routine.name}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-text-secondary">
                <span className="inline-flex items-center gap-2"><Clock size={16} /> {routine.duration}</span>
                <span className={`pill text-xs ${routine.status === 'Completada' ? 'bg-success/15 text-success border-success/30' : 'bg-primary/15 text-primary border-primary/30'}`}>
                  {routine.status}
                </span>
              </div>
              <div className="mt-auto flex items-center gap-2">
                <button className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-background inline-flex items-center gap-2">
                  <PlayCircle size={16} /> Iniciar
                </button>
                <button className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-text inline-flex items-center gap-2">
                  <Dumbbell size={16} /> Detalles
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Routines
