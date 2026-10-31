/**
 * Строгий логотип компании: монограмма (первая буква названия)
 * в квадрате фирменного цвета — вместо эмодзи.
 */
export default function CompanyLogo({ name, color = '#8b5cf6', big = false }) {
  const letter = (name || '?').trim()[0]?.toUpperCase() || '?'
  return (
    <span
      className={`company-logo monogram ${big ? 'big' : ''}`}
      style={{ background: `${color}1f`, color, borderColor: `${color}55` }}
      aria-hidden="true"
    >
      {letter}
    </span>
  )
}
