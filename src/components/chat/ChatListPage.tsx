import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharStore } from '../../stores/charStore'
import { useContextMenu } from '../shared/ContextMenu'
import { useConfirmModal } from '../shared/ConfirmModal'
import { useToast } from '../shared/Toast'
import Header from '../layout/Header'
import EmptyState from '../shared/EmptyState'
import ChatRow from './ChatRow'
import type { Character } from '../../types'

export default function ChatListPage() {
  const navigate = useNavigate()
  const chars = useCharStore((s) => s.chars)
  const update = useCharStore((s) => s.update)
  const remove = useCharStore((s) => s.remove)
  const showCtx = useContextMenu((s) => s.show)
  const hideCtx = useContextMenu((s) => s.hide)
  const showConfirm = useConfirmModal((s) => s.show)
  const toast = useToast((s) => s.show)
  const [search, setSearch] = useState('')

  const sorted = [...chars].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))
  const filtered = search ? sorted.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.preview.toLowerCase().includes(search.toLowerCase())) : sorted

  const showMenu = (char: Character, x: number, y: number) => {
    showCtx([
      <div key="o" className="px-[18px] py-3 text-[15px] cursor-pointer border-b active:opacity-70" style={{ borderColor: 'var(--divider)', color: 'var(--text)' }} onClick={() => { hideCtx(); navigate(`/chat/${char.id}`) }}>打开对话</div>,
      <div key="p" className="px-[18px] py-3 text-[15px] cursor-pointer border-b active:opacity-70" style={{ borderColor: 'var(--divider)', color: 'var(--text)' }} onClick={() => { hideCtx(); update(char.id, { pinned: !char.pinned }); toast(char.pinned ? '已取消置顶' : '已置顶') }}>{char.pinned ? '取消置顶' : '置顶'}</div>,
      <div key="e" className="px-[18px] py-3 text-[15px] cursor-pointer border-b active:opacity-70" style={{ borderColor: 'var(--divider)', color: 'var(--text)' }} onClick={() => { hideCtx(); navigate(`/characters/${char.id}/edit`) }}>编辑</div>,
      <div key="d" className="px-[18px] py-3 text-[15px] cursor-pointer active:opacity-70" style={{ color: 'var(--danger)' }} onClick={() => { hideCtx(); showConfirm({ title: '删除角色', desc: '该角色及其聊天记录将被永久删除。', danger: true, onConfirm: () => remove(char.id) }) }}>删除</div>,
    ], x, y)
  }

  return (
    <>
      <Header title="IDchat" brand actions={
        <button onClick={() => navigate('/characters')} className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 active:bg-white/20 transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
        </button>
      } />
      <div className="px-4 py-2" style={{ background: 'var(--surface)' }}>
        <input className="w-full rounded-[10px] px-3 py-2 text-[15px] outline-none border-none" style={{ background: 'var(--input-bg)', color: 'var(--text)' }} placeholder="搜索" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
        {chars.length === 0 ? (
          <EmptyState icon={<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} title="还没有对话" desc="去「角色」页面创建 AI 角色，然后在这里开始聊天" action={{ label: '创建角色', onClick: () => navigate('/characters') }} />
        ) : filtered.map((char) => (
          <ChatRow key={char.id} char={char}
            onContextMenu={(e) => { e.preventDefault(); showMenu(char, e.clientX, e.clientY) }}
            onLongPress={() => showMenu(char, 100, 200)}
          />
        ))}
      </div>
    </>
  )
}
