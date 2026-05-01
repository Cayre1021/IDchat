export default function TypingIndicator() {
  return (
    <div className="flex gap-1 px-3.5 py-2.5 self-start items-center">
      <div className="w-[7px] h-[7px] rounded-full animate-bounce" style={{ background: 'var(--text-secondary)', animationDelay: '0s' }} />
      <div className="w-[7px] h-[7px] rounded-full animate-bounce" style={{ background: 'var(--text-secondary)', animationDelay: '0.16s' }} />
      <div className="w-[7px] h-[7px] rounded-full animate-bounce" style={{ background: 'var(--text-secondary)', animationDelay: '0.32s' }} />
    </div>
  )
}
