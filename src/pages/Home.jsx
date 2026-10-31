import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Trophy, Map as MapIcon, Play } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { buildProgress, LEVEL_IDS } from '../lib/progression'
import { useI18n } from '../lib/i18n'
import { runTests } from '../lib/runner'
import { demoTask, heroCodeLines } from '../data/demoTask'
import { fallbackCompanies } from '../data/fallback'
import TypingCode from '../components/TypingCode'
import CodeEditor from '../components/CodeEditor'
import TestResults from '../components/TestResults'
import LevelCard from '../components/LevelCard'
import CompanyCard from '../components/CompanyCard'
import { Database } from 'lucide-react'

function DemoRunner() {
  const { t } = useI18n()
  const [code, setCode] = useState(`function sum(a, b) {\n  // ${t('home.demoComment')}\n}`)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  const run = async () => {
    setRunning(true)
    setResult(null)
    const res = await runTests({
      code,
      functionName: demoTask.functionName,
      tests: demoTask.tests,
      testCode: demoTask.testCode,
    })
    setResult(res)
    setRunning(false)
  }

  const passed = result && !result.error && !result.errorCode && result.results.every((r) => r.pass)

  return (
    <div className="demo-runner">
      <div className="demo-editor">
        <CodeEditor value={code} onChange={setCode} height="180px" />
      </div>
      <div className="demo-side">
        <button className="btn btn-primary" onClick={run} disabled={running}>
          <Play size={15} /> {running ? t('home.running') : t('home.run')}
        </button>
        <TestResults running={running} result={result} />
        {passed && (
          <motion.div className="demo-success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            {t('home.demoPassed')}
            <Link to="/tasks">{t('home.demoMore')}</Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const { t } = useI18n()
  const { user, solvedIds } = useAuth()
  const [tasks, setTasks] = useState(null)
  const [companies, setCompanies] = useState(hasSupabase ? [] : fallbackCompanies)

  useEffect(() => {
    if (!hasSupabase) return
    supabase.from('tasks').select('*').eq('is_published', true).then(({ data }) => setTasks(data || []))
    supabase
      .from('companies')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCompanies(data?.length ? data : fallbackCompanies))
  }, [])

  const progress = useMemo(
    // Без Supabase показываем уровни с нулевым прогрессом вместо бесконечных скелетонов
    () => buildProgress(tasks ?? [], solvedIds),
    [tasks, solvedIds]
  )

  const unlockedCompanies = useMemo(
    () => companies.filter((c) => progress.unlocked[c.required_level]),
    [companies, progress]
  )

  return (
    <div className="home">
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-text">
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            {t('home.hero1')}
            <span className="gradient-text">{t('home.heroAccent')}</span>
          </motion.h1>
          <motion.p className="hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            {t('home.heroSub', { n: companies.length || 10 })}
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Link to={user ? '/tasks' : '/register'} className="btn btn-primary btn-lg">
              <Sparkles size={17} /> {user ? t('home.toTasks') : t('home.startFree')}
            </Link>
            <Link to="/leaderboard" className="btn btn-outline btn-lg">
              <Trophy size={17} /> {t('home.rating')}
            </Link>
          </motion.div>
          {user && (
            <div className="hero-progress">
              {t('home.progress', {
                solved: progress.solvedTotal,
                opened: unlockedCompanies.length,
                total: companies.length,
              })}
            </div>
          )}
        </div>
        <div className="hero-code-wrap">
          <div className="hero-code-bar">
            <i /><i /><i /> interview.js
          </div>
          <TypingCode lines={heroCodeLines} />
        </div>
      </section>

      {/* ---------- ПОДКЛЮЧЕНИЕ БАЗЫ (демо-режим) ---------- */}
      {!hasSupabase && (
        <section className="section">
          <div className="cta-strip setup-callout">
            <div>
              <h3><Database size={17} /> {t('home.demoCalloutTitle')}</h3>
              <p>{t('home.demoCallout')}</p>
            </div>
            <Link to="/setup" className="btn btn-primary">{t('home.demoCalloutBtn')}</Link>
          </div>
        </section>
      )}

      {/* ---------- ДЕМО-ЗАДАЧА ---------- */}
      <section className="section">
        <div className="section-head">
          <h2><Play size={20} /> {t('home.demoTitle')}</h2>
          <p>{t('home.demoSub')}</p>
        </div>
        <DemoRunner />
      </section>

      {/* ---------- УРОВНИ ---------- */}
      <section className="section">
        <div className="section-head">
          <h2>{t('home.levelsTitle')}</h2>
          <p>{t('home.levelsSub')}</p>
        </div>
        <div className="levels-grid">
          {LEVEL_IDS.map((levelId) => (
            <LevelCard
              key={levelId}
              levelId={levelId}
              progress={progress.byLevel[levelId]}
              unlocked={progress.unlocked[levelId]}
            />
          ))}
        </div>
      </section>

      {/* ---------- КОМПАНИИ ---------- */}
      <section className="section">
        <div className="section-head">
          <h2>{t('home.companiesTitle')}</h2>
          <p>{t('home.companiesSub')}</p>
        </div>
        <div className="companies-grid">
          {companies.map((company) => (
            <CompanyCard
              key={company.slug}
              company={company}
              unlocked={progress.unlocked[company.required_level]}
            />
          ))}
        </div>
      </section>

      {/* ---------- КАРТА ---------- */}
      {user && (
        <section className="section">
          <div className="section-head">
            <h2><MapIcon size={20} /> {t('home.mapTeaser')}</h2>
            <p>{t('home.mapTeaserSub')}</p>
          </div>
          <div className="cta-strip">
            <p>{t('home.mapTeaserSub')}</p>
            <Link to="/profile" className="btn btn-primary">{t('home.openProfile')}</Link>
          </div>
        </section>
      )}
    </div>
  )
}
