import { create } from 'zustand'
import type { Message } from '../types'
import { loadMessages, saveMessages } from '../lib/storage'

interface ChatState {
  activeCharId: string | null
  streaming: boolean
  abortController: AbortController | null
  quoteRef: { idx: number; role: string } | null
  msgCache: Record<string, Message[]>
  setActiveChar: (id: string | null) => void
  setStreaming: (v: boolean) => void
  setAbortController: (c: AbortController | null) => void
  setQuoteRef: (q: { idx: number; role: string } | null) => void
  getMessages: (charId: string) => Promise<Message[]>
  saveMessages: (charId: string, msgs: Message[]) => Promise<void>
  setCachedMessages: (charId: string, msgs: Message[]) => void
  preloadAll: (charIds: string[]) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeCharId: null,
  streaming: false,
  abortController: null,
  quoteRef: null,
  msgCache: {},
  setActiveChar(id) {
    const { abortController } = get()
    if (abortController) abortController.abort()
    set({ activeCharId: id, streaming: false, abortController: null, quoteRef: null })
  },
  setStreaming(v) { set({ streaming: v }) },
  setAbortController(c) { set({ abortController: c }) },
  setQuoteRef(q) { set({ quoteRef: q }) },
  async getMessages(charId) {
    const cached = get().msgCache[charId]
    if (cached) return cached
    const msgs = await loadMessages(charId)
    set((s) => ({ msgCache: { ...s.msgCache, [charId]: msgs } }))
    return msgs
  },
  async saveMessages(charId, msgs) {
    set((s) => ({ msgCache: { ...s.msgCache, [charId]: msgs } }))
    await saveMessages(charId, msgs)
  },
  setCachedMessages(charId, msgs) {
    set((s) => ({ msgCache: { ...s.msgCache, [charId]: msgs } }))
  },
  async preloadAll(charIds) {
    const { msgCache } = get()
    const toLoad = charIds.filter((id) => !msgCache[id])
    if (toLoad.length === 0) return
    const results = await Promise.all(toLoad.map((id) => loadMessages(id)))
    const updates: Record<string, Message[]> = {}
    toLoad.forEach((id, i) => { updates[id] = results[i] })
    set((s) => ({ msgCache: { ...s.msgCache, ...updates } }))
  },
}))
