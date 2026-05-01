export function esc(s: string): string {
  if (!s) return ''
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function fmtTime(d: Date): string {
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

export function genId(prefix: string): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase()
}

export function randomColor(): string {
  const colors = ['#3a8fd4','#e8738a','#4caf84','#e8894f','#9b59b6','#3498db']
  return colors[Math.floor(Math.random() * colors.length)]
}
