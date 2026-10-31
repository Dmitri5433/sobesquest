import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { useI18n } from '../lib/i18n'
import { SetupNotice } from '../components/Guards'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const [rows, setRows] = useState(null)

  useEffect(() => {
    if (!hasSupabase) return
    supabase
      .from('leaderboard')
      .select('*')
      .limit(50)
      .then(({ data }) => setRows(data || []))
  }, [])

  if (!hasSupabase) return <SetupNotice />
  if (rows === null) {
    return <div className="page-loading"><span className="spinner" /> {t('lb.loading')}</div>
  }

  return (
    <div className="leaderboard-page">
      <div className="page-head">
        <h1><Trophy size={22} /> {t('lb.title')}</h1>
        <p>{t('lb.sub')}</p>
      </div>

      {rows.length === 0 ? (
        <div className="empty-hint">{t('lb.empty')}</div>
      ) : (
        <div className="table-wrap">
          <table className="lb-table">
            <thead>
              <tr>
                <th>{t('lb.place')}</th>
                <th>{t('lb.player')}</th>
                <th>{t('lb.solved')}</th>
                <th>{t('lb.xp')}</th>
                <th>{t('lb.since')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className={user?.id === row.id ? 'me' : ''}>
                  <td className="lb-place">{MEDALS[index] ?? index + 1}</td>
                  <td>
                    <Link to={`/players/${row.username}`} className="lb-player" title={t('pp.open')}>
                      <span className="avatar sm">{(row.username || '?')[0].toUpperCase()}</span>
                      {row.username}
                      {row.role === 'admin' && <span className="admin-tag">{t('lb.admin')}</span>}
                      {user?.id === row.id && <span className="me-tag">{t('lb.you')}</span>}
                    </Link>
                  </td>
                  <td>{row.solved_count}</td>
                  <td className="lb-xp">{row.xp}</td>
                  <td className="lb-since">
                    {new Date(row.created_at).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
