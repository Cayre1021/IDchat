import Dexie, { type Table } from 'dexie'
import type { ApiConfig, Character, Message } from '../types'

class IDchatDB extends Dexie {
  messages!: Table<{ charId: string; data: Message[] }>

  constructor() {
    super('idchat')
    this.version(1).stores({ messages: 'charId' })
  }
}

const db = new IDchatDB()

function lsGet<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback }
  catch { return fallback }
}
function lsSet(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true }
  catch { return false }
}

export function loadApis(): ApiConfig[] { return lsGet<ApiConfig[]>('idchat_apis', []) }
export function saveApis(apis: ApiConfig[]): boolean { return lsSet('idchat_apis', apis) }

export function loadChars(): Character[] { return lsGet<Character[]>('idchat_chars', []) }
export function saveChars(chars: Character[]): boolean { return lsSet('idchat_chars', chars) }

export async function loadMessages(charId: string): Promise<Message[]> {
  const row = await db.messages.get(charId)
  return row?.data ?? []
}
export async function saveMessages(charId: string, msgs: Message[]): Promise<void> {
  await db.messages.put({ charId, data: msgs })
}
export async function deleteMessages(charId: string): Promise<void> {
  await db.messages.delete(charId)
}

export function loadTheme(): string { return lsGet<string>('idchat_theme', 'system') }
export function saveTheme(theme: string): boolean { return lsSet('idchat_theme', theme) }

export function loadOnboardDone(): boolean { return lsGet<boolean>('idchat_onboarded', false) }
export function saveOnboardDone(): boolean { return lsSet('idchat_onboarded', true) }
