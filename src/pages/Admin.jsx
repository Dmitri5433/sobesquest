import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useI18n } from '../lib/i18n'

const LEVEL_OPTIONS = ['junior', 'middle', 'senior']
const THEORY_OPTIONS = ['junior', 'middle', 'senior', 'hr']

const EMPTY_TASK = {
  level: 'junior',
  title: '',
  description: '',
  starter_code: '',
  function_name: '',
  tests_text: '[\n  { "args": [1, 2], "expected": 3 }\n]',
  test_code: '',
  hints_text: '',
  solution_code: '',
  xp: 10,
  is_published: true,
}

function taskToForm(task) {
  return {
    ...EMPTY_TASK,
    level: task.level,
    title: task.title,
    description: task.description,
    starter_code: task.starter_code || '',
    function_name: task.function_name,
    tests_text: JSON.stringify(task.tests ?? [], null, 2),
    test_code: task.test_code || '',
    hints_text: (task.hints || []).join('\n'),
    solution_code: task.solution_code || '',
    xp: task.xp,
    is_published: task.is_published,
  }
}

function formToTaskPayload(form) {
  let tests = []
  if (form.tests_text.trim()) {
    tests = JSON.parse(form.tests_text)
    if (!Array.isArray(tests)) throw new Error('not-array')
    for (const test of tests) {
      if (!Array.isArray(test.args)) throw new Error('args')
      if (!('expected' in test)) throw new Error('expected')
    }
  }
  return {
    level: form.level,
    title: form.title.trim(),
    description: form.description.trim(),
    starter_code: form.starter_code,
    function_name: form.function_name.trim(),
    tests,
    test_code: form.test_code.trim() || null,
    hints: form.hints_text.split('\n').map((s) => s.trim()).filter(Boolean),
    solution_code: form.solution_code.trim() || null,
    xp: Number(form.xp) || 10,
    is_published: form.is_published,
  }
}

function TaskForm({ initial, onCancel, onSaved }) {
  const { t } = useI18n()
  const [form, setForm] = useState(initial)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    let payload
    try {
      payload = formToTaskPayload(form)
    } catch (parseError) {
      setError(t('admin.errTests', { error: parseError.message }))
      return
    }
    if (!payload.title) return setError(t('admin.errTitle'))
    if (!payload.function_name) return setError(t('admin.errFn'))

    setBusy(true)
    const query = initial.id
      ? supabase.from('tasks').update(payload).eq('id', initial.id)
      : supabase.from('tasks').insert(payload)
    const { error: dbError } = await query
    setBusy(false)
    if (dbError) return setError(dbError.message)
    onSaved()
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="form-row">
        <label className="field">
          <span>{t('admin.level')}</span>
          <select className="input" value={form.level} onChange={set('level')}>
            {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="field grow">
          <span>{t('admin.titleField')}</span>
          <input className="input" value={form.title} onChange={set('title')} />
        </label>
        <label className="field">
          <span>{t('admin.xp')}</span>
          <input className="input" type="number" min={5} max={100} value={form.xp} onChange={set('xp')} />
        </label>
        <label className="field checkbox-field">
          <input type="checkbox" checked={form.is_published} onChange={set('is_published')} />
          <span>{t('admin.published')}</span>
        </label>
      </div>

      <label className="field">
        <span>{t('admin.condition')}</span>
        <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
      </label>

      <div className="form-row">
        <label className="field">
          <span>{t('admin.fnName')}</span>
          <input className="input" value={form.function_name} onChange={set('function_name')} placeholder="sum" />
        </label>
        <label className="field grow">
          <span>{t('admin.hintsLabel')}</span>
          <input className="input" value={form.hints_text} onChange={set('hints_text')} placeholder={t('admin.hintsPh')} />
        </label>
      </div>

      <label className="field">
        <span>{t('admin.starter')}</span>
        <textarea className="input mono" rows={4} value={form.starter_code} onChange={set('starter_code')} />
      </label>

      <label className="field">
        <span>{t('admin.tests')}</span>
        <textarea className="input mono" rows={6} value={form.tests_text} onChange={set('tests_text')} />
      </label>

      <label className="field">
        <span>{t('admin.testCode')}</span>
        <textarea className="input mono" rows={5} value={form.test_code} onChange={set('test_code')} />
      </label>

      <label className="field">
        <span>{t('admin.solution')}</span>
        <textarea className="input mono" rows={5} value={form.solution_code} onChange={set('solution_code')} />
      </label>

      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}><Save size={15} /> {busy ? t('admin.saving') : t('admin.save')}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}><X size={15} /> {t('admin.cancel')}</button>
      </div>
    </form>
  )
}

