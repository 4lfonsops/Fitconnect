import DailyRoutineCard from '../components/DailyRoutineCard'
import GymSubscriptionCard from '../components/GymSubscriptionCard'
import StatGrid from '../components/StatGrid'
import SupplementList from '../components/SupplementList'

const Dashboard = () => {
  const greeting = 'Hola, Jessica'
  const message = 'Listos para romper el entrenamiento de hoy'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-text-secondary">{greeting}</p>
        <h1 className="text-2xl md:text-3xl font-bold">{message}</h1>
      </div>

      <DailyRoutineCard />
      <StatGrid />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SupplementList />
        </div>
        <GymSubscriptionCard />
      </div>
    </div>
  )
}

export default Dashboard
