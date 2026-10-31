import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { buildProgress } from '../lib/progression'
import { useI18n } from '../lib/i18n'
import { fallbackCompanies } from '../data/fallback'
import CompanyCard from '../components/CompanyCard'

export default function Companies() {
  const { t } = useI18n()
  const { solvedIds } = useAuth()
  const [companies, setCompanies] = useState(hasSupabase ? null : fallbackCompanies)
  const [tasks, setTasks] = useState(null)

  useEffect(() => {
    if (!hasSupabase) return
    supabase.from('companies').select('*').order('sort_order').then(({ data }) =>
      setCompanies(data?.length ? data : fallbackCompanies)
    )
    supabase.from('tasks').select('*').eq('is_published', true).then(({ data }) => setTasks(data || []))
  }, [])

  const progress = useMemo(
    () => (tasks ? buildProgress(tasks, solvedIds) : null),
    [tasks, solvedIds]
  )

  if (companies === null) {
    return <div className="page-loading"><span className="spinner" /> {t('companies.loading')}</div>
  }

  return (
    <div className="companies-page">
      <div className="page-head">
        <h1>{t('companies.title')}</h1>
        <p>{t('companies.sub')}</p>
      </div>
      <div className="companies-grid">
        {companies.map((company) => (
          <CompanyCard
            key={company.slug}
            company={company}
            unlocked={progress ? progress.unlocked[company.required_level] : company.required_level === 'junior'}
          />
        ))}
      </div>
    </div>
  )
}
