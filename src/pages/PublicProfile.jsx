import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Coins, CheckCircle2, Flame, CalendarCheck, ArrowLeft, ShieldAlert } from 'lucide-react'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { useI18n } from '../lib/i18n'
import { computeStreaks } from '../lib/streak'
import ActivityHeatmap from '../components/ActivityHeatmap'
import { SetupNotice } from '../components/Guards'

/** Публичный профиль игрока: доступен всем по адресу /players/:username */
export default function PublicProfile() {
  const { username } = useParams()
  const { t, locale } = useI18n()
  const [player, setPlayer] = useState(undefined) // undefined = загрузка
  const [rank, setRank] = useState(null)
  const [activityDays, setActivityDays] = useState(() => new Set())

  useEffect(() => {
    if (!hasSupabase) return
    let active = true
    ;(async () => {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, username, role, created_at')
        .eq('username', username)
        .single()
      if (!active) return
      setPlayer(prof ?? null)
      if (!prof) return

      const [{ data: lbRows }, { data: days }] = await Promise.all([
        supabase.from('leaderboard').select('id, xp, solved_count').order('xp', { ascending: false }).limit(200),
        supabase.from('activity_days').select('day').eq('user_id', prof.id),
      ])
      if (!active) return
      const index = (lbRows || []).findIndex((row) => row.id === prof.id)
      if (index >= 0) setRank({ place: index + 1, xp: lbRows[index].xp, solved: lbRows[index].solved_count })
      setActivityDays(new Set((days || []).map((row) => row.day)))
    })()
    return () => { active = false }
  }, [username])

  const streak = useMemo(() => computeStreaks([...activityDays]), [activityDays])

  if (!hasSupabase) return <SetupNotice />
  if (player === undefined) {
    return <div className="page-loading"><span className="spinner" /> {t('loading')}</div>
  }
  if (player === null) {
    return (
      <div className="setup-notice">
        <ShieldAlert size={28} />
        <h2>{t('pp.notFound')}</h2>
        <Link to="/leaderboard" className="btn btn-outline">{t('lb.title')}</Link>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Link to="/leaderboard" className="back-link"><ArrowLeft size={15} /> {t('lb.title')}</Link>

      <div className="profile-card">
        <span className="avatar big">{(player.username || '?')[0].toUpperCase()}</span>
        <div className="profile-info">
          <h2>{player.username}</h2>
          {player.role === 'admin' && <span className="admin-tag">{t('lb.admin')}</span>}
          <span className="profile-joined">
            {t('pp.joined', { date: new Date(player.created_at).toLocaleDateString(locale, { month: 'long', year: 'numeric' }) })}
          </span>
        </div>
        <div className="profile-counters">
          {rank && (
            <div className="counter">
              <Trophy size={16} /> <b>{rank.place}</b><span>{t('pp.rank')}</span>
            </div>
          )}
          {rank && (
            <div className="counter">
              <Coins size={16} /> <b>{rank.xp}</b><span>XP</span>
            </div>
          )}
          <div className="counter">
            <CheckCircle2 size={16} /> <b>{rank?.solved ?? 0}</b><span>{t('profile.tasks')}</span>
          </div>
        </div>
      </div>

      <div className="panel streak-panel">
        <div className="streak-stats">
          <h3><CalendarCheck size={16} /> {t('profile.streak')}</h3>
          <div className="streak-big">
            <Flame size={30} className={streak.current > 0 ? 'flame-on' : 'flame-off'} />
            <b>{streak.current}</b>
            <span>{t('profile.streakCurrent', { n: streak.current })}</span>
          </div>
          <div className="streak-sub">
            <span>{t('profile.streakBest', { n: streak.best })}</span>
            <span>{t('profile.activeDays', { n: streak.totalActive })}</span>
          </div>
        </div>
        <ActivityHeatmap activeDays={activityDays} />
      </div>
    </div>
  )
}
