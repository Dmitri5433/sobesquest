import { Navigate, useLocation, Link } from 'react-router-dom'
import { KeyRound, ShieldAlert } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'

export function SetupNotice() {
  const { t } = useI18n()
  return (
    <div className="setup-notice">
      <KeyRound size={28} />
      <h2>{t('guards.setupTitle')}</h2>
      <p>{t('guards.setupText')}</p>
      <p className="setup-hint">{t('guards.setupHint')}</p>
      <div className="setup-actions">
        <Link to="/setup" className="btn btn-primary">{t('guards.openSql')}</Link>
        <Link to="/" className="btn btn-outline">{t('guards.toHome')}</Link>
      </div>
    </div>
  )
}

export function PageLoading({ label }) {
  const { t } = useI18n()
  return (
    <div className="page-loading">
      <span className="spinner" /> {label ?? t('loading')}
    </div>
  )
}

export function RequireAuth({ children }) {
  const { hasSupabase, ready, user } = useAuth()
  const location = useLocation()
  if (!hasSupabase) return <SetupNotice />
  if (!ready) return <PageLoading />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

export function RequireAdmin({ children }) {
  const { hasSupabase, ready, user, profile, isAdmin } = useAuth()
  const { t } = useI18n()
  if (!hasSupabase) return <SetupNotice />
  if (!ready) return <PageLoading />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) {
    return (
      <div className="setup-notice">
        <ShieldAlert size={28} />
        <h2>{t('guards.adminOnly')}</h2>
        <p>{t('guards.adminOnlyText', { name: profile?.username })}</p>
        <p className="setup-hint"><code>{t('guards.adminOnlyHint')}</code></p>
        <Link to="/" className="btn btn-outline">{t('guards.toHome')}</Link>
      </div>
    )
  }
  return children
}
