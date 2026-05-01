import { useLongPress } from '../../hooks/useLongPress'
import { renderFullMarkdown } from '../../lib/markdown'
import type { Message } from '../../types'

interface Props {
  msg: Message
  index: number
  isContinued: boolean
  charName: string
  charColor: string
  charInitial: string
  quotedMsg: Message | null
  onQuoteTap: () => void
  onContextMenu: (e: React.MouseEvent) => void
  onLongPressMenu: () => void
}

export default function MessageBubble({
  msg, index, isContinued, charName, charColor, charInitial,
  quotedMsg, onQuoteTap, onContextMenu, onLongPressMenu,
}: Props) {
  const isUser = msg.role === 'user'
  const lp = useLongPress(onLongPressMenu)

  return (
    <div data-msg-idx={index} className={`flex gap-1.5 max-w-[88%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
      {...lp} onContextMenu={onContextMenu}
    >
      {!isUser && (
        <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 self-end ${isContinued ? 'invisible' : ''}`}
          style={{ background: charColor }}>{charInitial}</div>
      )}
      <div>
        <div className={`px-[13px] py-[9px] rounded-[18px] text-[15px] leading-relaxed break-words cursor-pointer ${isUser ? 'rounded-br-[6px]' : 'rounded-bl-[6px] shadow-sm'}`}
          style={{ background: isUser ? 'var(--bubble-user)' : 'var(--bubble-ai)', color: isUser ? 'var(--bubble-user-text)' : 'var(--bubble-ai-text)' }}
        >
          {quotedMsg && (
            <div className="flex gap-1.5 mb-1.5 px-2 py-1.5 rounded-lg border-l-[3px] cursor-pointer active:opacity-70"
              style={{ background: 'rgba(0,0,0,.04)', borderLeftColor: 'var(--accent)' }}
              onClick={(e) => { e.stopPropagation(); onQuoteTap() }}
            >
              <div>
                <div className="text-[12px] font-semibold" style={{ color: 'var(--accent)' }}>{quotedMsg.role === 'user' ? '你' : charName}</div>
                <div className="text-[13px] truncate" style={{ color: 'var(--text-secondary)' }}>{quotedMsg.content.substring(0, 60)}</div>
              </div>
            </div>
          )}
          {msg.image && <img src={msg.image} alt="" className="max-w-[180px] max-h-[180px] rounded-xl mb-1 block" />}
          {renderFullMarkdown(msg.content)}
        </div>
        <div className="text-[11px] mt-0.5 px-1" style={{ color: 'var(--text-secondary)' }}>{msg.time}</div>
      </div>
    </div>
  )
}
