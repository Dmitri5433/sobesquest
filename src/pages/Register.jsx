import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'

const ERROR_KEYS = {
  'User already registered': 'auth.errExists',
  'Password should be at least 6 characters': 'auth.errWeak',
  DB_NOT_CONNECTED: 'auth.dbNotConnected',
}

export default function Register() {
  const { t } = useI18n()
  const { signUp } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [needConfirm, setNeedConfirm] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const data = await signUp({ username, email, password })
      if (data?.user && !data.session) {
        setNeedConfirm(true)
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(ERROR_KEYS[err.message] ? t(ERROR_KEYS[err.message]) : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <UserPlus size={26} className="auth-icon" />
        <h1>{t('auth.registerTitle')}</h1>
        {needConfirm ? (
          <>
            <p className="auth-alt">{t('auth.needConfirm')}</p>
            <Link to="/login" className="btn btn-primary btn-lg">{t('auth.toLogin')}</Link>
          </>
        ) : (
          <>
            <label className="field">
              <span>{t('auth.username')}</span>
              <input className="input" required minLength={2} maxLength={24} value={username}
                onChange={(e) => setUsername(e.target.value)} placeholder={t('auth.usernamePh')} />
            </label>
            <label className="field">
              <span>{t('auth.email')}</span>
              <input className="input" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label className="field">
              <span>{t('auth.password')}</span>
              <input className="input" type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.passwordHint')} />
            </label>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn-primary btn-lg" disabled={busy}>
              {busy ? t('auth.creating') : t('auth.registerBtn')}
            </button>
            <p className="auth-alt">
              {t('auth.haveAccount')}<Link to="/login">{t('auth.toLogin')}</Link>
            </p>
          </>
        )}
      </form>
    </div>
  )
}
