import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, Database, ChevronDown, ChevronUp, KeyRound } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import sql001 from '../../supabase/migrations/001_schema.sql?raw'
import sql002 from '../../supabase/migrations/002_seed.sql?raw'
import sql003 from '../../supabase/migrations/003_forum.sql?raw'
import sql004 from '../../supabase/migrations/004_activity.sql?raw'

const STEPS = [
  { file: '001_schema.sql', titleKey: 'setup.step1', sql: sql001 },
  { file: '002_seed.sql', titleKey: 'setup.step2', sql: sql002 },
  { file: '003_forum.sql', titleKey: 'setup.step3', sql: sql003 },
  { file: '004_activity.sql', titleKey: 'setup.step4', sql: sql004 },
]

function SqlCard({ index, step }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(step.sql)
    } catch {
      // резервный путь для браузеров без clipboard API
      const area = document.createElement('textarea')
      area.value = step.sql
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const preview = expanded ? step.sql : step.sql.split('\n').slice(0, 14).join('\n')

  return (
    <div className="sql-card">
      <div className="sql-head">
        <span className="sql-num">{index + 1}</span>
        <div className="sql-info">
          <div className="sql-file">{step.file}</div>
          <div className="sql-title">{t(step.titleKey)}</div>
        </div>
        <button className={`btn btn-sm ${copied ? 'btn-outline' : 'btn-primary'}`} onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? t('setup.copied') : t('setup.copy')}
        </button>
      </div>
      <pre className={`sql-pre ${expanded ? 'expanded' : ''}`}>{preview}</pre>
      <button className="sql-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? t('setup.showLess') : t('setup.showAll')}
      </button>
    </div>
  )
}

export default function SetupGuide() {
  const { t } = useI18n()

  return (
    <div className="setup-guide">
      <div className="page-head">
        <h1><Database size={22} /> {t('setup.title')}</h1>
        <p>{t('setup.sub')}</p>
      </div>

      <div className="setup-steps-hint">
        <span>1. supabase.com → создать проект</span>
        <span>2. SQL Editor → New query → вставить файл → Run (по очереди 1–4)</span>
        <span>3. Project Settings → API → URL и anon-ключ в файл .env</span>
      </div>

      {STEPS.map((step, i) => (
        <SqlCard key={step.file} index={i} step={step} />
      ))}

      <div className="panel env-hint">
        <h3><KeyRound size={16} /> {t('setup.envTitle')}</h3>
        <p>{t('setup.envText')}</p>
        <pre className="env-sample">VITE_SUPABASE_URL=https://ВАШ-ПРОЕКТ.supabase.co{'\n'}VITE_SUPABASE_ANON_KEY=eyJ…</pre>
      </div>
    </div>
  )
}
