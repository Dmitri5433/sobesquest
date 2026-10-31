import { Link } from 'react-router-dom'
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '../lib/i18n'
import { LEVELS, COMPLETION_THRESHOLD } from '../lib/progression'

export default function LevelCard({ levelId, progress, unlocked }) {
  const { t } = useI18n()
  const level = LEVELS[levelId]
  const percent = progress.total === 0 ? 0 : Math.round((progress.solved / progress.total) * 100)
  const completed = progress.total > 0 && percent >= COMPLETION_THRESHOLD * 100
  const required = Math.ceil(progress.total * COMPLETION_THRESHOLD)

  return (
    <motion.div
      className={`level-card ${unlocked ? '' : 'locked'}`}
      style={{ '--level-color': level.color }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="level-head">
        <span className="level-badge">{level.name}</span>
        {completed ? (
          <span className="level-status done"><CheckCircle2 size={14} /> {t('level.done')}</span>
        ) : unlocked ? (
          <span className="level-status">{percent}%</span>
        ) : (
          <span className="level-status locked-status"><Lock size={13} /> {t('level.closed')}</span>
        )}
      </div>
      <p className="level-desc">{t(`levels.${levelId}.desc`)}</p>

      <div className="level-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
        <span className="progress-caption">
          {unlocked
            ? t('level.tasksProgress', { solved: progress.solved, total: progress.total })
            : t('level.needUnlock', { required, total: progress.total, level: LEVELS[levelId].name })}
        </span>
      </div>

      <div className="level-actions">
        <Link
          to={`/tasks?level=${levelId}`}
          className={`btn btn-sm ${unlocked ? 'btn-outline' : 'btn-ghost'}`}
          aria-disabled={!unlocked}
        >
          {unlocked ? t('level.tasksBtn') : <><Lock size={14} /> {t('level.tasksBtn')}</>}
        </Link>
        <Link
          to={`/interview?level=${levelId}`}
          className={`btn btn-sm ${unlocked ? 'btn-primary' : 'btn-ghost'}`}
          aria-disabled={!unlocked}
        >
          {unlocked ? <>{t('level.interviewBtn')} <ArrowRight size={14} /></> : <><Lock size={14} /> {t('level.interviewBtn')}</>}
        </Link>
      </div>

      {!unlocked && (
        <div className="level-lock-hint">
          <Lock size={12} /> {t('level.unlockHint', { required })}
        </div>
      )}
    </motion.div>
  )
}
