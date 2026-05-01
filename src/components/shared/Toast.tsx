import { create } from 'zustand'

interface ToastState {
  message: string; visible: boolean; action?: { label: string; onClick: () => void }
  show: (msg: string, action?: { label: string; onClick: () => void }) => void
  hide: () => void
}

export const useToast = create<ToastState>((set) => ({
  message: '', visible: false,
  show(msg, action) { set({ message: msg, visible: true, action }); setTimeout(() => set({ visible: false, action: undefined }), action ? 5000 : 1800) },
  hide() { set({ visible: false, action: undefined }) },
}))

export default function Toast() {
  const { message, visible, action } = useToast()
  return (
    <div className={`fixed top-[60px] left-1/2 -translate-x-1/2 bg-black/80 text-white px-5 py-2.5 rounded-[20px] text-sm z-[1000] transition-opacity duration-300 whitespace-nowrap ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {message}
      {action && <button onClick={action.onClick} className="ml-2 underline underline-offset-2 font-medium">{action.label}</button>}
    </div>
  )
}
