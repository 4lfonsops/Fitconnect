import { BarChart3, Building2, CreditCard, ShoppingBasket, Ticket, Users, Workflow } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const gymAdminNav = [
  { label: 'Overview', to: '/admin', icon: BarChart3 },
  { label: 'Usuarios', to: '/admin/users', icon: Users },
  { label: 'Mi gimnasio', to: '/admin/gym', icon: Building2 },
  { label: 'Suscripciones', to: '/admin/subscriptions', icon: Ticket },
  { label: 'Productos', to: '/admin/products', icon: ShoppingBasket },
  { label: 'Pedidos', to: '/admin/orders', icon: Workflow },
  { label: 'Pagos', to: '/admin/payments', icon: CreditCard },
]

const GymAdminSidebar = () => {
  return (
    <aside className="hidden lg:flex w-72 flex-col gap-6 bg-surface border-r border-border px-6 py-8">
      <div className="flex items-center gap-2 text-xl font-bold text-text">
        <div className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-black">
          ADM
        </div>
        <div>
          <div>FitConnect Admin</div>
          <p className="text-xs text-text-secondary">Panel de gimnasio</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {gymAdminNav.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors border border-transparent ${
                isActive
                  ? 'bg-primary/15 text-primary border-primary/30 shadow-soft'
                  : 'text-text-secondary hover:text-text hover:border-border'
              }`
            }
            end={to === '/admin'}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default GymAdminSidebar
