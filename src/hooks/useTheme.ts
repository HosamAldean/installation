import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const getInitial = (): Theme => {
    try {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored === 'dark' || stored === 'light') return stored
      // fallback to document attributes / class
      if (typeof document !== 'undefined') {
        const data = (document.documentElement.dataset.theme as Theme) || null
        if (data === 'dark' || data === 'light') return data
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      }
    } catch {}
    return 'light'
  }

  const [theme, setThemeState] = useState<Theme>(getInitial)

  const apply = useCallback((next: Theme) => {
    try {
      document.documentElement.dataset.theme = next
      if (next === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', next)
    } catch {}
  }, [])

  useEffect(() => {
    apply(theme)
  }, [theme, apply])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const toggleTheme = useCallback(() => setThemeState((s) => (s === 'dark' ? 'light' : 'dark')), [])

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}

export default useTheme