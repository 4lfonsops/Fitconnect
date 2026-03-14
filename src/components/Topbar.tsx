import { Bell, Menu, Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../store/theme'

const Topbar = () => {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
      <div className="flex items-center gap-4 px-4 py-3 md:px-6">
        <button
          className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-surface"
          aria-label="Abrir navegación"
        >
          <Menu size={18} />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-surface"
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-surface">
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-surface border border-border px-3 py-1.5">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              J
            </div>
            <div className="text-sm">
              <p className="font-semibold text-text">Jessica</p>
              <p className="text-text-secondary">Membresía Plus</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
