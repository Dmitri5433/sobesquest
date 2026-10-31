import { useEffect, useRef, useState } from 'react'
import { Timer as TimerIcon } from 'lucide-react'

const format = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Timer({ seconds, onExpire, running = true, label = 'Время на задачу' }) {
  const [left, setLeft] = useState(seconds)
  const expireRef = useRef(onExpire)
  expireRef.current = onExpire

  useEffect(() => {
    setLeft(seconds)
  }, [seconds])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          expireRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, seconds])

  return (
    <div className={`timer ${left <= 60 ? 'timer-warn' : ''}`}>
      <TimerIcon size={16} />
      <span>{label}:</span>
      <strong>{format(left)}</strong>
    </div>
  )
}
