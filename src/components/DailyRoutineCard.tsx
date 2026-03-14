import { Clock, Dumbbell, Play } from 'lucide-react'
import Card from './Card'

const DailyRoutineCard = () => {
  const routine = {
    title: 'Push Power 45',
    focus: 'Fuerza superior',
    duration: '45 min',
    exercises: 9,
    completion: 62,
  }

  return (
    <Card
      title="Rutina de hoy"
      subtitle="Plan sugerido según tu objetivo de hipertrofia"
      action={
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
          <Play size={16} />
          Iniciar
        </button>
      }
      className="bg-gradient-to-br from-primary/15 via-surface to-secondary/10"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-text-secondary">{routine.focus}</p>
          <h2 className="text-2xl font-bold text-text mt-1">{routine.title}</h2>
          <div className="mt-3 flex items-center gap-4 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-2"><Clock size={16} /> {routine.duration}</span>
            <span className="inline-flex items-center gap-2"><Dumbbell size={16} /> {routine.exercises} ejercicios</span>
          </div>
        </div>
        <div className="w-full md:w-60">
          <div className="flex items-center justify-between text-sm font-semibold mb-2">
            <span>Avance semanal</span>
            <span className="text-primary">{routine.completion}%</span>
          </div>
          <div className="h-3 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${routine.completion}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default DailyRoutineCard
