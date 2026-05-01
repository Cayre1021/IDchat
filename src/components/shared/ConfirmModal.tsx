import { create } from 'zustand'

interface ModalState {
  title: string; desc: string; visible: boolean; confirmLabel?: string; danger?: boolean; onConfirm?: () => void
  show: (opts: { title: string; desc: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void }) => void
  hide: () => void
}

export const useConfirmModal = create<ModalState>((set) => ({
  title: '', desc: '', visible: false,
  show(opts) { set({ ...opts, visible: true }) },
  hide() { set({ visible: false }) },
}))

export default function ConfirmModal() {
  const { title, desc, visible, confirmLabel, danger, hide, onConfirm } = useConfirmModal()

  const handleConfirm = () => { hide(); onConfirm?.() }

  return (
    <div className={`absolute inset-0 bg-black/45 z-[100] flex items-center justify-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={hide}>
      <div className="rounded-2xl p-5 w-[calc(100%-48px)] max-w-[300px] text-center shadow-xl" style={{ background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <div className="text-[17px] font-semibold mb-2" style={{ color: 'var(--text)', letterSpacing: '-0.3px' }}>{title}</div>
        {desc ? <div className="text-sm mb-5 leading-relaxed text-left" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: desc }} /> : null}
        <div className="flex gap-2.5">
          <button onClick={hide} className="flex-1 py-2.5 rounded-[10px] text-[15px] font-medium active:opacity-80" style={{ background: 'var(--input-bg)', color: 'var(--text)' }}>取消</button>
          <button onClick={handleConfirm} className={`flex-1 py-2.5 rounded-[10px] text-[15px] font-medium text-white active:opacity-80 ${danger ? 'bg-[var(--danger)]' : ''}`} style={!danger ? { background: 'var(--accent)' } : undefined}>{confirmLabel || '确定'}</button>
        </div>
      </div>
    </div>
  )
}
