import { useNavigate } from 'react-router-dom'
import Header from '../layout/Header'
import { useThemeStore } from '../../stores/themeStore'

const THEMES = [
  { id: 'system', name: '跟随系统', isSystem: true } as const,
  { id: 'default', name: '默认蓝', header: '#3a8fd4', body: '#f0f2f5', u: '#e3f2fd', a: '#fff' },
  { id: 'dark', name: '暗夜黑', header: '#1c1c1e', body: '#1c1c1e', u: '#3a8fd4', a: '#2c2c2e' },
  { id: 'midnight', name: '午夜蓝', header: '#1b2838', body: '#0d1b2a', u: '#415a77', a: '#1b2838' },
  { id: 'rose', name: '玫瑰粉', header: '#e8738a', body: '#fdf2f4', u: '#fde2e7', a: '#fff' },
  { id: 'green', name: '薄荷绿', header: '#4caf84', body: '#f0f7f4', u: '#dff5e8', a: '#fff' },
  { id: 'sunset', name: '日落橙', header: '#e8894f', body: '#fff8f5', u: '#fde8db', a: '#fff' },
]

export default function ThemePage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useThemeStore()

  return (
    <>
      <Header title="主题" backTo={() => navigate('/settings')} />
      <div className="flex-1 overflow-y-auto px-4 py-5" style={{ background: 'var(--bg)' }}>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((t) => (
            <div key={t.id} onClick={() => setTheme(t.id)} className={`rounded-[14px] overflow-hidden cursor-pointer border-[3px] transition-all active:scale-[0.97] ${theme === t.id ? 'border-[var(--accent)]' : 'border-transparent'}`}>
              {'isSystem' in t ? (
                <div className="flex flex-col items-center justify-center p-5 gap-2" style={{ background: 'var(--surface)' }}>
                  <div className="flex gap-1"><div className="w-10 h-[60px] rounded-lg border border-gray-300" style={{ background: '#f0f2f5' }} /><div className="w-10 h-[60px] rounded-lg border border-gray-700" style={{ background: '#1c1c1e' }} /></div>
                  <div className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{t.name}</div>
                </div>
              ) : (
                <>
                  <div className="h-7 flex items-center px-2 text-[10px] font-semibold text-white" style={{ background: t.header }}>{t.name}</div>
                  <div className="p-2 flex flex-col gap-1.5" style={{ background: t.body }}>
                    <div className="px-2 py-1.5 rounded-[10px] text-[10px] self-end max-w-[80%]" style={{ background: t.u, color: t.id === 'dark' || t.id === 'midnight' ? '#fff' : '#1a1a1a' }}>你好</div>
                    <div className="px-2 py-1.5 rounded-[10px] text-[10px] self-start max-w-[80%]" style={{ background: t.a, color: t.id === 'dark' || t.id === 'midnight' ? '#fff' : '#1a1a1a' }}>说吧</div>
                  </div>
                  <div className="text-center py-2 text-[13px] font-medium" style={{ background: 'var(--surface)', color: 'var(--text)' }}>{t.name}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
