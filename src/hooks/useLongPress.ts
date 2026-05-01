import { useCallback, useRef } from 'react'

export function useLongPress(callback: () => void, ms = 500) {
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const moved = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    moved.current = false
    e.preventDefault() // Immediately block browser text selection
    timer.current = setTimeout(() => { if (!moved.current) callback() }, ms)
  }, [callback, ms])

  const onTouchMove = useCallback(() => { moved.current = true; clearTimeout(timer.current) }, [])
  const onTouchEnd = useCallback(() => { clearTimeout(timer.current) }, [])
  const onTouchCancel = useCallback(() => { clearTimeout(timer.current) }, [])

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel }
}
