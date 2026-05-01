import { esc } from './utils'
import CodeBlock from '../components/chat/CodeBlock'
import MdTable from '../components/chat/MdTable'

export function formatMsg(text: string): string {
  if (!text) return ''

  const blocks: { lang: string; code: string }[] = []

  // 1. Extract fenced code blocks
  let html = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = blocks.length
    blocks.push({ lang: lang || '', code: code.replace(/^\n+|\n+$/g, '') })
    return `%%CODEBLOCK_${idx}%%`
  })

  // 2. Escape HTML
  html = esc(html)

  // 3. Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // 4. Bold / Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<span class="font-semibold">$1</span>')
  html = html.replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>')

  // 5. Tables
  html = html.replace(/((?:\|.+\|\n?)+)/g, (match) => {
    const lines = match.trim().split('\n')
    if (lines.length < 2) return match
    if (!/^\|[\s\-:]+\|/.test(lines[1])) return match
    const headers = lines[0].split('|').filter((c) => c.trim() !== '')
    const rows: string[][] = []
    for (let i = 2; i < lines.length; i++) {
      const cells = lines[i].split('|').filter((c) => c.trim() !== '')
      if (cells.length > 0) rows.push(cells)
    }
    return `%%TABLE_${btoa(JSON.stringify({ headers, rows }))}%%`
  })

  // 6. Restore code blocks
  html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_, idx) => {
    const b = blocks[parseInt(idx)]
    if (!b) return ''
    return `%%CODEPLACEHOLDER_${idx}%%`
  })

  // 7. Line breaks
  html = html.replace(/\n/g, '<br>')

  return html
}

// Render formatMsg output (which contains placeholders) into actual React nodes
export function renderMarkdown(html: string): React.ReactNode[] {
  if (!html) return []

  const nodes: React.ReactNode[] = []
  const parts = html.split(/(%%CODEPLACEHOLDER_\d+%%|%%TABLE_[A-Za-z0-9+/=]+%%)/)

  parts.forEach((part, i) => {
    if (part.startsWith('%%CODEPLACEHOLDER_')) {
      // Code blocks are handled separately via the blocks array in formatMsg
      // For inline rendering, we use the placeholder
      nodes.push(<span key={i} className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>[代码块]</span>)
    } else if (part.startsWith('%%TABLE_')) {
      try {
        const json = atob(part.replace('%%TABLE_', '').replace('%%', ''))
        const { headers, rows } = JSON.parse(json)
        nodes.push(<MdTable key={i} headers={headers} rows={rows} />)
      } catch { nodes.push(<span key={i} dangerouslySetInnerHTML={{ __html: part }} />) }
    } else if (part) {
      nodes.push(<span key={i} dangerouslySetInnerHTML={{ __html: part }} />)
    }
  })

  return nodes.length > 0 ? nodes : [<span key="0">{html}</span>]
}

// Full markdown to React component tree (used for message bubbles)
export function renderFullMarkdown(text: string): React.ReactNode {
  if (!text) return null

  const blocks: { lang: string; code: string }[] = []

  // Extract code blocks
  let processed = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = blocks.length
    blocks.push({ lang: lang || '', code: code.replace(/^\n+|\n+$/g, '') })
    return `\x00CODE${idx}\x00`
  })

  // Extract tables
  const tableData: { headers: string[]; rows: string[][] }[] = []
  processed = processed.replace(/((?:\|.+\|\n?)+)/g, (match) => {
    const lines = match.trim().split('\n')
    if (lines.length < 2 || !/^\|[\s\-:]+\|/.test(lines[1])) return match
    const headers = lines[0].split('|').filter((c) => c.trim() !== '')
    const rows: string[][] = []
    for (let i = 2; i < lines.length; i++) {
      const cells = lines[i].split('|').filter((c) => c.trim() !== '')
      if (cells.length > 0) rows.push(cells)
    }
    const idx = tableData.length
    tableData.push({ headers, rows })
    return `\x00TABLE${idx}\x00`
  })

  // Split and render
  const parts = processed.split(/(\x00CODE\d+\x00|\x00TABLE\d+\x00)/)
  const elements: React.ReactNode[] = []

  parts.forEach((part, i) => {
    const codeMatch = part.match(/^\x00CODE(\d+)\x00$/)
    const tableMatch = part.match(/^\x00TABLE(\d+)\x00$/)
    if (codeMatch) {
      const b = blocks[parseInt(codeMatch[1])]
      if (b) elements.push(<CodeBlock key={i} language={b.lang} code={b.code} />)
    } else if (tableMatch) {
      const t = tableData[parseInt(tableMatch[1])]
      if (t) elements.push(<MdTable key={i} headers={t.headers} rows={t.rows} />)
    } else if (part) {
      let html = esc(part)
      html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      html = html.replace(/\*\*([^*]+)\*\*/g, '<span class="font-semibold">$1</span>')
      html = html.replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>')
      html = html.replace(/\n/g, '<br>')
      elements.push(<span key={i} dangerouslySetInnerHTML={{ __html: html }} />)
    }
  })

  return <>{elements}</>
}
