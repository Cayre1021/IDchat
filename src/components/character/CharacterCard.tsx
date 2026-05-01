import { useNavigate } from 'react-router-dom'
import type { Character } from '../../types'

interface Props {
  char: Character
  apiName: string
  onContextMenu: (e: React.MouseEvent) => void
}

export default function CharacterCard({ char, apiName, onContextMenu }: Props) {
  const navigate = useNavigate()
  return (
    <div className="rounded-xl p-3.5 mb-2.5 flex items-center gap-3 cursor-pointer border relative active:scale-[0.98] transition-transform" style={{ background: 'var(--surface)', borderColor: 'var(--divider)' }}
      onClick={() => navigate(`/chat/${char.id}`)} onContextMenu={onContextMenu}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-[20px] font-semibold text-white flex-shrink-0" style={{ background: char.color }}>{char.initial}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-semibold" style={{ color: 'var(--text)' }}>{char.name}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{char.model} · {apiName || '未绑定 API'}</div>
        <div className="text-[13px] mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>{char.persona.substring(0, 50)}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); navigate(`/characters/${char.id}/edit`) }}
        className="absolute top-2.5 right-[42px] w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer active:bg-[var(--divider)] transition-colors"
        style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }} title="编辑"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  )
}
