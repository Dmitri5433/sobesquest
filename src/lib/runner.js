import RunnerWorker from '../workers/runnerWorker.js?worker&inline'

const DEFAULT_TIMEOUT_MS = 5000

/**
 * Запускает пользовательский код задачи в Web Worker и проверяет тестами.
 * @param {{ code: string, functionName: string, tests: Array|null, testCode: string|null }} payload
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<{ results: Array, logs: string[], error: string|null, timedOut: boolean, durationMs: number }>}
 */
export function runTests(payload, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return new Promise((resolve) => {
    const worker = new RunnerWorker()
    const startedAt = performance.now()
    let settled = false

    const finish = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      worker.terminate()
      resolve({ ...result, durationMs: Math.round(performance.now() - startedAt) })
    }

    const timer = setTimeout(() => {
      finish({
        results: [],
        logs: [],
        error: null,
        errorCode: 'TIMEOUT',
        timedOut: true,
      })
    }, timeoutMs)

    worker.onmessage = (event) => finish({ timedOut: false, ...event.data })
    worker.onerror = (event) =>
      finish({
        results: [],
        logs: [],
        error: event.message || 'Ошибка выполнения кода',
        timedOut: false,
      })

    worker.postMessage(payload)
  })
}
