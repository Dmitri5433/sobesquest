import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Swords, Menu, X, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'

const NAV_ITEMS = [
  { to: '/', label: 'nav.home', end: true },
  { to: '/tasks', label: 'nav.tasks' },
  { to: '/companies', label: 'nav.companies' },
  { to: '/weak', label: 'nav.weak' },
  { to: '/forum', label: 'nav.forum' },
  { to: '/leaderboard', label: 'nav.leaderboard' },
  { to: '/profile', label: 'nav.profile' },
  { to: '/stats', label: 'nav.stats' },
]

export default function Layout({ children }) {
  const { user, profile, isAdmin, signOut, hasSupabase } = useAuth()
  const { t, lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="logo" onClick={() => setOpen(false)}>
            <span className="logo-icon"><Swords size={18} /></span>
            {t('brand1')}<span className="logo-accent">{t('brand2')}</span>
          </Link>

          <nav className={`nav ${open ? 'nav-open' : ''}`}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {t(item.label)}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link nav-admin ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <ShieldCheck size={14} /> {t('nav.admin')}
              </NavLink>
            )}
            {user && (
              <button className="nav-link nav-logout" onClick={handleSignOut}>
                <LogOut size={14} /> {t('nav.logout')}
              </button>
            )}
          </nav>

          <div className="topbar-right">
            <div className="lang-switch" role="group" aria-label="Language">
              <button className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            {!hasSupabase ? (
              <span className="env-badge">{t('demoMode')}</span>
            ) : user ? (
              <Link to="/profile" className="user-chip" onClick={() => setOpen(false)}>
                <span className="avatar">{(profile?.username || 'I')[0].toUpperCase()}</span>
                <span className="user-name">{profile?.username || t('profile.player')}</span>
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">{t('nav.login')}</Link>
            )}
            <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="page">{children}</main>

      <footer className="footer">
        <span>{t('footer', { year: new Date().getFullYear() })}</span>
      </footer>
    </div>
  )
}
