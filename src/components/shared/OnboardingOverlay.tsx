import { useNavigate } from 'react-router-dom'
import { useApiStore } from '../../stores/apiStore'
import { useCharStore } from '../../stores/charStore'
import { loadOnboardDone, saveOnboardDone } from '../../lib/storage'
import { useState, useEffect } from 'react'

export default function OnboardingOverlay() {
  const navigate = useNavigate()
  const apis = useApiStore((s) => s.apis)
  const chars = useCharStore((s) => s.chars)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const done = loadOnboardDone()
    if (!done && apis.length === 0 && chars.length === 0) {
      setVisible(true)
    } else if (apis.length > 0 && chars.length > 0 && !done) {
      // Auto-complete if both are configured
      saveOnboardDone()
    }
  }, [apis.length, chars.length])

  if (!visible) return null

  const hasApi = apis.length > 0
  const hasChar = chars.length > 0

  const handleStart = () => {
    saveOnboardDone()
    setVisible(false)
    if (!hasApi) {
      navigate('/settings/api/new')
    } else if (!hasChar) {
      navigate('/characters/new')
    } else {
      navigate('/chat')
    }
  }

  const handleSkip = () => {
    saveOnboardDone()
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-8 gap-5 transition-all duration-300"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-[18px] font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.3px' }}>欢迎使用 IDchat</div>
      <div className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>开始之前，请完成两步设置</div>

      <div className={`flex gap-3.5 items-start p-4 rounded-[14px] w-full max-w-[320px] border-2 transition-all ${hasApi ? 'border-[var(--online)] opacity-70' : ''}`}
        style={{ background: 'var(--surface)', borderColor: hasApi ? 'var(--online)' : 'var(--divider)' }}
      >
        <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: hasApi ? 'var(--online)' : 'var(--accent)' }}>1</div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>配置 API 密钥</div>
          <div className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>添加 DeepSeek、OpenAI 或 Anthropic 的 API</div>
        </div>
      </div>

      <div className={`flex gap-3.5 items-start p-4 rounded-[14px] w-full max-w-[320px] border-2 transition-all ${hasChar ? 'border-[var(--online)] opacity-70' : ''}`}
        style={{ background: 'var(--surface)', borderColor: hasChar ? 'var(--online)' : 'var(--divider)' }}
      >
        <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: hasChar ? 'var(--online)' : 'var(--accent)' }}>2</div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>创建 AI 角色</div>
          <div className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>设定角色的身份、专业领域和对话风格</div>
        </div>
      </div>

      <button onClick={handleStart} className="w-full max-w-[320px] rounded-[10px] py-3.5 text-[16px] font-semibold text-white active:opacity-80"
        style={{ background: 'var(--accent)' }}
      >
        开始设置
      </button>
      <div onClick={handleSkip} className="text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
        跳过，先看看
      </div>
    </div>
  )
}
