import { createContext, useContext, useEffect, useState } from 'react'

const ThemeCtx = createContext({ dark: false, toggle: () => {} })

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggle = () => {
    setDark(d => {
      const next = !d
      localStorage.setItem('theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>
}

export function ThemeToggle() {
  const { dark, toggle } = useContext(ThemeCtx)
  return (
    <button
      onClick={toggle}
      aria-label="Ganti tema"
      className="btn-comic bg-pop-purple text-white text-sm sm:text-lg leading-none px-2 sm:px-3 py-1 sm:py-2"
      title={dark ? 'Mode terang' : 'Mode gelap'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}