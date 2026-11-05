import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessagesSquare, ArrowRight } from 'lucide-react'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { useI18n } from '../lib/i18n'
import { LEVELS } from '../lib/progression'
import { SetupNotice } from '../components/Guards'
import ErrorPanel from '../components/ErrorPanel'

export default function Forum() {
  const { t, locale } = useI18n()
  const [comments, setComments] = useState(null)
  const [error, setError] = useState(null)

  const load = () => {
    if (!hasSupabase) return
    setError(null)
    supabase
      .from('comments')
      .select('id, created_at, task_id, tasks(id, title, level)')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error: dbError }) => {
        if (dbError) setError(dbError.message)
        else setComments(data || [])
      })
  }

  useEffect(load, [])

  const threads = useMemo(() => {
    if (!comments) return null
    const byTask = new Map()
    for (const c of comments) {
      if (!c.tasks) continue
      const existing = byTask.get(c.task_id)
      if (existing) {
        existing.count += 1
      } else {
        byTask.set(c.task_id, { task: c.tasks, count: 1, lastAt: c.created_at })
      }
    }
    return [...byTask.values()].sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
  }, [comments])

  if (!hasSupabase) return <SetupNotice />
  if (error) return <ErrorPanel message={error} onRetry={load} />
  if (threads === null) return <div className="page-loading"><span className="spinner" /> {t('forum.loading')}</div>

  return (
    <div className="forum-page">
      <div className="page-head">
        <h1><MessagesSquare size={22} /> {t('forum.title')}</h1>
        <p>{t('forum.sub')}</p>
      </div>

      {threads.length === 0 ? (
        <div className="empty-hint">{t('forum.empty')}</div>
      ) : (
        <div className="forum-list">
          {threads.map(({ task, count, lastAt }) => {
            const level = LEVELS[task.level]
            return (
              <Link key={task.id} to={`/tasks/${task.id}`} className="forum-thread" style={{ '--level-color': level.color }}>
                <span className="level-badge">{level.name}</span>
                <div className="forum-thread-info">
                  <div className="forum-thread-title">{task.title}</div>
                  <span className="forum-thread-meta">
                    {t('forum.comments', { n: count })} · {t('forum.lastActivity', {
                      date: new Date(lastAt).toLocaleString(locale, {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      }),
                    })}
                  </span>
                </div>
                <ArrowRight size={16} className="forum-thread-arrow" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
