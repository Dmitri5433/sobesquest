import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Play, RotateCcw } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { buildProgress, LEVELS } from '../lib/progression'
import { useI18n } from '../lib/i18n'
import { fallbackCompanies } from '../data/fallback'
import ReviewList from '../components/ReviewList'
import ReviewForm from '../components/ReviewForm'

export default function CompanyPage() {
  const { slug } = useParams()
  const { t } = useI18n()
  const { user, solvedIds } = useAuth()
  const [company, setCompany] = useState(undefined)
  const [reviews, setReviews] = useState([])
  const [tasks, setTasks] = useState(null)

  const loadCompany = () => {
    if (!hasSupabase) {
      setCompany(fallbackCompanies.find((c) => c.slug === slug) ?? null)
      return
    }
    supabase.from('companies').select('*').eq('slug', slug).single().then(({ data }) => setCompany(data ?? null))
    supabase.from('reviews').select('*').eq('company_slug', slug).order('created_at', { ascending: false }).then(({ data }) => setReviews(data || []))
    supabase.from('tasks').select('*').eq('is_published', true).then(({ data }) => setTasks(data || []))
  }

  useEffect(loadCompany, [slug])

  const progress = useMemo(
    () => (tasks ? buildProgress(tasks, solvedIds) : null),
    [tasks, solvedIds]
  )

  if (company === undefined) {
    return <div className="page-loading"><span className="spinner" /> {t('company.loading')}</div>
  }
  if (company === null) {
    return (
      <div className="setup-notice">
        <h2>{t('company.notFound')}</h2>
        <Link to="/companies" className="btn btn-outline">{t('company.allCompanies')}</Link>
      </div>
    )
  }

  const level = LEVELS[company.required_level]
  const unlocked = progress ? progress.unlocked[company.required_level] : company.required_level === 'junior'

  return (
    <div className="company-page">
      <Link to="/companies" className="back-link"><ArrowLeft size={15} /> {t('company.allCompanies')}</Link>

      <div className="company-hero" style={{ '--company-color': company.color }}>
        <CompanyLogo name={company.name} color={company.color} big />
        <div>
          <h1>{company.name}</h1>
          <p className="company-tagline">{company.tagline}</p>
        </div>
        <span className="company-required">
          {unlocked
            ? t('company.available', { level: level.name })
            : <><Lock size={14} /> {t('company.required', { level: level.name })}</>}
        </span>
      </div>

      <div className="company-layout">
        <div className="company-main">
          <div className="panel">
            <h3>{t('company.about')}</h3>
            <p>{company.description}</p>
          </div>

          {unlocked && user ? (
            <div className="interview-cta">
              <div>
                <h3>{t('company.ready')}</h3>
                <p>{t('company.readySub')}</p>
              </div>
              <Link to={`/interview?company=${company.slug}`} className="btn btn-primary btn-lg">
                <Play size={17} /> {t('company.pass')}
              </Link>
            </div>
          ) : !user ? (
            <div className="interview-cta locked-cta">
              <p>
                {t('company.loginToStartBefore')}
                <Link to="/login">{t('company.login')}</Link>
                {t('company.loginToStartAfter')}
              </p>
              <Link to="/login" className="btn btn-primary">{t('company.login')}</Link>
            </div>
          ) : (
            <div className="interview-cta locked-cta">
              <Lock size={20} />
              <p>{t('company.lockedText', { level: level.name })}</p>
              <Link to="/tasks" className="btn btn-outline"><RotateCcw size={15} /> {t('company.toTasks')}</Link>
            </div>
          )}

          <div className="panel">
            <h3>{t('company.tips')}</h3>
            <ReviewList reviews={reviews} />
          </div>
        </div>

        {user && (
          <div className="company-side">
            <ReviewForm companySlug={company.slug} onSubmitted={loadCompany} />
          </div>
        )}
      </div>
    </div>
  )
}
