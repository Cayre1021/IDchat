import type { ReactNode } from 'react'

interface Props {
  title?: string; subtitle?: string; brand?: boolean; backTo?: () => void; actions?: ReactNode; avatar?: ReactNode
}

export default function Header({ title, subtitle, brand, backTo, actions, avatar }: Props) {
  return (
    <header className="flex items-center gap-2 flex-shrink-0 min-h-[52px] px-4" style={{ background: 'var(--header)', color: 'var(--header-text)', paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      {backTo && (
        <button onClick={backTo} className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 active:bg-white/20 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {avatar}
      <div className="flex-1 min-w-0">
        <div className={`font-semibold truncate ${brand ? 'font-serif text-[20px]' : 'text-[17px]'}`} style={{ letterSpacing: '-0.3px' }}>{title}</div>
        {subtitle && <div className="text-[12px] opacity-70" style={{ letterSpacing: '-0.1px' }}>{subtitle}</div>}
      </div>
      {actions}
    </header>
  )
}
