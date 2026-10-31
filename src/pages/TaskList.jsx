import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Lock, Coins } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { buildProgress, LEVEL_IDS, LEVELS } from '../lib/progression'
import { useI18n } from '../lib/i18n'
import { SetupNotice } from '../components/Guards'

export default function TaskList() {
  const { t } = useI18n()
  const { solvedIds } = useAuth()
  const [tasks, setTasks] = useState(null)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()
  const activeLevel = searchParams.get('level')

  useEffect(() => {
    if (!hasSupabase) return
    supabase
      .from('tasks')
      .select('*')
      .eq('is_published', true)
      .order('id')
      .then(({ data, error: dbError }) => {
        if (dbError) setError(dbError.message)
        else setTasks(data || [])
      })
  }, [])

  const progress = useMemo(
    () => (tasks ? buildProgress(tasks, solvedIds) : null),
    [tasks, solvedIds]
  )

  if (!hasSupabase) return <SetupNotice />
  if (error) return <div className="setup-notice"><h2>{t('tasks.loadError')}</h2><p>{error}</p></div>
  if (!progress) return <div className="page-loading"><span className="spinner" /> {t('tasks.loading')}</div>

  return (
    <div className="tasks-page">
      <div className="page-head">
        <h1>{t('tasks.title')}</h1>
        <p>{t('tasks.sub')}</p>
      </div>

      {LEVEL_IDS.map((levelId) => {
        const level = LEVELS[levelId]
        const levelProgress = progress.byLevel[levelId]
        const unlocked = progress.unlocked[levelId]
        const list = tasks.filter((task) => task.level === levelId)
        const highlighted = activeLevel === levelId

        return (
          <section
            key={levelId}
            className={`level-section ${highlighted ? 'highlighted' : ''}`}
            style={{ '--level-color': level.color }}
          >
            <div className="level-section-head">
              <span className="level-badge">{level.name}</span>
              <span className="level-section-caption">
                {unlocked
                  ? t('tasks.solvedCaption', { solved: levelProgress.solved, total: levelProgress.total })
                  : t('tasks.lockedCaption', { required: progress.requiredToComplete(levelId) })}
              </span>
            </div>

            {unlocked ? (
              <div className="task-grid">
                {list.map((task) => {
                  const solved = solvedIds.has(task.id)
                  return (
                    <Link to={`/tasks/${task.id}`} key={task.id} className={`task-card ${solved ? 'solved' : ''}`}>
                      <div className="task-card-head">
                        <span className="task-title">{task.title}</span>
                        {solved && <CheckCircle2 size={17} className="solved-icon" />}
                      </div>
                      <div className="task-card-meta">
                        <span className="task-xp"><Coins size={13} /> {task.xp} XP</span>
                        <span className="task-test-count">
                          {task.test_code
                            ? t('task.scenarioCheck')
                            : t('task.testsCount', { n: task.tests?.length ?? 0 })}
                        </span>
                      </div>
                    </Link>
                  )
                })}
                {list.length === 0 && <div className="empty-hint">{t('tasks.empty')}</div>}
              </div>
            ) : (
              <div className="level-locked-banner">
                <Lock size={18} />
                <span>
                  {t('tasks.lockedBanner', {
                    required: progress.requiredToComplete('junior'),
                    andMiddle: levelId === 'senior' ? t('tasks.andMiddle') : '',
                  })}
                </span>
                <Link to="/tasks?level=junior" className="btn btn-sm btn-outline">{t('tasks.toJunior')}</Link>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
