import { useEffect, useMemo, useState } from 'react'
import { Target, RotateCcw, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { useI18n } from '../lib/i18n'
import QuestionCard from '../components/QuestionCard'
import { SetupNotice } from '../components/Guards'

/**
 * «Повторение»: дрилл вопросов, где на собеседованиях была самооценка
 * «С трудом» или «Не знал». Результаты дрилла не пишутся в базу.
 */
export default function WeakDrill() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [runs, setRuns] = useState(null)
  const [theory, setTheory] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!hasSupabase || !user) return
    supabase
      .from('interview_runs')
      .select('details')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) return setLoadError(error.message)
        setRuns(data || [])
      })
    supabase
      .from('theory_questions')
      .select('question, answer')
      .eq('is_published', true)
      .then(({ data }) => setTheory(data || []))
  }, [user?.id])

  const weak = useMemo(() => {
    if (!runs) return []
    const best = new Map()
    for (const run of runs) {
      for (const item of run.details || []) {
        if ((item.type !== 'theory' && item.type !== 'hr') || typeof item.score !== 'number') continue
        const prev = best.get(item.question)
        if (prev === undefined || item.score < prev.score) {
          best.set(item.question, { question: item.question, score: item.score, type: item.type })
        }
      }
    }
    const answers = new Map(theory.map((q) => [q.question, q.answer]))
    return [...best.values()]
      .filter((q) => q.score < 2)
      .sort((a, b) => a.score - b.score)
      .map((q) => ({ ...q, answer: answers.get(q.question) ?? null }))
  }, [runs, theory])

  const restart = () => {
    setStep(0)
    setStarted(false)
    setFinished(false)
  }

  const answer = () => {
    if (step + 1 < weak.length) setStep(step + 1)
    else setFinished(true)
  }

  if (!hasSupabase) return <SetupNotice />
  if (loadError) return <div className="setup-notice"><h2>{t('forum.loadError')}</h2><p>{loadError}</p></div>
  if (runs === null) return <div className="page-loading"><span className="spinner" /> {t('loading')}</div>

  return (
    <div className="weak-page">
      <div className="page-head">
        <h1><Target size={22} /> {t('weak.title')}</h1>
        <p>{t('weak.sub')}</p>
      </div>

      {weak.length === 0 && !finished ? (
        <div className="setup-notice">
          <CheckCircle2 size={28} />
          <h2>{t('weak.allGoodTitle')}</h2>
          <p>{t('weak.allGood')}</p>
        </div>
      ) : finished ? (
        <div className="setup-notice">
          <CheckCircle2 size={28} />
          <h2>{t('weak.done')}</h2>
          <p>{t('weak.doneSub')}</p>
          <button className="btn btn-outline" onClick={restart}><RotateCcw size={15} /> {t('weak.again')}</button>
        </div>
      ) : !started ? (
        <div className="panel interview-intro">
          <h3>{t('weak.startTitle', { n: weak.length })}</h3>
          <p className="weak-hint">{t('weak.startHint')}</p>
          <button className="btn btn-primary btn-lg" onClick={() => setStarted(true)}>
            <Target size={17} /> {t('weak.start')}
          </button>
        </div>
      ) : (
        <QuestionCard
          key={`w-${step}`}
          index={step}
          total={weak.length}
          question={weak[step].question}
          answer={weak[step].answer}
          kind={weak[step].type === 'hr' ? 'hr' : 'tech'}
          onAnswer={answer}
        />
      )}
    </div>
  )
}
