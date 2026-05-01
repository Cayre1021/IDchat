import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

let prevDepth = 0

function pathDepth(p: string): number {
  return p.split('/').filter(Boolean).length
}

export default function PageShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [animClass, setAnimClass] = useState('page-enter')

  useEffect(() => {
    const curr = pathDepth(location.pathname)
    // Going back: current path is shorter, OR leaving a chat detail page
    const isBack = curr < prevDepth || (location.pathname === '/chat' && prevDepth > 1)
    setAnimClass(isBack ? 'page-back' : 'page-enter')
    prevDepth = curr
  }, [location.pathname])

  // Reset animation on each navigation by remounting the inner div
  return <div className={`${animClass} flex-1 flex flex-col min-h-0`} key={location.pathname}>{children}</div>
}
