import { motion } from 'framer-motion'
import { useI18n } from '../lib/i18n'
import { dayKey } from '../lib/streak'

/**
 * Теплокарта активности: последние 10 недель, колонки — недели.
 * @param {{ activeDays: Set<string> }} props — множество ключей 'YYYY-MM-DD'
 */
export default function ActivityHeatmap({ activeDays }) {
  const { t, locale } = useI18n()
  const weeks = []
  const days = []

  // Собираем 10 недель, начиная с понедельника 10 недель назад
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const dow = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(monday.getDate() - dow - 63) // понедельник 9 недель назад

  for (let w = 0; w < 10; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + w * 7 + d)
      const key = dayKey(date)
      week.push({ key, active: activeDays.has(key), future: date > today })
    }
    weeks.push(week)
  }

  return (
    <div className="heatmap-wrap">
      <div className="heatmap" role="img" aria-label={t('profile.heatmap')}>
        {weeks.map((week, wi) => (
          <div className="heatmap-col" key={wi}>
            {week.map(({ key, active, future }) => (
              <motion.span
                key={key}
                className={`heatmap-cell ${active ? 'on' : ''} ${future ? 'future' : ''}`}
                title={`${new Date(`${key}T12:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}${active ? ' · ' + t('profile.activeToday') : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(wi * 0.03, 0.6) }}
              />
            ))}
          </div>
        ))}
      </div>
      <span className="heatmap-caption">{t('profile.heatmap')}</span>
    </div>
  )
}
