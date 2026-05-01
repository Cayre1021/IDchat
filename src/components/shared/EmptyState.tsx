import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  desc?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, desc, action }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center gap-2">
      <div className="w-[88px] h-[88px] mb-2 opacity-30 flex items-center justify-center">{icon}</div>
      <h3 className="text-[17px] font-semibold" style={{ color: 'var(--text)', letterSpacing: '-0.3px' }}>{title}</h3>
      {desc && <p className="text-sm leading-relaxed max-w-[260px]" style={{ color: 'var(--text-secondary)', letterSpacing: '-0.1px' }}>{desc}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-3 px-7 py-2.5 rounded-[10px] text-[15px] font-medium text-white active:opacity-80"
          style={{ background: 'var(--accent)' }}>{action.label}</button>
      )}
    </div>
  )
}
