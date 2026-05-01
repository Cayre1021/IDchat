import { useNavigate } from 'react-router-dom'
import Header from '../layout/Header'
import { useApiStore } from '../../stores/apiStore'
import { useConfirmModal } from '../shared/ConfirmModal'
import { useCharStore } from '../../stores/charStore'
import EmptyState from '../shared/EmptyState'

export default function ApiListPage() {
  const navigate = useNavigate()
  const apis = useApiStore((s) => s.apis)
  const chars = useCharStore((s) => s.chars)
  const remove = useApiStore((s) => s.remove)
  const showConfirm = useConfirmModal((s) => s.show)

  const handleDelete = (id: string) => {
    const affected = chars.filter((c) => c.apiId === id)
    let desc = '此操作不可撤销。'
    if (affected.length > 0) desc += `<div class="text-[12px] mt-1.5 p-2 rounded-lg leading-relaxed" style="color:var(--danger);background:var(--bg)">受影响角色：${affected.map((c) => c.name).join('、')}</div>`
    showConfirm({ title: '删除 API 配置', desc, danger: true, onConfirm: () => remove(id) })
  }

  return (
    <>
      <Header title="API 配置" backTo={() => navigate('/settings')} actions={
        <button onClick={() => navigate('/settings/api/new')} className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 active:bg-white/20 transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      } />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5" style={{ background: 'var(--bg)' }}>
        {apis.length === 0 ? (
          <EmptyState icon={<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>} title="还没有 API 配置" desc="添加 API 密钥，AI 角色才能工作" action={{ label: '添加配置', onClick: () => navigate('/settings/api/new') }} />
        ) : apis.map((api) => (
          <div key={api.id} className="rounded-xl p-3.5 border" style={{ background: 'var(--surface)', borderColor: 'var(--divider)' }}>
            <div className="text-[16px] font-semibold" style={{ color: 'var(--text)' }}>{api.name}</div>
            <div className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{api.protocol === 'openai' ? 'OpenAI 兼容' : 'Anthropic 兼容'} · 模型: {api.defaultModel || '未设置'} · {api.endpoint.substring(0, 30)}... · Key: {api.key.substring(0, 14)}...</div>
            <div className="flex gap-2 mt-2.5">
              <button onClick={() => navigate(`/settings/api/${api.id}/edit`)} className="px-3.5 py-1.5 rounded-lg text-[13px] active:opacity-70" style={{ background: 'var(--input-bg)', color: 'var(--text)' }}>编辑</button>
              <button onClick={() => handleDelete(api.id)} className="px-3.5 py-1.5 rounded-lg text-[13px] active:opacity-70" style={{ background: '#fde8e8', color: 'var(--danger)' }}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
