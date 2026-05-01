import { create } from 'zustand'
import type { ApiConfig } from '../types'
import { loadApis, saveApis } from '../lib/storage'
import { genId } from '../lib/utils'

interface ApiState {
  apis: ApiConfig[]
  init: () => void
  add: (api: Omit<ApiConfig, 'id'>) => void
  update: (id: string, data: Omit<ApiConfig, 'id'>) => void
  remove: (id: string) => void
}

export const useApiStore = create<ApiState>((set) => ({
  apis: [],
  init() { set({ apis: loadApis() }) },
  add(api) {
    set((s) => {
      const apis = [...s.apis, { ...api, id: genId('a') }]
      saveApis(apis)
      return { apis }
    })
  },
  update(id, data) {
    set((s) => {
      const apis = s.apis.map((a) => (a.id === id ? { ...a, ...data } : a))
      saveApis(apis)
      return { apis }
    })
  },
  remove(id) {
    set((s) => {
      const apis = s.apis.filter((a) => a.id !== id)
      saveApis(apis)
      return { apis }
    })
  },
}))
