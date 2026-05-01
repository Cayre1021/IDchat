import type { ApiConfig } from '../types'

export async function* streamChat(
  api: ApiConfig,
  model: string,
  messages: { role: string; content: string }[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  let body: string

  if (api.protocol === 'openai') {
    headers['Authorization'] = `Bearer ${api.key}`
    body = JSON.stringify({ model, messages, stream: true })
  } else {
    headers['x-api-key'] = api.key
    headers['anthropic-version'] = '2023-06-01'
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n')
    const other = messages.filter((m) => m.role !== 'system')
    body = JSON.stringify({ model, system: system || undefined, messages: other, stream: true, max_tokens: 4096 })
  }

  const res = await fetch(api.endpoint, { method: 'POST', headers, body, signal })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw { status: res.status, message: err }
  }

  const reader = res.body?.getReader()
  if (!reader) throw { status: 0, message: 'No response body' }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') return

      try {
        const json = JSON.parse(data)
        const delta = json.choices?.[0]?.delta
        if (api.protocol === 'openai') {
          if (delta?.content) yield delta.content
        } else {
          if (delta?.text) yield delta.text
          else if (json.type === 'content_block_delta' && json.delta?.text) yield json.delta.text
        }
      } catch { /* skip */ }
    }
  }
}
