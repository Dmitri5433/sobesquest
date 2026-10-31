import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Play, Lightbulb, Eye, EyeOff, Coins, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabaseClient'
import { runTests } from '../lib/runner'
import { LEVELS } from '../lib/progression'
import { useI18n } from '../lib/i18n'
import CodeEditor from '../components/CodeEditor'
import TestResults from '../components/TestResults'
import Discussion from '../components/Discussion'
import { SetupNotice } from '../components/Guards'

export default function TaskPage() {
  const { id } = useParams()
  const { t } = useI18n()
  const { user, markSolved, solvedIds } = useAuth()
  const [task, setTask] = useState(undefined) // undefined = загрузка, null = не найдена
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [openHints, setOpenHints] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [justSolved, setJustSolved] = useState(false)

  useEffect(() => {
    if (!hasSupabase) return
    supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setTask(data ?? null)
        if (data) {
          // Черновик решения сохраняется локально и переживает перезагрузку
          const draft = localStorage.getItem(`sq_draft_${id}`)
          setCode(draft ?? (data.starter_code || ''))
        }
      })
  }, [id])

  const setDraft = (nextCode) => {
    setCode(nextCode)
    if (task) localStorage.setItem(`sq_draft_${task.id}`, nextCode)
  }

  if (!hasSupabase) return <SetupNotice />
  if (task === undefined) {
    return <div className="page-loading"><span className="spinner" /> {t('task.loading')}</div>
  }
  if (task === null) {
    return (
      <div className="setup-notice">
        <h2>{t('task.notFound')}</h2>
        <p>{t('task.notFoundSub')}</p>
        <Link to="/tasks" className="btn btn-outline">{t('task.allTasks')}</Link>
      </div>
    )
  }

  const run = async () => {
    setRunning(true)
    setResult(null)
    const res = await runTests({
      code,
      functionName: task.function_name,
      tests: task.tests,
      testCode: task.test_code,
    })
    setResult(res)
    setRunning(false)

    const allPassed = !res.error && !res.errorCode && !res.timedOut && res.results.length > 0 && res.results.every((r) => r.pass)
    if (allPassed && user && !solvedIds.has(task.id)) {
      await markSolved(task.id)
      setJustSolved(true)
    }
  }

  const level = LEVELS[task.level]
  const allPassed =
    result && !result.error && !result.errorCode && !result.timedOut && result.results.length > 0 && result.results.every((r) => r.pass)
  const alreadySolved = solvedIds.has(task.id)

  return (
    <div className="task-page">
      <Link to="/tasks" className="back-link"><ArrowLeft size={15} /> {t('task.allTasks')}</Link>

      <div className="task-head">
        <div>
          <h1>{task.title}</h1>
          <div className="task-meta">
            <span className="level-badge" style={{ '--level-color': level.color }}>{level.name}</span>
            <span className="task-xp"><Coins size={14} /> {task.xp} XP</span>
            {alreadySolved && <span className="solved-pill">{t('task.solvedPill')}</span>}
          </div>
        </div>
      </div>

      {justSolved && (
        <motion.div className="solve-banner" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 size={18} /> {t('task.solveBanner', { xp: task.xp })}
        </motion.div>
      )}

      <div className="task-layout">
        <div className="task-desc-col">
          <div className="panel">
            <h3>{t('task.condition')}</h3>
            <p className="task-description">{task.description}</p>
            {task.function_name && !task.test_code && (
              <p className="task-fn-hint">{t('task.implementFn', { fn: task.function_name })}</p>
            )}
          </div>

          {task.hints?.length > 0 && (
            <div className="panel">
              <h3><Lightbulb size={16} /> {t('task.hints')}</h3>
              {task.hints.slice(0, openHints).map((hint, i) => (
                <p key={i} className="hint-item"><Lightbulb size={13} className="hint-icon" /> {hint}</p>
              ))}
              {openHints < task.hints.length && (
                <button className="btn btn-sm btn-outline" onClick={() => setOpenHints(openHints + 1)}>
                  {t('task.openHint', { current: openHints + 1, total: task.hints.length })}
                </button>
              )}
            </div>
          )}

          {task.solution_code && (
            <div className="panel">
              <h3>{t('task.solution')}</h3>
              {!showSolution ? (
                <p className="solution-veil">
                  {t('task.solutionVeil')}
                  <button className="btn btn-sm btn-outline" onClick={() => setShowSolution(true)}>
                    <Eye size={14} /> {t('task.showSolution')}
                  </button>
                </p>
              ) : (
                <>
                  <CodeEditor value={task.solution_code} onChange={() => {}} height="auto" readOnly />
                  <button className="btn btn-sm btn-ghost" onClick={() => setShowSolution(false)}>
                    <EyeOff size={14} /> {t('task.hide')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="task-code-col">
          <div className="panel editor-panel">
            <div className="editor-head">
              <span>solution.js · {t('task.draftSaved')}</span>
              <button className="btn btn-primary btn-run" onClick={run} disabled={running}>
                <Play size={15} /> {running ? t('task.running') : t('task.run')}
              </button>
            </div>
            <CodeEditor value={code} onChange={setDraft} />
          </div>
          <TestResults running={running} result={result} />
          {allPassed && !alreadySolved && !user && (
            <div className="guest-note">
              {t('task.guestNote1')}
              <Link to="/login">{t('task.guestNoteLink')}</Link>
              {t('task.guestNote2')}
            </div>
          )}
        </div>
      </div>

      <div className="panel discussion-panel">
        <h3>{t('task.discussion')}</h3>
        <Discussion taskId={task.id} />
      </div>
    </div>
  )
}
