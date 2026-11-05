import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { buildProgress, LEVELS } from '../lib/progression'
import { useI18n } from '../lib/i18n'
import ErrorPanel from '../components/ErrorPanel'

export default function Stats() {
  const { t, locale } = useI18n()
  const { user, solvedIds } = useAuth()
  const [runs, setRuns] = useState(null)
  const [tasks, setTasks] = useState(null)
  const [error, setError] = useState(null)

  const load = () => {
    if (!hasSupabase || !user) return
    setError(null)
    supabase
      .from('interview_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: dbError }) => {
        if (dbError) setError(dbError.message)
        else setRuns(data || [])
      })
    supabase.from('tasks').select('*').eq('is_published', true).then(({ data }) => setTasks(data || []))
  }

  useEffect(load, [user?.id])

  const progress = useMemo(
    () => (tasks ? buildProgress(tasks, solvedIds) : null),
    [tasks, solvedIds]
  )

  if (error) return <ErrorPanel message={error} onRetry={load} />
  if (!progress || runs === null) {
    return <div className="page-loading"><span className="spinner" /> {t('loading')}</div>
  }

  const bestScore = runs.length ? Math.max(...runs.map((r) => r.score)) : 0
  const avgScore = runs.length ? Math.round(runs.reduce((s, r) => s + r.score, 0) / runs.length) : 0

  return (
    <div className="stats-page">
      <div className="page-head">
        <h1>{t('stats.title')}</h1>
        <p>{t('stats.sub')}</p>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <b>{runs.length}</b><span>{t('stats.interviews')}</span>
        </div>
        <div className="stat-card">
          <b>{bestScore}</b><span>{t('stats.best')}</span>
        </div>
        <div className="stat-card">
          <b>{avgScore}</b><span>{t('stats.avg')}</span>
        </div>
        <div className="stat-card">
          <b>{progress.solvedTotal}</b><span>{t('stats.tasks')}</span>
        </div>
      </div>

      <div className="panel">
        <h3>{t('stats.byLevel')}</h3>
        <div className="stats-levels">
          {Object.entries(progress.byLevel).map(([levelId, p]) => (
            <div key={levelId} className="report-part" style={{ '--level-color': LEVELS[levelId].color }}>
              <span>{LEVELS[levelId].name}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${p.total ? (p.solved / p.total) * 100 : 0}%` }} />
              </div>
              <b>{p.solved} / {p.total}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>{t('stats.history')}</h3>
        {runs.length === 0 ? (
          <div className="empty-hint">{t('stats.empty')}</div>
        ) : (
          <div className="table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>{t('stats.thDate')}</th>
                  <th>{t('stats.thDirection')}</th>
                  <th>{t('stats.thLevel')}</th>
                  <th>{t('stats.thResult')}</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td>{new Date(run.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</td>
                    <td>{run.company_slug || t('stats.general')}</td>
                    <td>{LEVELS[run.level]?.name || run.level}</td>
                    <td>
                      <span className={`score-pill ${run.score >= 70 ? 'good' : run.score >= 40 ? 'mid' : 'bad'}`}>
                        {run.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
