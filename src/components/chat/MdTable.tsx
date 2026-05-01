interface Props { headers: string[]; rows: string[][] }

export default function MdTable({ headers, rows }: Props) {
  return (
    <div className="overflow-x-auto my-1.5 rounded-lg border max-w-full" style={{ borderColor: 'var(--divider)', scrollbarWidth: 'auto', scrollbarColor: '#909098 var(--divider)' }}>
      <table className="border-collapse w-full text-[13px] leading-relaxed min-w-full">
        <thead>
          <tr>{headers.map((h, i) => <th key={i} className={`px-2.5 py-2 text-left font-semibold text-[12px] text-white whitespace-nowrap ${i === 0 ? 'rounded-tl-lg' : ''} ${i === headers.length - 1 ? 'rounded-tr-lg' : ''}`} style={{ background: 'var(--accent)' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? '' : ''} style={{ background: ri % 2 === 0 ? 'transparent' : 'var(--input-bg)' }}>
              {row.map((cell, ci) => <td key={ci} className="px-2.5 py-[7px] border-b last:border-b-0 whitespace-nowrap" style={{ borderColor: 'var(--divider)', color: 'var(--text)' }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
