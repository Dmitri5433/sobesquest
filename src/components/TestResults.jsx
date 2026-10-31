import { CheckCircle2, XCircle, AlertTriangle, Terminal } from 'lucide-react'
import { useI18n } from '../lib/i18n'

const fmt = (value) => {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

export default function TestResults({ running, result }) {
  const { t } = useI18n()

  if (running) {
    return (
      <div className="test-results">
        <div className="running-row">
          <span className="spinner" /> {t('results.running')}
        </div>
      </div>
    )
  }
  if (!result) return null

  const passed = result.results.filter((r) => r.pass).length
  const total = result.results.length

  const errorText =
    result.errorCode === 'TIMEOUT'
      ? t('results.timeout')
      : result.errorCode === 'NO_FUNCTION'
        ? t('results.noFunction', { name: result.error })
        : result.error

  return (
    <div className="test-results">
      <div className={`results-summary ${total > 0 && passed === total ? 'ok' : 'fail'}`}>
        {(result.timedOut || result.error) && <AlertTriangle size={16} />}
        {total > 0 && (
          <strong>
            {passed === total ? '✔' : '✖'} {t('results.passed', { passed, total })}
          </strong>
        )}
        <span className="results-duration">{result.durationMs} ms</span>
      </div>

      {errorText && (
        <div className="results-error">
          <AlertTriangle size={16} /> {errorText}
        </div>
      )}

      <ul className="results-list">
        {result.results.map((r, i) => (
          <li key={i} className={r.pass ? 'pass' : 'fail'}>
            <span className="test-icon">
              {r.pass ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            </span>
            <div className="test-body">
              <div className="test-title">
                {r.message ? t('results.scenario') : t('results.test', { n: i + 1 })}
                {'args' in r && r.args !== undefined && (
                  <code className="test-args">{fmt(r.args)}</code>
                )}
              </div>
              {!r.pass && (
                <div className="test-diff">
                  {r.error ? (
                    <div>{t('results.errorPrefix')} {r.error}</div>
                  ) : (
                    <>
                      <div>{t('results.expected')} <code>{fmt(r.expected)}</code></div>
                      <div>{t('results.actual')} <code>{fmt(r.actual)}</code></div>
                    </>
                  )}
                </div>
              )}
              {r.pass && r.message && <div className="test-ok-msg">{r.message}</div>}
            </div>
          </li>
        ))}
      </ul>

      {result.logs.length > 0 && (
        <div className="logs-box">
          <div className="logs-title"><Terminal size={14} /> {t('results.console')}</div>
          <pre>{result.logs.join('\n')}</pre>
        </div>
      )}
    </div>
  )
}
