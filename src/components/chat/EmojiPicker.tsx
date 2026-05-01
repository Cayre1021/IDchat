import { EMOJIS } from '../../types'

interface Props { visible: boolean; onSelect: (emoji: string) => void; onClose: () => void }

export default function EmojiPicker({ visible, onSelect, onClose }: Props) {
  if (!visible) return null
  return (
    <div className="absolute bottom-[58px] left-2.5 bg-[var(--surface)] rounded-[14px] shadow-lg p-2 z-20 w-[280px]" style={{ boxShadow: '0 8px 30px rgba(0,0,0,.18)' }}>
      <div className="flex justify-between items-center px-1.5 pb-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>表情</span>
        <button onClick={onClose} className="px-2 py-0.5 rounded-md border-none cursor-pointer text-xs" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>关闭</button>
      </div>
      <div className="grid grid-cols-8 gap-0.5">
        {EMOJIS.map((e) => <button key={e} onClick={() => onSelect(e)} className="w-8 h-8 border-none bg-transparent text-[18px] cursor-pointer rounded-lg flex items-center justify-center active:bg-[var(--input-bg)] transition-colors">{e}</button>)}
      </div>
    </div>
  )
}
