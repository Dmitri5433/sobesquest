import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Play, Flag, RotateCcw, Home, ClipboardCheck } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { buildProgress, LEVELS } from '../lib/progression'
import { useI18n } from '../lib/i18n'
import { runTests } from '../lib/runner'
import { fallbackCompanies } from '../data/fallback'
import QuestionCard from '../components/QuestionCard'
import CodeEditor from '../components/CodeEditor'
import TestResults from '../components/TestResults'
import Timer from '../components/Timer'
import ReviewForm from '../components/ReviewForm'
import CompanyLogo from '../components/CompanyLogo'

const THEORY_COUNT = 3
const CODE_SECONDS = 7 * 60

const pickRandom = (arr, n) => [...(arr || [])].sort(() => Math.random() - 0.5).slice(0, n)

/** Этап задачи по коду с таймером */
function CodeStage({ task, onFinish }) {
  const { t } = useI18n()
  const [code, setCode] = useState(
    () => localStorage.getItem(`sq_draft_${task.id}`) ?? (task.starter_code || '')
  )
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const resultRef = useRef(null)
  resultRef.current = result

  const setDraft = (nextCode) => {
    setCode(nextCode)
    localStorage.setItem(`sq_draft_${task.id}`, nextCode)
  }

  const run = async () => {
    setRunning(true)
    setResult(null)
    const res = await runTests({
      code,
      functionName: task.function_name,
      tests: task.tests,
      testCode: task.test_code,
      taskType: task.task_type || 'js',
      setupSql: task.setup_sql,
    })
    setResult(res)
    setRunning(false)
  }

  const finish = async () => {
    setFinishing(true)
    const res = resultRef.current
    let ratio = 0
    if (res && !res.error && !res.errorCode && !res.timedOut && res.results.length > 0) {
      ratio = res.results.filter((r) => r.pass).length / res.results.length
    }
    await onFinish({ ratio })
  }

  return (
    <div className="code-stage">
      <div className="code-stage-head">
        <div>
          <span className="stage-label">{t('interview.codeStage')}</span>
          <h3 className="code-stage-title">{task.title}</h3>
        </div>
        <Timer seconds={CODE_SECONDS} onExpire={finish} label={t('interview.timerLabel')} />
      </div>
      <p className="code-stage-desc">{task.description}</p>
      <div className="panel editor-panel">
        <div className="editor-head">
          <span>{task.task_type === 'sql' ? 'query.sql' : 'solution.js'}</span>
          <button className="btn btn-primary btn-sm" onClick={run} disabled={running}>
            <Play size={14} /> {running ? t('task.running') : t('task.run')}
          </button>
        </div>
        <CodeEditor value={code} onChange={setDraft} height="240px" language={task.task_type === 'sql' ? 'sql' : 'js'} />
      </div>
      <TestResults running={running} result={result} />
      <button className="btn btn-primary btn-lg finish-btn" onClick={finish} disabled={finishing}>
        <Flag size={16} /> {finishing ? t('interview.finishing') : t('interview.finish')}
      </button>
    </div>
  )
}

