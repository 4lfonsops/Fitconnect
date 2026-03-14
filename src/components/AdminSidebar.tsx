import { BarChart3, CreditCard, KeyRound, Layers, Settings, Ticket, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const adminNav = [
  { label: 'Overview', to: '/superadmin', icon: BarChart3 },
  { label: 'Gimnasios', to: '/superadmin/gyms', icon: Layers },
  { label: 'Suscripciones', to: '/superadmin/subscriptions', icon: Ticket },
  { label: 'Pagos', to: '/superadmin/payments', icon: CreditCard },
  { label: 'Ajustes', to: '/superadmin/settings', icon: Settings },
  { label: 'Registrar gym', to: '/superadmin/register-gym', icon: KeyRound },
]

type AdminSidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 flex-col gap-6 bg-surface border-r border-border px-6 py-8 transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:flex lg:translate-x-0`}
    >
      <button
        onClick={onClose}
        className="lg:hidden absolute right-4 top-4 h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-background"
        aria-label="Cerrar menú"
      >
        <X size={18} />
      </button>
      <div className="flex items-center gap-2 text-xl font-bold text-text">
        <div className="h-10 w-10 rounded-2xl bg-error/15 flex items-center justify-center text-error font-black">
          ADM
        </div>
        <div>
          <div>FitConnect Superadmin</div>
          <p className="text-xs text-text-secondary">Control corporativo</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {adminNav.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors border border-transparent ${
                isActive
                  ? 'bg-error/10 text-error border-error/30 shadow-soft'
                  : 'text-text-secondary hover:text-text hover:border-border'
              }`
            }
            end={to === '/superadmin'}
            onClick={onClose}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

    </aside>
  )
}

export default AdminSidebar
