import { esc } from '../../lib/utils'

interface Props { language: string; code: string }

export default function CodeBlock({ language, code }: Props) {
  const copy = () => { navigator.clipboard?.writeText(code) }
  return (
    <div className="rounded-[10px] my-1.5 overflow-hidden text-[13px] leading-relaxed relative max-w-full" style={{ background: '#1e1e2e', color: '#cdd6f4' }}>
      <div className="flex items-center justify-between px-3 py-1.5 text-[11px]" style={{ background: 'rgba(0,0,0,.2)', color: '#888' }}>
        <span className="font-medium uppercase tracking-[0.5px]">{language || 'code'}</span>
        <button onClick={copy} className="bg-white/10 border-none text-[#aaa] px-2.5 py-0.5 rounded-md cursor-pointer text-[11px] active:bg-white/20 transition-colors flex-shrink-0">复制</button>
      </div>
      <pre className="m-0 px-3.5 py-2.5 pb-3 overflow-x-auto font-mono whitespace-pre max-w-full" style={{ scrollbarWidth: 'auto', scrollbarColor: '#8b8ba0 #2a2a3a' }}>
        <code className="font-mono text-inherit">{esc(code)}</code>
      </pre>
    </div>
  )
}
