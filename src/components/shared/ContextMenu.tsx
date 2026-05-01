import { create } from 'zustand'
import type { ReactNode } from 'react'

interface CtxState {
  items: ReactNode[]; x: number; y: number; visible: boolean
  show: (items: ReactNode[], x: number, y: number) => void
  hide: () => void
}

export const useContextMenu = create<CtxState>((set) => ({
  items: [], x: 0, y: 0, visible: false,
  show(items, x, y) { set({ items, x: Math.min(x, window.innerWidth - 160), y: Math.min(y, window.innerHeight - 200), visible: true }) },
  hide() { set({ visible: false }) },
}))

export default function ContextMenu() {
  const { items, x, y, visible, hide } = useContextMenu()
  if (!visible) return null
  return (
    <>
      <div className="fixed inset-0 z-[998]" onClick={hide} onContextMenu={(e) => { e.preventDefault(); hide() }} />
      <div className="fixed rounded-xl shadow-lg z-[999] overflow-hidden min-w-[150px]" style={{ left: x, top: y, background: 'var(--surface)', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
        {items}
      </div>
    </>
  )
}
