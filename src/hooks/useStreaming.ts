import { useState, useCallback } from 'react'
import { streamChat } from '../lib/api-client'
import type { ApiConfig } from '../types'
import { useChatStore } from '../stores/chatStore'

export function useStreaming() {
  const [error, setError] = useState<{ status: number; message: string } | null>(null)
  const { setStreaming, setAbortController } = useChatStore()

  const start = useCallback(async (
    api: ApiConfig, model: string, messages: { role: string; content: string }[],
    onChunk: (fullText: string) => void,
  ): Promise<string> => {
    const ac = new AbortController()
    setAbortController(ac)
    setStreaming(true)
    setError(null)

    try {
      let full = ''
      for await (const chunk of streamChat(api, model, messages, ac.signal)) {
        full += chunk
        onChunk(full)
      }
      setStreaming(false)
      setAbortController(null)
      return full
    } catch (e: unknown) {
      setStreaming(false)
      setAbortController(null)
      const err = e as { status?: number; message?: string }
      if (err?.status) setError({ status: err.status, message: err.message || '' })
      return ''
    }
  }, [setStreaming, setAbortController])

  const stop = useCallback(() => {
    const ac = useChatStore.getState().abortController
    ac?.abort()
  }, [])

  return { error, start, stop }
}
