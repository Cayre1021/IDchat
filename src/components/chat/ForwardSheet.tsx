import type { Character } from '../../types'

interface Props { visible: boolean; chars: Character[]; currentCharId: string; onSelect: (charId: string) => void; onClose: () => void }

export default function ForwardSheet({ visible, chars, currentCharId, onSelect, onClose }: Props) {
  if (!visible) return null
  const others = chars.filter((c) => c.id !== currentCharId)
  return (
    <>
      <div className="absolute inset-0 bg-black/40 z-[29] transition-opacity" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-[var(--surface)] rounded-t-2xl z-30 max-h-[60%] flex flex-col shadow-lg" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,.15)' }}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--divider)' }}>
          <span className="text-[16px] font-semibold" style={{ color: 'var(--text)' }}>转发给</span>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-full border-none cursor-pointer text-[16px] flex items-center justify-center" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>✕</button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {others.length === 0 ? (
            <div className="p-5 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>没有其他角色可以转发</div>
          ) : others.map((c) => (
            <div key={c.id} onClick={() => onSelect(c.id)} className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-[var(--input-bg)] transition-colors">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-[18px] font-semibold text-white" style={{ background: c.color }}>{c.initial}</div>
              <span className="text-[16px] font-medium" style={{ color: 'var(--text)' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
