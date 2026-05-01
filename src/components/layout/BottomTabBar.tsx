import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/chat', label: '聊天',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  },
  { path: '/characters', label: '角色',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
  },
  { path: '/settings', label: '设置',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  },
]

export default function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/chat') return location.pathname.startsWith('/chat')
    if (path === '/characters') return location.pathname.startsWith('/characters')
    if (path === '/settings') return location.pathname.startsWith('/settings')
    return false
  }

  const hideTabs = /^\/(chat\/|characters\/(new|.*\/edit)|settings\/(api|theme))/.test(location.pathname)

  if (hideTabs) return null

  return (
    <nav className="flex flex-shrink-0 border-t" style={{ background: 'var(--tab-bar)', borderColor: 'var(--divider)', paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}>
      {TABS.map((tab) => {
        const active = isActive(tab.path)
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center justify-center py-[6px] gap-[2px] transition-colors"
            style={{ color: active ? 'var(--accent)' : 'var(--tab-inactive)', opacity: active ? 1 : 0.8 }}
          >
            {tab.icon}
            <span className="text-[10px] font-medium" style={{ letterSpacing: '-0.1px' }}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