function TheoryForm({ initial, onCancel, onSaved }) {
  const { t } = useI18n()
  const [form, setForm] = useState(initial)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) return setError(t('admin.errQa'))
    setBusy(true)
    const payload = {
      level: form.level,
      question: form.question.trim(),
      answer: form.answer.trim(),
      is_published: form.is_published,
    }
    const query = initial.id
      ? supabase.from('theory_questions').update(payload).eq('id', initial.id)
      : supabase.from('theory_questions').insert(payload)
    const { error: dbError } = await query
    setBusy(false)
    if (dbError) return setError(dbError.message)
    onSaved()
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="form-row">
        <label className="field">
          <span>{t('admin.category')}</span>
          <select className="input" value={form.level} onChange={set('level')}>
            {THEORY_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="field checkbox-field">
          <input type="checkbox" checked={form.is_published} onChange={set('is_published')} />
          <span>{t('admin.publishedQ')}</span>
        </label>
      </div>
      <label className="field">
        <span>{t('admin.question')}</span>
        <textarea className="input" rows={2} value={form.question} onChange={set('question')} />
      </label>
      <label className="field">
        <span>{t('admin.answer')}</span>
        <textarea className="input" rows={5} value={form.answer} onChange={set('answer')} />
      </label>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}><Save size={15} /> {t('admin.save')}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}><X size={15} /> {t('admin.cancel')}</button>
      </div>
    </form>
  )
}

const EMPTY_THEORY = { level: 'junior', question: '', answer: '', is_published: true }

export default function Admin() {
  const { t } = useI18n()
  const [tab, setTab] = useState('tasks')
  const [tasks, setTasks] = useState(null)
  const [theory, setTheory] = useState(null)
  const [editingTask, setEditingTask] = useState(null) // null | 'new' | form-object
  const [editingTheory, setEditingTheory] = useState(null)

  const load = () => {
    supabase.from('tasks').select('*').order('id').then(({ data }) => setTasks(data || []))
    supabase.from('theory_questions').select('*').order('id').then(({ data }) => setTheory(data || []))
  }
  useEffect(load, [])

  const deleteTask = async (task) => {
    if (!window.confirm(t('admin.delTask', { title: task.title }))) return
    await supabase.from('tasks').delete().eq('id', task.id)
    load()
  }
  const deleteTheory = async (item) => {
    if (!window.confirm(t('admin.delQuestion'))) return
    await supabase.from('theory_questions').delete().eq('id', item.id)
    load()
  }

  return (
    <div className="admin-page">
      <div className="page-head">
        <h1>{t('admin.title')}</h1>
        <p>{t('admin.sub')}</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
          {t('admin.tabTasks')} {tasks ? `(${tasks.length})` : ''}
        </button>
        <button className={`tab ${tab === 'theory' ? 'active' : ''}`} onClick={() => setTab('theory')}>
          {t('admin.tabTheory')} {theory ? `(${theory.length})` : ''}
        </button>
      </div>

      {tab === 'tasks' && (
        <>
          {editingTask && (
            <div className="panel">
              <h3>{editingTask.id ? t('admin.editTask', { title: editingTask.title }) : t('admin.newTask')}</h3>
              <TaskForm
                initial={editingTask.id ? editingTask : EMPTY_TASK}
                onCancel={() => setEditingTask(null)}
                onSaved={() => { setEditingTask(null); load() }}
              />
            </div>
          )}
          <button className="btn btn-primary" onClick={() => setEditingTask('new')}>
            <Plus size={15} /> {t('admin.addTask')}
          </button>
          <div className="table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>{t('admin.thId')}</th>
                  <th>{t('admin.thTitle')}</th>
                  <th>{t('admin.thLevel')}</th>
                  <th>{t('admin.thXp')}</th>
                  <th>{t('admin.thStatus')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(tasks || []).map((task) => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.title}</td>
                    <td>{task.level}</td>
                    <td>{task.xp}</td>
                    <td>{task.is_published ? t('admin.published') : t('admin.draft')}</td>
                    <td className="row-actions">
                      <button
                        className="icon-btn"
                        onClick={() => setEditingTask({ ...taskToForm(task), id: task.id, title: task.title })}
                        title={t('admin.editTask', { title: task.title })}
                      >
                        <Pencil size={15} />
                      </button>
                      <button className="icon-btn danger" onClick={() => deleteTask(task)} title={t('admin.delQuestion')}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'theory' && (
        <>
          {editingTheory && (
            <div className="panel">
              <h3>{editingTheory.id ? t('admin.editQuestion') : t('admin.newQuestion')}</h3>
              <TheoryForm
                initial={editingTheory.id ? editingTheory : EMPTY_THEORY}
                onCancel={() => setEditingTheory(null)}
                onSaved={() => { setEditingTheory(null); load() }}
              />
            </div>
          )}
          <button className="btn btn-primary" onClick={() => setEditingTheory('new')}>
            <Plus size={15} /> {t('admin.addQuestion')}
          </button>
          <div className="table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>{t('admin.thId')}</th>
                  <th>{t('admin.thQuestion')}</th>
                  <th>{t('admin.thCategory')}</th>
                  <th>{t('admin.thStatus')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(theory || []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td className="theory-cell">{item.question}</td>
                    <td>{item.level}</td>
                    <td>{item.is_published ? t('admin.publishedQ') : t('admin.draft')}</td>
                    <td className="row-actions">
                      <button className="icon-btn" onClick={() => setEditingTheory({ ...item })} title={t('admin.editQuestion')}>
                        <Pencil size={15} />
                      </button>
                      <button className="icon-btn danger" onClick={() => deleteTheory(item)} title={t('admin.delQuestion')}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
