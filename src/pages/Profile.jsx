import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Coins, Trophy, MapPin, CheckCircle2, Briefcase, Flame, CalendarCheck,
  Zap, Layers, Target, Crown, ClipboardCheck, MessagesSquare,
} from 'lucide-react'
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
  const [runScores, setRunScores] = useState([])
  const [commentsCount, setCommentsCount] = useState(0)

  useEffect(() => {
    if (!hasSupabase || !user) return
    supabase.from('tasks').select('*').eq('is_published', true).then(({ data }) => setTasks(data || []))
    supabase.from('companies').select('*').order('sort_order').then(({ data }) => setCompanies(data?.length ? data : fallbackCompanies))
    supabase.from('leaderboard').select('*').eq('id', user.id).single().then(({ data }) => setLbRow(data))
    supabase.from('activity_days').select('day').eq('user_id', user.id).then(({ data }) => {
      setActivityDays(new Set((data || []).map((row) => row.day)))
    })
    supabase.from('interview_runs').select('score').eq('user_id', user.id).then(({ data }) => setRunScores((data || []).map((r) => r.score)))
    supabase.from('comments').select('id').eq('user_id', user.id).then(({ data }) => setCommentsCount((data || []).length))
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
  const bestScore = runScores.length ? Math.max(...runScores) : 0

  const achievements = useMemo(() => {
    if (!progress) return []
    return [
      { key: 'ach.first', ok: progress.solvedTotal >= 1, Icon: Zap },
      { key: 'ach.five', ok: progress.solvedTotal >= 5, Icon: Layers },
      { key: 'ach.ten', ok: progress.solvedTotal >= 10, Icon: Target },
      { key: 'ach.junior', ok: progress.unlocked.middle, Icon: CheckCircle2 },
      { key: 'ach.middle', ok: progress.unlocked.senior, Icon: MapPin },
      { key: 'ach.senior', ok: progress.unlocked.senior && progress.isLevelCompleted('senior'), Icon: Crown },
      { key: 'ach.streak3', ok: streak.best >= 3, Icon: Flame },
      { key: 'ach.streak7', ok: streak.best >= 7, Icon: Flame },
      { key: 'ach.interview', ok: runScores.length >= 1, Icon: ClipboardCheck },
      { key: 'ach.score70', ok: bestScore >= 70, Icon: Trophy },
      { key: 'ach.forum', ok: commentsCount >= 1, Icon: MessagesSquare },
    ]
  }, [progress, streak, runScores, bestScore, commentsCount])

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

      <div className="panel ach-panel">
        <h3><Trophy size={16} /> {t('ach.title')}</h3>
        <div className="ach-grid">
          {achievements.map(({ key, ok, Icon }) => (
            <div key={key} className={`ach-card ${ok ? 'achieved' : 'locked'}`}>
              <Icon size={20} />
              <span>{t(key)}</span>
            </div>
          ))}
        </div>
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
