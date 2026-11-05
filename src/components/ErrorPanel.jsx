import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useI18n } from '../lib/i18n'

/** Ошибка загрузки с кнопкой «Повторить» */
export default function ErrorPanel({ message, onRetry }) {
  const { t } = useI18n()
  return (
    <div className="setup-notice">
      <AlertTriangle size={28} />
      <h2>{t('error.title')}</h2>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          <RotateCcw size={15} /> {t('error.retry')}
        </button>
      )}
    </div>
  )
}
