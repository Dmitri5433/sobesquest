import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'

const ERROR_KEYS = {
  'Invalid login credentials': 'auth.errInvalid',
  'Email not confirmed': 'auth.errNotConfirmed',
  DB_NOT_CONNECTED: 'auth.dbNotConnected',
}

export default function Login() {
  const { t } = useI18n()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn({ email, password })
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(ERROR_KEYS[err.message] ? t(ERROR_KEYS[err.message]) : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <LogIn size={26} className="auth-icon" />
        <h1>{t('auth.loginTitle')}</h1>
        <label className="field">
          <span>{t('auth.email')}</span>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="field">
          <span>{t('auth.password')}</span>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? t('auth.loggingIn') : t('auth.loginBtn')}
        </button>
        <p className="auth-alt">
          {t('auth.noAccount')}<Link to="/register">{t('auth.toRegister')}</Link>{t('auth.noAccountSuffix')}
        </p>
      </form>
    </div>
  )
}
