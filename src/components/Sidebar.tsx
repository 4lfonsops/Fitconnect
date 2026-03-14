import { Dumbbell, Home, MapPin, ShoppingBag, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/', icon: Home },
  { label: 'Rutinas', to: '/routines', icon: Dumbbell },
  { label: 'Tienda', to: '/store', icon: ShoppingBag },
  { label: 'Gimnasios', to: '/gyms', icon: MapPin },
  { label: 'Perfil', to: '/profile', icon: User },
]

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col gap-6 bg-surface border-r border-border px-6 py-8">
      <div className="flex items-center gap-2 text-xl font-bold text-text">
        <div className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-black">
          FC
        </div>
        <div>
          <div>FitConnect</div>
          <p className="text-xs text-text-secondary">Fitness, tienda y gym</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors border border-transparent ${
                isActive
                  ? 'bg-primary/15 text-primary border-primary/40 shadow-soft'
                  : 'text-text-secondary hover:text-text hover:border-border'
              }`
            }
            end={to === '/'}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 p-4 text-sm">
        <p className="font-semibold text-text mb-2">Plus Coaching</p>
        <p className="text-text-secondary mb-4">
          Sube de nivel con entrenamientos personalizados y seguimiento de hábitos.
        </p>
        <button className="w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity">
          Actualizar plan
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
