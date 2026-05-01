import { useRef, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function PageShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [animClass, setAnimClass] = useState('page-enter')
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    // Determine if going "back" (shorter path) or "forward" (longer path)
    const prev = prevPath.current
    const curr = location.pathname
    const isBack = curr.length < prev.length || (curr === '/chat' && prev.startsWith('/chat/'))
    setAnimClass(isBack ? 'page-back' : 'page-enter')
    prevPath.current = curr
  }, [location.pathname])

  return <div className={`${animClass} flex-1 flex flex-col min-h-0`} key={location.pathname}>{children}</div>
}
