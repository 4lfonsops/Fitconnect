import { useEffect } from 'react'
import { useThemeStore } from '../store/theme'

interface ThemeProviderProps {
  children: React.ReactNode
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { initialize, theme } = useThemeStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return <>{children}</>
}

export default ThemeProvider
