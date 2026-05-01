import { useNavigate } from 'react-router-dom'
import { useLongPress } from '../../hooks/useLongPress'
import type { Character } from '../../types'

interface Props {
  char: Character
  onContextMenu: (e: React.MouseEvent) => void
  onLongPress: () => void
}

export default function ChatRow({ char, onContextMenu, onLongPress }: Props) {
  const navigate = useNavigate()
  const lp = useLongPress(onLongPress)

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b transition-colors active:opacity-70" style={{ background: char.pinned ? 'var(--input-bg)' : 'var(--surface)', borderColor: 'var(--divider)' }}
      onClick={() => navigate(`/chat/${char.id}`)} onContextMenu={onContextMenu} {...lp}
    >
      {char.pinned && <div className="absolute top-1.5 right-2.5 text-[10px] opacity-40" style={{ color: 'var(--text-secondary)' }}>📌</div>}
      <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[20px] font-semibold text-white flex-shrink-0" style={{ background: char.color }}>{char.initial}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-medium leading-tight" style={{ color: 'var(--text)' }}>{char.name}</div>
        <div className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{char.preview || '开始新对话'}</div>
      </div>
      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{char.time}</div>
        {char.unread > 0 && <div className="text-[11px] font-semibold text-white min-w-[20px] h-5 leading-5 rounded-[10px] text-center px-1.5" style={{ background: 'var(--accent)' }}>{char.unread}</div>}
      </div>
    </div>
  )
}
