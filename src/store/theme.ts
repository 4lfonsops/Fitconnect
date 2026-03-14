import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'fitconnect-theme'

const applyThemeToDom = (theme: ThemeMode) => {
  document.documentElement.dataset.theme = theme
}

const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

interface ThemeState {
  theme: ThemeMode
  initialize: () => void
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  initialize: () => {
    const next = resolveInitialTheme()
    applyThemeToDom(next)
    window.localStorage.setItem(STORAGE_KEY, next)
    set({ theme: next })
  },
  setTheme: (theme) => {
    applyThemeToDom(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
    set({ theme })
  },
  toggleTheme: () =>
    set((state) => {
      const next: ThemeMode = state.theme === 'light' ? 'dark' : 'light'
      applyThemeToDom(next)
      window.localStorage.setItem(STORAGE_KEY, next)
      return { theme: next }
    }),
}))
