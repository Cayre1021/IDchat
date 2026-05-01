interface Props { who: string; what: string; visible: boolean; onTap: () => void; onClose: () => void }

export default function QuoteBar({ who, what, visible, onTap, onClose }: Props) {
  if (!visible) return null
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-b cursor-pointer active:opacity-70 transition-opacity" style={{ background: 'var(--quote-bar-bg)', borderColor: 'var(--divider)' }} onClick={onTap}>
      <div className="w-[3px] h-8 rounded-sm flex-shrink-0" style={{ background: 'var(--accent)' }} />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold" style={{ color: 'var(--accent)' }}>{who}</div>
        <div className="text-[13px] truncate" style={{ color: 'var(--text-secondary)' }}>{what}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onClose() }} className="w-6 h-6 rounded-full border-none bg-transparent cursor-pointer flex items-center justify-center text-[16px] active:bg-[var(--divider)] transition-colors" style={{ color: 'var(--text-secondary)' }}>✕</button>
    </div>
  )
}
