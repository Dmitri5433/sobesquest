import { useEffect, useState } from 'react'

/** Печатает строки кода посимвольно, зациклено */
export default function TypingCode({ lines }) {
  const [text, setText] = useState('')

  useEffect(() => {
    const full = lines.join('\n')
    let i = 0
    let timer
    const step = () => {
      i += 1
      setText(full.slice(0, i))
      if (i < full.length) {
        timer = setTimeout(step, 34)
      } else {
        timer = setTimeout(() => {
          i = 0
          setText('')
          step()
        }, 5200)
      }
    }
    timer = setTimeout(step, 600)
    return () => clearTimeout(timer)
  }, [lines])

  return (
    <pre className="hero-code">
      <code>{text}</code>
      <span className="type-cursor" />
    </pre>
  )
}
