export interface ApiConfig {
  id: string
  name: string
  protocol: 'openai' | 'anthropic'
  endpoint: string
  key: string
}

export interface Message {
  role: 'user' | 'ai'
  content: string
  image?: string
  time: string
  quoteRef?: { idx: number; role: string } | null
}

export interface Character {
  id: string
  name: string
  initial: string
  color: string
  preview: string
  time: string
  unread: number
  model: string
  apiId: string
  persona: string
  style: string
  multimodal: boolean
  pinned: boolean
  messages: Message[]
  quoteRef: { idx: number; role: string } | null
}

export interface AppData {
  apis: ApiConfig[]
  chars: Character[]
  theme: string
  onboardDone: boolean
}

export const AVATAR_COLORS = [
  '#3a8fd4', '#e8738a', '#4caf84', '#e8894f',
  '#9b59b6', '#3498db', '#1abc9c', '#e74c3c',
  '#f39c12', '#2ecc71',
]

export const MODELS = [
  { value: 'deepseek-chat', label: 'DeepSeek-V3' },
  { value: 'deepseek-reasoner', label: 'DeepSeek-R1' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
]

export const EMOJIS = [
  '😀','😂','🤣','😊','😍','🤔','😎','👍','👎','❤️',
  '🔥','🎉','💯','✨','🙏','😅','🤗','😢','😡','🤯',
  '🥳','💪','👀','🎯','✅','❌','⚠️','💡','🤖','🧠','📝','💻',
]
