import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../layout/Header'
import { useApiStore } from '../../stores/apiStore'
import { useConfirmModal } from '../shared/ConfirmModal'
import { useToast } from '../shared/Toast'
import { useCharStore } from '../../stores/charStore'

export default function ApiEditPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { apis, add, update } = useApiStore()
  const chars = useCharStore((s) => s.chars)
  const showConfirm = useConfirmModal((s) => s.show)
  const toast = useToast((s) => s.show)

  const existing = apis.find((a) => a.id === id)
  const [name, setName] = useState(existing?.name ?? '')
  const [protocol, setProtocol] = useState<'openai' | 'anthropic'>(existing?.protocol ?? 'openai')
  const [endpoint, setEndpoint] = useState(existing?.endpoint ?? 'https://api.deepseek.com/v1/chat/completions')
  const [key, setKey] = useState(existing?.key ?? '')
  const [defaultModel, setDefaultModel] = useState(existing?.defaultModel ?? 'deepseek-chat')

  useEffect(() => {
    if (protocol === 'openai' && endpoint.includes('anthropic')) setEndpoint('https://api.deepseek.com/v1/chat/completions')
    else if (protocol === 'anthropic' && (endpoint.includes('deepseek') || endpoint.includes('openai'))) setEndpoint('https://api.anthropic.com/v1/messages')
  }, [protocol, endpoint])

  const handleSave = () => {
    if (!name.trim()) { toast('请输入名称'); return }
    if (!endpoint.trim()) { toast('请输入端点'); return }
    if (!key.trim()) { toast('请输入 Key'); return }
    const data = { name: name.trim(), protocol, endpoint: endpoint.trim(), key: key.trim(), defaultModel: defaultModel.trim() || 'deepseek-chat' }
    if (isEdit) { update(id!, data); toast('已更新') } else { add(data); toast('已添加') }
    setTimeout(() => navigate('/settings/api'), 0)
  }

  const handleDelete = () => {
    if (!id) return
    const affected = chars.filter((c) => c.apiId === id)
    let desc = '此操作不可撤销。'
    if (affected.length > 0) desc += `<div class="text-[12px] mt-1.5 p-2 rounded-lg leading-relaxed" style="color:var(--danger);background:var(--bg)">受影响角色：${affected.map((c) => c.name).join('、')}</div>`
    showConfirm({ title: '删除 API 配置', desc, danger: true, onConfirm: () => { useApiStore.getState().remove(id); navigate('/settings/api') } })
  }

  return (
    <>
      <Header title={isEdit ? '编辑 API 配置' : '添加 API 配置'} backTo={() => navigate('/settings/api')} />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-[18px]" style={{ background: 'var(--bg)' }}>
        <FG label="配置名称"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：我的 DeepSeek" className="w-full rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)]" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }} /></FG>
        <FG label="协议" hint={protocol === 'openai' ? '适用于 DeepSeek、OpenAI 及兼容服务' : '适用于 Claude 系列模型'}>
          <select value={protocol} onChange={(e) => setProtocol(e.target.value as 'openai' | 'anthropic')} className="w-full rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)] cursor-pointer appearance-none" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }}>
            <option value="openai">OpenAI 兼容协议</option><option value="anthropic">Anthropic 兼容协议</option>
          </select>
        </FG>
        <FG label="端点 URL"><input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="w-full rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)]" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }} /></FG>
        <FG label="默认模型" hint="例：deepseek-chat、gpt-4o、claude-sonnet-4-6"><input value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)} placeholder="输入模型名称" className="w-full rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)]" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }} /></FG>
        <FG label="API Key" hint="密钥仅存储在浏览器本地"><input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-..." className="w-full rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)]" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }} /></FG>
        <button onClick={handleSave} className="rounded-[10px] py-3.5 text-[16px] font-semibold text-white active:opacity-80" style={{ background: 'var(--accent)' }}>保存配置</button>
        {isEdit && <button onClick={handleDelete} className="rounded-[10px] py-3 text-[15px] font-medium border active:bg-red-50" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>删除配置</button>}
      </div>
    </>
  )
}

function FG({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold uppercase tracking-[0.3px] pl-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>{children}{hint && <span className="text-xs pl-1" style={{ color: 'var(--text-secondary)' }}>{hint}</span>}</div>
}
