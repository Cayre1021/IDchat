import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../layout/Header'
import { useCharStore } from '../../stores/charStore'
import { useApiStore } from '../../stores/apiStore'
import { useConfirmModal } from '../shared/ConfirmModal'
import { useToast } from '../shared/Toast'
import { AVATAR_COLORS, MODELS } from '../../types'
import { genId, getInitial, randomColor } from '../../lib/utils'

export default function CharacterEditPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { chars, add, update, remove } = useCharStore()
  const apis = useApiStore((s) => s.apis)
  const showConfirm = useConfirmModal((s) => s.show)
  const toast = useToast((s) => s.show)

  const existing = chars.find((c) => c.id === id)
  const [name, setName] = useState(existing?.name ?? '')
  const [color, setColor] = useState(existing?.color ?? randomColor())
  const [model, setModel] = useState(existing?.model ?? (() => {
    const boundApi = apis.find(a => a.id === (existing?.apiId || (apis.length > 0 ? apis[0].id : '')))
    return existing?.model || boundApi?.defaultModel || ''
  })())
  const [apiId, setApiId] = useState(existing?.apiId ?? (apis.length > 0 ? apis[0].id : ''))
  const [customModel, setCustomModel] = useState('')
  const [useCustomModel, setUseCustomModel] = useState(!MODELS.find(m => m.value === (existing?.model ?? '')) && !!existing?.model)
  const [persona, setPersona] = useState(existing?.persona ?? '')
  const [style, setStyle] = useState(existing?.style ?? '')
  const [multimodal, setMultimodal] = useState(existing?.multimodal ?? false)
  const [dirty, setDirty] = useState(false)

  const markDirty = () => { if (!dirty) setDirty(true) }

  // Auto-fill model from API when API binding changes
  useEffect(() => {
    if (!apiId) return
    const boundApi = apis.find(a => a.id === apiId)
    if (boundApi?.defaultModel) {
      const isPreset = MODELS.find(m => m.value === boundApi.defaultModel)
      if (isPreset) {
        setModel(boundApi.defaultModel)
        setUseCustomModel(false)
      } else {
        setCustomModel(boundApi.defaultModel)
        setUseCustomModel(true)
      }
    }
  }, [apiId])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const handleBack = () => {
    if (dirty) { toast('有未保存的修改') } else { navigate('/characters', { replace: true }) }
  }

  const effectiveModel = useCustomModel ? customModel.trim() : model

  const handleSave = () => {
    if (!name.trim()) { toast('请输入名字'); return }
    if (!effectiveModel) { toast('请选择或输入模型名称'); return }
    if (!apiId) { toast('请绑定 API'); return }
    const initial = getInitial(name.trim())
    if (isEdit && existing) {
      update(existing.id, { name: name.trim(), color, model: effectiveModel, apiId, persona: persona.trim(), style: style.trim(), multimodal, initial })
      toast('角色已更新')
    } else {
      add({ id: genId('c'), name: name.trim(), initial, color, preview: '', time: '', unread: 0, model: effectiveModel, apiId, persona: persona.trim(), style: style.trim(), multimodal, pinned: false, messages: [], quoteRef: null })
      toast('角色已创建')
    }
    setDirty(false)
    navigate('/characters', { replace: true })
  }

  const handleDelete = () => {
    if (!id) return
    showConfirm({ title: '删除角色', desc: '该角色及其聊天记录将被永久删除。', danger: true, onConfirm: () => { remove(id); navigate('/characters', { replace: true }) } })
  }

  return (
    <>
      <Header title={isEdit ? '编辑角色' : '创建角色'} backTo={handleBack} />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-[18px]" style={{ background: 'var(--bg)' }}>
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 py-3">
          <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-[36px] font-bold text-white border-[3px] shadow-md" style={{ background: color, borderColor: 'var(--card)' }}>{getInitial(name || 'A')}</div>
          <div className="flex gap-2 flex-wrap justify-center">
            {AVATAR_COLORS.map((c) => <div key={c} onClick={() => { setColor(c); markDirty() }} className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-colors ${c === color ? 'border-[var(--accent)]' : 'border-transparent'}`} style={{ background: c }} />)}
          </div>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>选择头像颜色</span>
        </div>

        <FG label="名字"><input value={name} onChange={(e) => { setName(e.target.value); markDirty() }} placeholder="给角色起个名字" className="w-full rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)]" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }} /></FG>

        <FG label="绑定 API" hint={apis.length === 0 ? '还没有配置 API，请先去设置中添加' : ''} hintWarn={apis.length === 0}>
          <select value={apiId} onChange={(e) => { setApiId(e.target.value); markDirty() }} className="w-full rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)] cursor-pointer appearance-none" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }}>
            <option value="">选择已配置的 API...</option>
            {apis.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.protocol === 'openai' ? 'OpenAI兼容' : 'Anthropic'})</option>)}
          </select>
        </FG>

        <FG label="模型" hint={useCustomModel ? '输入你的 API 支持的模型名称' : '选择预设或自定义'}>
          {!useCustomModel ? (
            <div className="flex gap-2">
              <select value={model} onChange={(e) => { const v = e.target.value; if (v === '__custom__') { setUseCustomModel(true); setCustomModel(''); markDirty() } else { setModel(v); markDirty() } }} className="flex-1 rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)] cursor-pointer appearance-none" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }}>
                <option value="">选择模型...</option>
                {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                <option value="__custom__">自定义模型名称...</option>
              </select>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={customModel} onChange={(e) => { setCustomModel(e.target.value); markDirty() }} placeholder="输入模型名称，如 deepseek-v3-0324" className="flex-1 rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)]" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }} />
              <button onClick={() => { setUseCustomModel(false); setModel(''); markDirty() }} className="px-3 py-2 rounded-[10px] border-none cursor-pointer text-[13px] active:opacity-70" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>↩</button>
            </div>
          )}
        </FG>

        <FG label="角色设定 — TA 是谁" hint="定义角色的身份和能力。AI 每次对话都会读取。">
          <textarea value={persona} onChange={(e) => { setPersona(e.target.value); markDirty() }} placeholder={'描述角色的身份、专业领域和知识范围。\n\n例：你是一位拥有10年经验的资深全栈工程师，精通 React、TypeScript 和系统架构设计。\n\n这段内容作为系统 Prompt 发送给 AI。'} className="w-full rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)] min-h-[80px] resize-y" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }} />
        </FG>

        <FG label="对话风格 — TA 怎么说" hint="定义角色说话的方式。与角色设定一起构成系统 Prompt。">
          <textarea value={style} onChange={(e) => { setStyle(e.target.value); markDirty() }} placeholder={'描述对话的语气、风格和回复习惯。\n\n例：用简洁直接的语言回复，优先给出可运行的代码示例。遇到复杂问题时先分析再给方案。\n\n这段内容也会作为系统 Prompt 发送给 AI。'} className="w-full rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--accent)] min-h-[80px] resize-y" style={{ background: 'var(--card)', borderColor: 'var(--divider)', color: 'var(--text)' }} />
        </FG>

        <div className="flex items-center justify-between px-4 py-[15px] rounded-xl" style={{ background: 'var(--card)' }} onClick={() => { setMultimodal(!multimodal); markDirty() }}>
          <span className="text-[16px]" style={{ color: 'var(--text)' }}>支持图片识别 <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>需模型支持</span></span>
          <div className={`w-[51px] h-[31px] rounded-[16px] cursor-pointer relative transition-colors flex-shrink-0 ${multimodal ? 'bg-[var(--online)]' : 'bg-[#e5e5ea]'}`}>
            <div className={`w-[27px] h-[27px] bg-white rounded-full absolute top-[2px] transition-transform shadow-md ${multimodal ? 'translate-x-5' : 'left-[2px]'}`} />
          </div>
        </div>

        <button onClick={handleSave} className="rounded-[10px] py-3.5 text-[16px] font-semibold text-white active:opacity-80" style={{ background: 'var(--accent)' }}>{isEdit ? '保存修改' : '保存角色'}</button>
        {isEdit && <button onClick={handleDelete} className="rounded-[10px] py-3 text-[15px] font-medium border active:bg-red-50" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>删除角色</button>}
      </div>
    </>
  )
}

function FG({ label, hint, hintWarn, children }: { label: string; hint?: string; hintWarn?: boolean; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold uppercase tracking-[0.3px] pl-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>{children}{hint && <span className="text-xs pl-1" style={{ color: hintWarn ? '#e8894f' : 'var(--text-secondary)' }}>{hint}</span>}</div>
}
