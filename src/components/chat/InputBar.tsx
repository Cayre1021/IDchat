import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import EmojiPicker from './EmojiPicker'

interface Props {
  streaming: boolean
  onSend: (text: string) => void
  onStop: () => void
  onEmojiToggle: () => void
  showEmoji: boolean
  onEmojiSelect: (emoji: string) => void
}

const InputBar = forwardRef<{ focus: () => void; setText: (t: string) => void }, Props>(
  function InputBar({ streaming, onSend, onStop, onEmojiToggle, showEmoji, onEmojiSelect }, ref) {
    const [text, setText] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      setText: (t: string) => { setText(t); setTimeout(() => { if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px' } }, 50) },
    }))

    const handleSend = () => {
      if (streaming) { onStop(); return }
      const t = text.trim(); if (!t) return
      onSend(t); setText('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }

    const handleKey = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    const handleEmoji = (emoji: string) => {
      const ta = textareaRef.current; if (!ta) return
      const start = ta.selectionStart, end = ta.selectionEnd
      const before = text.substring(0, start), after = text.substring(end)
      const newText = before + emoji + after
      setText(newText)
      onEmojiSelect(emoji)
      setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + emoji.length }, 0)
    }

    return (
      <div className="flex items-end gap-1.5 px-2.5 py-2 border-t flex-shrink-0 relative" style={{ background: 'var(--surface)', borderColor: 'var(--divider)', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        <EmojiPicker visible={showEmoji} onSelect={handleEmoji} onClose={onEmojiToggle} />
        <button onClick={onEmojiToggle} className="w-9 h-9 rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer flex-shrink-0 active:scale-90 transition-transform" style={{ color: 'var(--text-secondary)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        </button>
        <textarea ref={textareaRef} rows={1} value={text}
          onChange={(e) => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px' }}
          onKeyDown={handleKey} placeholder="消息"
          className="flex-1 border rounded-[20px] px-3.5 py-[9px] text-[15px] outline-none resize-none font-sans max-h-[100px] leading-relaxed"
          style={{ borderColor: 'var(--divider)', background: 'var(--input-bg)', color: 'var(--text)' }}
        />
        <button onClick={handleSend}
          className={`w-9 h-9 rounded-full border-none flex items-center justify-center cursor-pointer flex-shrink-0 active:scale-90 transition-transform ${streaming ? 'bg-[var(--danger)]' : ''}`}
          style={!streaming ? { background: 'var(--accent)', color: '#fff' } : { color: '#fff' }}
        >
          {streaming ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          )}
        </button>
      </div>
    )
  }
)

export default InputBar
