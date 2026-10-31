import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Coins, Trophy, MapPin, CheckCircle2, Briefcase, Flame, CalendarCheck } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { buildProgress, LEVELS } from '../lib/progression'
import { useI18n } from '../lib/i18n'
import { computeStreaks } from '../lib/streak'
import { fallbackCompanies } from '../data/fallback'
import TerritoryMap from '../components/TerritoryMap'
import ActivityHeatmap from '../components/ActivityHeatmap'

export default function Profile() {
  const { t } = useI18n()
  const { user, profile, solvedIds } = useAuth()
  const [tasks, setTasks] = useState(null)
  const [companies, setCompanies] = useState(hasSupabase ? [] : fallbackCompanies)
  const [lbRow, setLbRow] = useState(null)
  const [activityDays, setActivityDays] = useState(() => new Set())

  useEffect(() => {
    if (!hasSupabase || !user) return
    supabase.from('tasks').select('*').eq('is_published', true).then(({ data }) => setTasks(data || []))
    supabase.from('companies').select('*').order('sort_order').then(({ data }) => setCompanies(data?.length ? data : fallbackCompanies))
    supabase.from('leaderboard').select('*').eq('id', user.id).single().then(({ data }) => setLbRow(data))
    supabase.from('activity_days').select('day').eq('user_id', user.id).then(({ data }) => {
      setActivityDays(new Set((data || []).map((row) => row.day)))
    })
  }, [user?.id])

  const progress = useMemo(
    () => (tasks ? buildProgress(tasks, solvedIds) : null),
    [tasks, solvedIds]
  )
  const unlockedCompanies = useMemo(
    () => companies.filter((c) => progress?.unlocked[c.required_level] ?? false),
    [companies, progress]
  )
  const streak = useMemo(() => computeStreaks([...activityDays]), [activityDays])

  if (!progress) {
    return <div className="page-loading"><span className="spinner" /> {t('profile.loading')}</div>
  }

  const levelInfo = LEVELS[progress.currentLevel]
  const xp = lbRow?.xp ?? progress.earnedXp

  return (
    <div className="profile-page">
      <div className="page-head">
        <h1>{t('profile.title')}</h1>
        <p>{t('profile.sub')}</p>
      </div>

      <div className="profile-card">
        <span className="avatar big">{(profile?.username || 'I')[0].toUpperCase()}</span>
        <div className="profile-info">
          <h2>{profile?.username || t('profile.player')}</h2>
          <span className="level-badge" style={{ '--level-color': levelInfo.color }}>
            {t('profile.grade', { level: levelInfo.name })}
          </span>
        </div>
        <div className="profile-counters">
          <div className="counter">
            <Coins size={16} /> <b>{xp}</b><span>XP</span>
          </div>
          <div className="counter">
            <CheckCircle2 size={16} /> <b>{progress.solvedTotal}</b><span>{t('profile.tasks')}</span>
          </div>
          <div className="counter">
            <Briefcase size={16} /> <b>{unlockedCompanies.length}</b><span>{t('profile.companies')}</span>
          </div>
          <Link to="/leaderboard" className="counter link-counter">
            <Trophy size={16} /> <span>{t('profile.rating')}</span>
          </Link>
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
            {streak.activeToday && <span className="streak-today">{t('profile.activeToday')}</span>}
          </div>
        </div>
        <ActivityHeatmap activeDays={activityDays} />
      </div>

      <div className="panel map-panel">
        <h3><MapPin size={16} /> {t('profile.map')}</h3>
        <TerritoryMap
          solvedCount={progress.solvedTotal}
          unlockedLevels={progress.unlocked}
          unlockedCompanies={unlockedCompanies}
        />
      </div>

      <div className="profile-levels">
        {Object.entries(progress.byLevel).map(([levelId, p]) => {
          const info = LEVELS[levelId]
          const percent = p.total === 0 ? 0 : Math.round((p.solved / p.total) * 100)
          return (
            <div key={levelId} className="profile-level" style={{ '--level-color': info.color }}>
              <div className="profile-level-head">
                <b>{info.name}</b>
                <span>{p.solved} / {p.total}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
