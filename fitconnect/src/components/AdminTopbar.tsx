import { LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/theme'
import { supabase } from '../lib/supabase'

type AdminTopbarProps = {
  onMenuClick: () => void
}

const AdminTopbar = ({ onMenuClick }: AdminTopbarProps) => {
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between gap-4 px-4 py-3 xl:px-6">
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-background"
            aria-label="Abrir menú"
            onClick={onMenuClick}
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-text hover:bg-border/20"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>

          <button
            onClick={toggleTheme}
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-background"
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminTopbar
