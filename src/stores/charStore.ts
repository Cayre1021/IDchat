import { create } from 'zustand'
import type { Character } from '../types'
import { loadChars, saveChars, deleteMessages } from '../lib/storage'

interface CharState {
  chars: Character[]
  init: () => void
  add: (c: Character) => void
  update: (id: string, data: Partial<Character>) => void
  remove: (id: string) => void
}

export const useCharStore = create<CharState>((set) => ({
  chars: [],
  init() { set({ chars: loadChars() }) },
  add(c) {
    set((s) => {
      const chars = [c, ...s.chars]
      saveChars(chars)
      return { chars }
    })
  },
  update(id, data) {
    set((s) => {
      const chars = s.chars.map((c) => (c.id === id ? { ...c, ...data } : c))
      saveChars(chars)
      return { chars }
    })
  },
  remove(id) {
    set((s) => {
      const chars = s.chars.filter((c) => c.id !== id)
      saveChars(chars)
      return { chars }
    })
    deleteMessages(id)
  },
}))
