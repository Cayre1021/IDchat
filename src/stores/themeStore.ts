import { create } from 'zustand'
import { loadTheme, saveTheme } from '../lib/storage'

const THEME_VARS: Record<string, Record<string, string>> = {
  default: { '--bg':'#f0f2f5','--surface':'#fff','--header':'#3a8fd4','--header-text':'#fff','--text':'#1a1a1a','--text-secondary':'#8e8e93','--bubble-user':'#e3f2fd','--bubble-ai':'#fff','--bubble-user-text':'#1a1a1a','--bubble-ai-text':'#1a1a1a','--tab-bar':'#fff','--accent':'#3a8fd4','--tab-inactive':'#8e8e93','--divider':'#e5e5ea','--input-bg':'#f0f2f5','--card':'#fff','--quote-bar-bg':'#f8f8fa','--highlight-flash':'#fff9c4' },
  dark: { '--bg':'#1c1c1e','--surface':'#2c2c2e','--header':'#1c1c1e','--header-text':'#fff','--text':'#fff','--text-secondary':'#98989e','--bubble-user':'#3a8fd4','--bubble-ai':'#2c2c2e','--bubble-user-text':'#fff','--bubble-ai-text':'#fff','--tab-bar':'#1c1c1e','--accent':'#3a8fd4','--tab-inactive':'#636366','--divider':'#38383a','--input-bg':'#2c2c2e','--card':'#2c2c2e','--quote-bar-bg':'#2c2c2e','--highlight-flash':'#5c5500' },
  midnight: { '--bg':'#0d1b2a','--surface':'#1b2838','--header':'#1b2838','--header-text':'#e0e1dd','--text':'#e0e1dd','--text-secondary':'#778da9','--bubble-user':'#415a77','--bubble-ai':'#1b2838','--bubble-user-text':'#fff','--bubble-ai-text':'#e0e1dd','--tab-bar':'#0d1b2a','--accent':'#778da9','--tab-inactive':'#415a77','--divider':'#1b2838','--input-bg':'#1b2838','--card':'#1b2838','--quote-bar-bg':'#1b2838','--highlight-flash':'#3d4520' },
  rose: { '--bg':'#fdf2f4','--surface':'#fff','--header':'#e8738a','--header-text':'#fff','--text':'#2d1b20','--text-secondary':'#b39298','--bubble-user':'#fde2e7','--bubble-ai':'#fff','--bubble-user-text':'#2d1b20','--bubble-ai-text':'#2d1b20','--tab-bar':'#fff','--accent':'#e8738a','--tab-inactive':'#b39298','--divider':'#f0dde1','--input-bg':'#fdf2f4','--card':'#fff','--quote-bar-bg':'#fdf2f4','--highlight-flash':'#fff9c4' },
  green: { '--bg':'#f0f7f4','--surface':'#fff','--header':'#4caf84','--header-text':'#fff','--text':'#1a2a20','--text-secondary':'#7a9a85','--bubble-user':'#dff5e8','--bubble-ai':'#fff','--bubble-user-text':'#1a2a20','--bubble-ai-text':'#1a2a20','--tab-bar':'#fff','--accent':'#4caf84','--tab-inactive':'#7a9a85','--divider':'#dde8e0','--input-bg':'#f0f7f4','--card':'#fff','--quote-bar-bg':'#f0f7f4','--highlight-flash':'#fff9c4' },
  sunset: { '--bg':'#fff8f5','--surface':'#fff','--header':'#e8894f','--header-text':'#fff','--text':'#2d1e18','--text-secondary':'#b3988a','--bubble-user':'#fde8db','--bubble-ai':'#fff','--bubble-user-text':'#2d1e18','--bubble-ai-text':'#2d1e18','--tab-bar':'#fff','--accent':'#e8894f','--tab-inactive':'#b3988a','--divider':'#f0ddd3','--input-bg':'#fff8f5','--card':'#fff','--quote-bar-bg':'#fff8f5','--highlight-flash':'#fff9c4' },
}

function applyVars(vars: Record<string, string>) {
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
}

function resolveTheme(id: string): string {
  if (id === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'
  return id in THEME_VARS ? id : 'default'
}

interface ThemeState {
  theme: string
  setTheme: (id: string) => void
  init: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  setTheme(id) {
    const resolved = resolveTheme(id)
    applyVars(THEME_VARS[resolved])
    saveTheme(id)
    set({ theme: id })
  },
  init() {
    const saved = loadTheme()
    const resolved = resolveTheme(saved)
    applyVars(THEME_VARS[resolved])
    set({ theme: saved })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (get().theme === 'system') {
        const r = resolveTheme('system')
        applyVars(THEME_VARS[r])
      }
    })
  },
}))
