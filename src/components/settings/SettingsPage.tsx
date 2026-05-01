import { useNavigate } from 'react-router-dom'
import Dexie from 'dexie'
import Header from '../layout/Header'
import { useApiStore } from '../../stores/apiStore'
import { useThemeStore } from '../../stores/themeStore'
import { useConfirmModal } from '../shared/ConfirmModal'
import { useToast } from '../shared/Toast'
import { useCharStore } from '../../stores/charStore'
import type { ReactNode } from 'react'

const THEME_NAMES: Record<string, string> = {
  system: '跟随系统', default: '默认蓝', dark: '暗夜黑', midnight: '午夜蓝',
  rose: '玫瑰粉', green: '薄荷绿', sunset: '日落橙',
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const apis = useApiStore((s) => s.apis)
  const theme = useThemeStore((s) => s.theme)
  const showConfirm = useConfirmModal((s) => s.show)
  const toast = useToast((s) => s.show)
  const { init: charInit } = useCharStore()
  const { init: apiInit } = useApiStore()
  const { init: themeInit, setTheme } = useThemeStore()

  const handleReset = () => {
    showConfirm({
      title: '重置所有数据', desc: '将删除所有 API 配置、角色和聊天记录。此操作不可撤销。', danger: true,
      onConfirm() {
        localStorage.clear()
        new Dexie('idchat').delete().then(() => { charInit(); apiInit(); setTheme('system'); themeInit() })
        toast('已重置'); navigate('/chat')
      },
    })
  }

  const handleExport = () => {
    const data = { apis: useApiStore.getState().apis, chars: useCharStore.getState().chars, theme: useThemeStore.getState().theme }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'idchat-backup.json'; a.click(); URL.revokeObjectURL(url)
    toast('已导出')
  }

  return (
    <>
      <Header title="设置" />
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-8" style={{ background: 'var(--bg)' }}>
        <Section label="API"><Row label="API 配置" value={apis.length ? `${apis.length} 组配置` : '未配置'} onClick={() => navigate('/settings/api')} /></Section>
        <Section label="外观"><Row label="主题" value={THEME_NAMES[theme] || '默认蓝'} onClick={() => navigate('/settings/theme')} /></Section>
        <Section label="数据"><Row label="导出备份" onClick={handleExport} /><Row label="重置所有数据" danger onClick={handleReset} /></Section>
        <Section label="关于"><Row label="版本" value="IDchat v1.0.6" /></Section>
      </div>
    </>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return <div><div className="text-[13px] font-semibold uppercase tracking-[0.4px] px-1 mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</div><div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)' }}>{children}</div></div>
}

function Row({ label, value, danger, onClick }: { label: string; value?: string; danger?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between px-4 py-[15px] border-b last:border-b-0 gap-3 transition-colors ${onClick ? 'cursor-pointer active:opacity-70' : ''}`} style={{ borderColor: 'var(--divider)' }}>
      <span className="text-[16px]" style={{ color: danger ? 'var(--danger)' : 'var(--text)' }}>{label}</span>
      <div className="flex items-center gap-1">
        {value && <span className="text-sm max-w-[140px] truncate" style={{ color: 'var(--text-secondary)' }}>{value}</span>}
        {onClick && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
      </div>
    </div>
  )
}