export default function InterviewRun() {
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const companySlug = searchParams.get('company')
  const levelParam = searchParams.get('level') || 'junior'
  const { user, solvedIds, markSolved } = useAuth()

  const [company, setCompany] = useState(null)
  const [level, setLevel] = useState(levelParam)
  const [tasks, setTasks] = useState(null)

  const [stage, setStage] = useState('intro') // intro | theory | code | hr | report
  const [step, setStep] = useState(0)
  const [theoryQs, setTheoryQs] = useState(null)
  const [hrQs, setHrQs] = useState(null)
  const [codeTask, setCodeTask] = useState(null)
  const [theoryScores, setTheoryScores] = useState([])
  const [hrScores, setHrScores] = useState([])
  const [codeRatio, setCodeRatio] = useState(null)
  const [savedRun, setSavedRun] = useState(null)

  useEffect(() => {
    if (!hasSupabase) return
    if (companySlug) {
      supabase.from('companies').select('*').eq('slug', companySlug).single().then(({ data }) => {
        if (data) {
          setCompany(data)
          setLevel(data.required_level)
        }
      })
    }
    supabase.from('tasks').select('*').eq('is_published', true).then(({ data }) => setTasks(data || []))
  }, [companySlug])

  const progress = useMemo(
    () => (tasks ? buildProgress(tasks, solvedIds) : null),
    [tasks, solvedIds]
  )

  const resetRun = () => {
    setStage('intro')
    setStep(0)
    setTheoryQs(null)
    setHrQs(null)
    setCodeTask(null)
    setTheoryScores([])
    setHrScores([])
    setCodeRatio(null)
    setSavedRun(null)
  }

  const start = async () => {
    const [{ data: theory }, { data: hr }] = await Promise.all([
      supabase.from('theory_questions').select('*').eq('level', level).eq('is_published', true),
      supabase.from('theory_questions').select('*').eq('level', 'hr').eq('is_published', true),
    ])

    const theoryList = pickRandom(theory, THEORY_COUNT)
    let hrList
    if (company?.questions?.length) {
      hrList = company.questions.map((q, i) => ({ id: `company-${i}`, question: q, answer: null }))
    } else {
      hrList = pickRandom(hr, 1)
    }

    const levelTasks = (tasks || []).filter((task) => task.level === level)
    const task = levelTasks[Math.floor(Math.random() * levelTasks.length)] || null

    setTheoryQs(theoryList)
    setHrQs(hrList)
    setCodeTask(task)
    setTheoryScores([])
    setHrScores([])
    setCodeRatio(null)
    setStage('theory')
    setStep(0)
  }

  const answerTheory = (score) => {
    setTheoryScores((prev) => [...prev, score])
    if (step + 1 < theoryQs.length) {
      setStep(step + 1)
    } else {
      setStep(0)
      setStage(codeTask ? 'code' : 'hr')
    }
  }

  const finishCode = async ({ ratio }) => {
    setCodeRatio(ratio)
    if (ratio >= 1 && codeTask) {
      await markSolved(codeTask.id)
    }
    setStage('hr')
    setStep(0)
  }

  const answerHr = (score) => {
    setHrScores((prev) => [...prev, score])
    if (step + 1 < hrQs.length) {
      setStep(step + 1)
    } else {
      setStage('report')
    }
  }

  // ----- Отчёт -----
  const report = useMemo(() => {
    if (stage !== 'report' || !theoryQs || !hrQs) return null
    const theoryMax = theoryQs.length * 2
    const hrMax = hrQs.length * 2
    const codeMax = 10
    const theoryEarned = theoryScores.reduce((a, b) => a + b, 0)
    const hrEarned = hrScores.reduce((a, b) => a + b, 0)
    const codeEarned = Math.round((codeRatio ?? 0) * codeMax * 10) / 10
    const totalMax = theoryMax + hrMax + codeMax
    const earned = theoryEarned + codeEarned + hrEarned
    const score = Math.max(0, Math.min(100, Math.round((earned / totalMax) * 100)))
    return { theoryEarned, theoryMax, hrEarned, hrMax, codeEarned, codeMax, score }
  }, [stage, theoryQs, hrQs, theoryScores, hrScores, codeRatio])

  useEffect(() => {
    if (stage !== 'report' || !report || savedRun || !user || !hasSupabase) return
    const details = [
      ...theoryQs.map((q, i) => ({ type: 'theory', question: q.question, score: theoryScores[i] })),
      { type: 'code', task: codeTask?.title, ratio: codeRatio },
      ...hrQs.map((q, i) => ({ type: 'hr', question: q.question, score: hrScores[i] })),
    ]
    supabase
      .from('interview_runs')
      .insert({
        user_id: user.id,
        company_slug: companySlug || null,
        level,
        score: report.score,
        details,
      })
      .select('id')
      .single()
      .then(({ data }) => data && setSavedRun(data.id))
  }, [stage, report, savedRun, user])

  // ---------- Экран блокировки ----------
  if (progress && !progress.unlocked[level]) {
    const reqLevel = LEVELS[level]
    return (
      <div className="setup-notice">
        <Lock size={28} />
        <h2>{t('interview.closedTitle')}</h2>
        <p>{t('interview.closedText', { level: reqLevel.name })}</p>
        <Link to="/tasks" className="btn btn-outline">{t('interview.toTasks')}</Link>
      </div>
    )
  }

  const levelInfo = LEVELS[level]
  const contextName = company?.name || t('interview.levelScenario', { level: levelInfo.name })
  const hrTitle = company?.questions?.length ? t('interview.hrCompany') : t('interview.hrGeneric')
  const stageNames = { theory: t('interview.stage.theory'), code: t('interview.stage.code'), hr: t('interview.stage.hr'), report: t('interview.stage.report') }

  return (
    <div className="interview-page">
      <div className="interview-head">
        {company ? (
          <CompanyLogo name={company.name} color={company.color} />
        ) : (
          <span className="company-logo monogram">{levelInfo.name[0]}</span>
        )}
        <div>
          <h1>{contextName}</h1>
          <span className="interview-sub">
            {stage === 'intro'
              ? t('interview.scenario')
              : t('interview.stageLabel', { stage: stageNames[stage] })}
          </span>
        </div>
      </div>

      {/* ---------- ВСТУПЛЕНИЕ ---------- */}
      {stage === 'intro' && (
        <motion.div className="panel interview-intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h3>{t('interview.introTitle')}</h3>
          <ol className="intro-steps">
            <li>{t('interview.introTheory', { n: THEORY_COUNT })}</li>
            <li>{t('interview.introCode')}</li>
            <li>{t('interview.introHr', { title: hrTitle })}</li>
            <li>{t('interview.introReport')}</li>
          </ol>
          <button className="btn btn-primary btn-lg" onClick={start} disabled={!hasSupabase}>
            <Play size={17} /> {t('interview.start')}
          </button>
        </motion.div>
      )}

      {/* ---------- ТЕОРИЯ ---------- */}
      {stage === 'theory' && theoryQs?.length > 0 && (
        <QuestionCard
          key={`t-${step}`}
          index={step}
          total={theoryQs.length}
          question={theoryQs[step].question}
          answer={theoryQs[step].answer}
          kind="tech"
          onAnswer={answerTheory}
        />
      )}

      {/* ---------- ЗАДАЧА ---------- */}
      {stage === 'code' && codeTask && <CodeStage task={codeTask} onFinish={finishCode} />}
      {stage === 'code' && !codeTask && (
        <div className="setup-notice">
          <h2>{t('interview.noTasksTitle')}</h2>
          <p>{t('interview.noTasksText')}</p>
          <button className="btn btn-primary" onClick={() => { setStage('hr'); setStep(0) }}>{t('interview.continue')}</button>
        </div>
      )}

      {/* ---------- HR ---------- */}
      {stage === 'hr' && hrQs?.length > 0 && (
        <QuestionCard
          key={`h-${step}`}
          index={step}
          total={hrQs.length}
          question={hrQs[step].question}
          answer={hrQs[step].answer}
          kind="hr"
          onAnswer={answerHr}
        />
      )}

      {/* ---------- ОТЧЁТ ---------- */}
      {stage === 'report' && report && (
        <motion.div className="report" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <div className={`report-hero ${report.score >= 70 ? 'good' : report.score >= 40 ? 'mid' : 'bad'}`}>
            <ClipboardCheck size={30} />
            <div className="report-score">{report.score}</div>
            <div className="report-verdict">
              {report.score >= 70
                ? t('interview.reportGood')
                : report.score >= 40
                  ? t('interview.reportMid')
                  : t('interview.reportBad')}
            </div>
          </div>

          <div className="report-parts">
            <div className="report-part">
              <span>{t('interview.partTheory')}</span>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(report.theoryEarned / report.theoryMax) * 100}%` }} /></div>
              <b>{report.theoryEarned} / {report.theoryMax}</b>
            </div>
            <div className="report-part">
              <span>{t('interview.partCode')}</span>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(report.codeEarned / report.codeMax) * 100}%` }} /></div>
              <b>{report.codeEarned} / {report.codeMax}</b>
            </div>
            <div className="report-part">
              <span>{t('interview.partHr')}</span>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${report.hrMax ? (report.hrEarned / report.hrMax) * 100 : 0}%` }} /></div>
              <b>{report.hrEarned} / {report.hrMax}</b>
            </div>
          </div>

          {(() => {
            const weak = [
              ...theoryQs.map((q, i) => ({ q: q.question, s: theoryScores[i] })),
              ...hrQs.map((q, i) => ({ q: q.question, s: hrScores[i] })),
            ].filter((x) => x.s < 2)
            if (weak.length === 0) return null
            return (
              <div className="panel weak-topics">
                <h3>{t('report.topicsTitle')}</h3>
                <ul className="topics-list">
                  {weak.map((w) => <li key={w.q}>{w.q}</li>)}
                </ul>
                <Link to="/weak" className="btn btn-outline btn-sm">{t('report.topicsCta')}</Link>
              </div>
            )
          })()}

          {savedRun && <div className="saved-note">{t('interview.saved')}</div>}

          {companySlug && user && (
            <ReviewForm companySlug={companySlug} />
          )}

          <div className="report-actions">
            <button className="btn btn-outline" onClick={resetRun}><RotateCcw size={15} /> {t('interview.again')}</button>
            <Link className="btn btn-outline" to={`/tasks?level=${level}`}>{t('interview.levelTasks')}</Link>
            <Link className="btn btn-primary" to="/profile"><Home size={15} /> {t('interview.toProfile')}</Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}
