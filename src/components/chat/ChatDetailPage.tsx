import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCharStore } from '../../stores/charStore'
import { useApiStore } from '../../stores/apiStore'
import { useChatStore } from '../../stores/chatStore'
import { useToast } from '../shared/Toast'
import { useConfirmModal } from '../shared/ConfirmModal'
import { useContextMenu } from '../shared/ContextMenu'
import { useStreaming } from '../../hooks/useStreaming'
import { fmtTime } from '../../lib/utils'
import Header from '../layout/Header'
import TypingIndicator from './TypingIndicator'
import QuoteBar from './QuoteBar'
import InputBar from './InputBar'
import ForwardSheet from './ForwardSheet'
import MessageBubble from './MessageBubble'
import type { Message } from '../../types'

export default function ChatDetailPage() {
  const { characterId } = useParams<{ characterId: string }>()
  const navigate = useNavigate()
  const chars = useCharStore((s) => s.chars)
  const updateChar = useCharStore((s) => s.update)
  const apis = useApiStore((s) => s.apis)
  const { streaming, quoteRef, setQuoteRef, getMessages, saveMessages, setCachedMessages } = useChatStore()
  const toast = useToast((s) => s.show)
  const showConfirm = useConfirmModal((s) => s.show)
  const showCtx = useContextMenu((s) => s.show)
  const hideCtx = useContextMenu((s) => s.hide)
  const { error, start, stop } = useStreaming()

  const char = chars.find((c) => c.id === characterId)
  const [msgs, setMsgs] = useState<Message[]>(() => {
    if (!characterId) return []
    return useChatStore.getState().msgCache[characterId] || []
  })
  const [showEmoji, setShowEmoji] = useState(false)
  const [showForward, setShowForward] = useState(false)
  const [forwardIdx, setForwardIdx] = useState<number | null>(null)
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchIdx, setSearchIdx] = useState(-1)
  const [searchResults, setSearchResults] = useState<number[]>([])
  const msgContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollFab, setShowScrollFab] = useState(false)
  const inputRef = useRef<{ focus: () => void; setText: (t: string) => void }>(null)

  useEffect(() => {
    if (!char) { navigate('/chat'); return }
    const cached = useChatStore.getState().msgCache[char.id]
    if (cached) { setMsgs(cached) } else { getMessages(char.id).then(setMsgs) }
    setQuoteRef(char.quoteRef || null)
  }, [char?.id])

  const handleScroll = useCallback(() => {
    const el = msgContainerRef.current; if (!el) return
    setShowScrollFab(el.scrollHeight - el.scrollTop - el.clientHeight > 80)
  }, [])

  const scrollToBottom = () => {
    const el = msgContainerRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [msgs.length])

  useEffect(() => {
    if (char) { char.unread = 0; updateChar(char.id, { unread: 0 }) }
  }, [char?.id])

  const handleInsertEmoji = useCallback(() => { setShowEmoji(false) }, [])

  const handleSend = async (text: string) => {
    if (!char) return
    const api = apis.find((a) => a.id === char.apiId)
    if (!api) { toast('请先去设置页面配置 API 密钥'); return }

    const time = fmtTime(new Date())
    const userMsg: Message = { role: 'user', content: text, time }
    const currentQuoteRef = quoteRef
    if (currentQuoteRef) { userMsg.quoteRef = currentQuoteRef; setQuoteRef(null); updateChar(char.id, { quoteRef: null }) }

    const newMsgs = [...msgs, userMsg]
    setMsgs(newMsgs)
    updateChar(char.id, { preview: text.substring(0, 50), time })
    saveMessages(char.id, newMsgs)

    const apiMsgs: { role: string; content: string }[] = [
      { role: 'system', content: `${char.persona || '你是一个有帮助的AI助手'}。\n\n对话风格：${char.style || '正常对话'}` },
    ]
    newMsgs.slice(-20).forEach((m) => apiMsgs.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))

    const aiTime = fmtTime(new Date())
    const aiMsg: Message = { role: 'ai', content: '', time: aiTime }
    setMsgs((prev) => [...prev, aiMsg])

    const full = await start(api, char.model, apiMsgs, (fullText) => {
      setMsgs((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.role === 'ai') updated[updated.length - 1] = { ...last, content: fullText }
        return updated
      })
      scrollToBottom()
    })

    if (full || error) {
      setMsgs((prev) => {
        const updated = [...prev]
        const lastIdx = updated.length - 1
        if (updated[lastIdx]?.role === 'ai') {
          let finalContent: string
          if (full) {
            finalContent = full
          } else {
            const err = error!
            finalContent = '⚠️ ' + (err.status === 401 ? 'API Key 无效，请去设置更新'
              : err.status === 429 ? '请求太频繁，请稍候再试'
              : err.status === 404 ? '模型不可用，请检查角色配置'
              : err.status >= 500 ? '服务暂时不可用'
              : '网络连接超时，请检查网络后重试')
          }
          updated[lastIdx] = { ...updated[lastIdx], content: finalContent, time: fmtTime(new Date()) }
        }
        if (full) updateChar(char.id, { preview: full.substring(0, 50), time: fmtTime(new Date()) })
        else if (error) toast(updated[updated.length - 1].content.replace('⚠️ ', ''))
        saveMessages(char.id, updated)
        return updated
      })
    }
  }

  const handleStop = () => { stop() }

  const handleQuote = (idx: number) => {
    if (!char || !msgs[idx]) return
    const ref = { idx, role: msgs[idx].role }
    setQuoteRef(ref); updateChar(char.id, { quoteRef: ref }); hideCtx()
  }

  const handleDelete = (idx: number) => {
    hideCtx()
    showConfirm({
      title: '删除消息', desc: '确定要删除这条消息吗？',
      onConfirm: () => {
        setMsgs((prev) => {
          const filtered = prev.filter((_, i) => i !== idx)
          if (quoteRef?.idx === idx) setQuoteRef(null)
          else if (quoteRef && quoteRef.idx > idx) setQuoteRef({ ...quoteRef, idx: quoteRef.idx - 1 })
          filtered.forEach((m) => { if (m.quoteRef?.idx === idx) m.quoteRef = null; else if (m.quoteRef && m.quoteRef.idx > idx) m.quoteRef.idx-- })
          updateChar(char?.id || '', { preview: filtered.length ? filtered[filtered.length - 1].content.substring(0, 50) : '' })
          saveMessages(char?.id || '', filtered)
          return filtered
        })
      },
    })
  }

  const handleForwardSelect = (targetId: string) => {
    if (forwardIdx === null || !char || !msgs[forwardIdx]) return
    const text = msgs[forwardIdx].content
    setShowForward(false)
    navigate(`/chat/${targetId}?forward=${encodeURIComponent(text)}`)
  }

  // Check for forwarded text in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
    const fwd = params.get('forward')
    if (fwd) {
      const txt = decodeURIComponent(fwd)
      const clean = window.location.hash.replace(/[?&]forward=[^&]*/, '').replace(/\?$/, '')
      window.history.replaceState(null, '', clean || '/')
      // Delay to ensure InputBar ref is mounted
      const t = setTimeout(() => { inputRef.current?.setText(txt) }, 100)
      return () => clearTimeout(t)
    }
  }, [characterId])

  const handleCopy = (idx: number) => { if (msgs[idx]) { navigator.clipboard?.writeText(msgs[idx].content); toast('已复制') }; hideCtx() }

  const showMsgMenu = (idx: number, x: number, y: number) => {
    showCtx([
      <div key="cp" className="px-[18px] py-3 text-[15px] cursor-pointer border-b active:opacity-70" style={{ borderColor: 'var(--divider)', color: 'var(--text)' }} onClick={() => handleCopy(idx)}>复制</div>,
      <div key="qt" className="px-[18px] py-3 text-[15px] cursor-pointer border-b active:opacity-70" style={{ borderColor: 'var(--divider)', color: 'var(--text)' }} onClick={() => handleQuote(idx)}>引用</div>,
      <div key="dl" className="px-[18px] py-3 text-[15px] cursor-pointer border-b active:opacity-70" style={{ borderColor: 'var(--divider)', color: 'var(--text)' }} onClick={() => handleDelete(idx)}>删除</div>,
      <div key="fw" className="px-[18px] py-3 text-[15px] cursor-pointer active:opacity-70" style={{ color: 'var(--text)' }} onClick={() => { hideCtx(); setForwardIdx(idx); setShowForward(true) }}>转发</div>,
    ], x, y)
  }

  const handleSearch = (q: string) => {
    setSearchQ(q)
    if (!q) { setSearchResults([]); setSearchIdx(-1); return }
    const results: number[] = []
    msgs.forEach((m, i) => { if (m.content.toLowerCase().includes(q.toLowerCase())) results.push(i) })
    setSearchResults(results); setSearchIdx(results.length > 0 ? 0 : -1)
  }

  const scrollToMsg = (idx: number) => {
    const el = msgContainerRef.current; if (!el) return
    const target = el.querySelector(`[data-msg-idx="${idx}"]`) as HTMLElement; if (!target) return
    el.scrollTo({ top: target.offsetTop - el.clientHeight / 2 + target.offsetHeight / 2, behavior: 'smooth' })
  }

  const scrollToQuoted = () => {
    if (!quoteRef) return
    scrollToMsg(quoteRef.idx)
    const target = msgContainerRef.current?.querySelector(`[data-msg-idx="${quoteRef.idx}"]`)
    if (target) { target.classList.add('ring-2', 'ring-yellow-400'); setTimeout(() => target.classList.remove('ring-2', 'ring-yellow-400'), 1600) }
  }

  const clearChat = () => {
    if (!char) return
    setMsgs([]); setQuoteRef(null)
    updateChar(char.id, { preview: '', time: '', quoteRef: null }); saveMessages(char.id, [])
    toast('已清空')
  }

  if (!char) return null

  return (
    <>
      <Header title={char.name} subtitle={char.model} backTo={() => navigate('/chat')}
        avatar={<div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0" style={{ background: char.color }}>{char.initial}</div>}
        actions={<>
          <button onClick={() => setSearchVisible(!searchVisible)} className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 active:bg-white/20 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button onClick={() => showConfirm({ title: '清空对话', desc: '当前对话记录将被清除。', onConfirm: clearChat })} className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 active:bg-white/20 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </>}
      />
      {searchVisible && (
        <div className="flex items-center gap-2 px-3.5 py-1.5 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--divider)' }}>
          <input value={searchQ} onChange={(e) => handleSearch(e.target.value)} placeholder="搜索对话..." className="flex-1 rounded-lg px-2.5 py-1.5 text-sm outline-none border-none" style={{ background: 'var(--input-bg)', color: 'var(--text)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{searchResults.length ? `${searchIdx + 1}/${searchResults.length}` : searchQ ? '无结果' : ''}</span>
          <button onClick={() => { if (searchIdx > 0) { const i = searchIdx - 1; setSearchIdx(i); scrollToMsg(searchResults[i]) } }} className="w-[26px] h-[26px] rounded-full border-none cursor-pointer text-[13px] flex items-center justify-center" style={{ background: 'var(--input-bg)', color: 'var(--text)' }}>↑</button>
          <button onClick={() => { if (searchIdx < searchResults.length - 1) { const i = searchIdx + 1; setSearchIdx(i); scrollToMsg(searchResults[i]) } }} className="w-[26px] h-[26px] rounded-full border-none cursor-pointer text-[13px] flex items-center justify-center" style={{ background: 'var(--input-bg)', color: 'var(--text)' }}>↓</button>
          <button onClick={() => { setSearchVisible(false); setSearchQ(''); setSearchResults([]); setSearchIdx(-1) }} className="bg-transparent border-none cursor-pointer text-[16px] px-1" style={{ color: 'var(--text-secondary)' }}>✕</button>
        </div>
      )}

      <div ref={msgContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-2.5 flex flex-col gap-1 relative" style={{ background: 'var(--bg)' }}>
        {msgs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 px-8 py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-[26px] font-semibold text-white mb-2" style={{ background: char.color }}>{char.initial}</div>
            <h3 className="text-[17px] font-semibold" style={{ color: 'var(--text)' }}>{char.name}</h3>
            <p className="text-sm leading-relaxed max-w-[260px]" style={{ color: 'var(--text-secondary)' }}>{char.persona.substring(0, 100)}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>发送第一条消息</p>
          </div>
        ) : (
          <>
            {msgs.map((m, i) => {
              const prevWasAi = i > 0 && msgs[i - 1].role === 'ai'
              const isContinued = m.role === 'ai' && prevWasAi
              const qRef = m.quoteRef
              const quotedMsg = qRef && qRef.idx !== undefined && msgs[qRef.idx] ? msgs[qRef.idx] : null
              return (
                <MessageBubble key={i} msg={m} index={i} isContinued={isContinued}
                  charName={char.name} charColor={char.color} charInitial={char.initial}
                  quotedMsg={quotedMsg}
                  onQuoteTap={() => qRef && scrollToMsg(qRef.idx)}
                  onContextMenu={(e) => { e.preventDefault(); showMsgMenu(i, e.clientX, e.clientY) }}
                  onLongPressMenu={() => {
                    const el = msgContainerRef.current?.querySelector(`[data-msg-idx="${i}"]`)
                    const rect = el?.getBoundingClientRect()
                    showMsgMenu(i, rect?.left || 100, (rect?.bottom || 200))
                  }}
                />
              )
            })}
            {streaming && <TypingIndicator />}
          </>
        )}
        {showScrollFab && (
          <button onClick={scrollToBottom} className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-[var(--surface)] shadow-md flex items-center justify-center cursor-pointer z-5 border-none" style={{ color: 'var(--text-secondary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        )}
      </div>

      <QuoteBar who={quoteRef?.role === 'user' ? '你' : char.name} what={quoteRef && msgs[quoteRef.idx] ? msgs[quoteRef.idx].content.substring(0, 80) : ''}
        visible={!!quoteRef} onTap={scrollToQuoted}
        onClose={() => { setQuoteRef(null); updateChar(char.id, { quoteRef: null }) }} />

      <InputBar ref={inputRef} streaming={streaming} onSend={handleSend} onStop={handleStop}
        onEmojiToggle={() => setShowEmoji(!showEmoji)}
        showEmoji={showEmoji} onEmojiSelect={handleInsertEmoji} />

      <ForwardSheet visible={showForward} chars={chars} currentCharId={char.id} onSelect={handleForwardSelect} onClose={() => setShowForward(false)} />
    </>
  )
}
