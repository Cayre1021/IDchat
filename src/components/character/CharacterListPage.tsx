import { useNavigate } from 'react-router-dom'
import { useCharStore } from '../../stores/charStore'
import { useApiStore } from '../../stores/apiStore'
import { useContextMenu } from '../shared/ContextMenu'
import { useConfirmModal } from '../shared/ConfirmModal'
import Header from '../layout/Header'
import EmptyState from '../shared/EmptyState'
import CharacterCard from './CharacterCard'
import type { Character } from '../../types'

export default function CharacterListPage() {
  const navigate = useNavigate()
  const chars = useCharStore((s) => s.chars)
  const apis = useApiStore((s) => s.apis)
  const remove = useCharStore((s) => s.remove)
  const showCtx = useContextMenu((s) => s.show)
  const hideCtx = useContextMenu((s) => s.hide)
  const showConfirm = useConfirmModal((s) => s.show)

  const apiName = (apiId: string) => apis.find((a) => a.id === apiId)?.name ?? ''

  const showMenu = (char: Character, x: number, y: number) => {
    showCtx([
      <div key="chat" className="px-[18px] py-3 text-[15px] cursor-pointer border-b active:opacity-70" style={{ borderColor: 'var(--divider)', color: 'var(--text)' }} onClick={() => { hideCtx(); navigate(`/chat/${char.id}`) }}>开始聊天</div>,
      <div key="edit" className="px-[18px] py-3 text-[15px] cursor-pointer border-b active:opacity-70" style={{ borderColor: 'var(--divider)', color: 'var(--text)' }} onClick={() => { hideCtx(); navigate(`/characters/${char.id}/edit`) }}>编辑</div>,
      <div key="del" className="px-[18px] py-3 text-[15px] cursor-pointer active:opacity-70" style={{ color: 'var(--danger)' }} onClick={() => { hideCtx(); showConfirm({ title: '删除角色', desc: '该角色及其聊天记录将被永久删除。', danger: true, onConfirm: () => remove(char.id) }) }}>删除</div>,
    ], x, y)
  }

  return (
    <>
      <Header title="AI 角色" actions={
        <button onClick={() => navigate('/characters/new')} className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 active:bg-white/20 transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      } />
      <div className="flex-1 overflow-y-auto p-3" style={{ background: 'var(--bg)' }}>
        {chars.length === 0 ? (
          <EmptyState icon={<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>} title="还没有角色" desc="创建 AI 角色，设定独特的身份和对话风格" action={{ label: '创建角色', onClick: () => navigate('/characters/new') }} />
        ) : chars.map((char) => (
          <CharacterCard key={char.id} char={char} apiName={apiName(char.apiId)} onContextMenu={(e) => { e.preventDefault(); showMenu(char, e.clientX, e.clientY) }} />
        ))}
      </div>
    </>
  )
}
