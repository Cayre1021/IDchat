import { create } from 'zustand'
import type { Message } from '../types'
import { loadMessages, saveMessages } from '../lib/storage'

interface ChatState {
  activeCharId: string | null
  streaming: boolean
  abortController: AbortController | null
  quoteRef: { idx: number; role: string } | null
  setActiveChar: (id: string | null) => void
  setStreaming: (v: boolean) => void
  setAbortController: (c: AbortController | null) => void
  setQuoteRef: (q: { idx: number; role: string } | null) => void
  getMessages: (charId: string) => Promise<Message[]>
  saveMessages: (charId: string, msgs: Message[]) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeCharId: null,
  streaming: false,
  abortController: null,
  quoteRef: null,
  setActiveChar(id) {
    const { abortController } = get()
    if (abortController) abortController.abort()
    set({ activeCharId: id, streaming: false, abortController: null, quoteRef: null })
  },
  setStreaming(v) { set({ streaming: v }) },
  setAbortController(c) { set({ abortController: c }) },
  setQuoteRef(q) { set({ quoteRef: q }) },
  async getMessages(charId) { return loadMessages(charId) },
  async saveMessages(charId, msgs) { await saveMessages(charId, msgs) },
}))
