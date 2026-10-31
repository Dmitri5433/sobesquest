// Выполняется внутри Web Worker (инлайнится сборкой Vite через ?worker&inline)

const fmt = (value) => {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function deepEqual(a, b) {
  if (a === b) return true
  if ((a === null || a === undefined) && (b === null || b === undefined)) return true
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every((key) => deepEqual(a[key], b[key]))
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const assert = {
  ok(condition, message) {
    if (!condition) throw new Error(message || 'Ожидание не выполнено')
  },
  equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        `${message || 'Значения не равны'} — получено: ${fmt(actual)}, ожидалось: ${fmt(expected)}`
      )
    }
  },
  deepEqual(actual, expected, message) {
    if (!deepEqual(actual, expected)) {
      throw new Error(
        `${message || 'Значения не совпадают'} — получено: ${fmt(actual)}, ожидалось: ${fmt(expected)}`
      )
    }
  },
  fail(message) {
    throw new Error(message || 'Тест провален')
  },
}

self.onmessage = async (event) => {
  const { code, functionName, tests, testCode } = event.data
  const logs = []
  const fakeConsole = {
    log: (...args) => logs.push(args.map(fmt).join(' ')),
    info: (...args) => logs.push(args.map(fmt).join(' ')),
    warn: (...args) => logs.push('⚠ ' + args.map(fmt).join(' ')),
    error: (...args) => logs.push('✖ ' + args.map(fmt).join(' ')),
  }

  try {
    // Пользовательский код выполняется в теле функции: объявления functions/class
    // видны добавленному return, а параметр console перекрывает глобальный.
    const extract = new Function(
      'console',
      `"use strict";\n${code}\n;return typeof ${functionName} === 'undefined' ? undefined : ${functionName};`
    )
    const fn = extract(fakeConsole)
    if (typeof fn === 'undefined') {
      self.postMessage({ results: [], logs, errorCode: 'NO_FUNCTION', error: functionName })
      return
    }

    const results = []

    if (Array.isArray(tests) && tests.length > 0) {
      for (const test of tests) {
        try {
          const actual = fn(...test.args)
          results.push({
            pass: deepEqual(actual, test.expected),
            args: test.args,
            expected: test.expected,
            actual,
          })
        } catch (err) {
          results.push({
            pass: false,
            args: test.args,
            expected: test.expected,
            error: err?.message || String(err),
          })
        }
      }
    } else if (testCode) {
      try {
        const run = new Function(
          'console',
          'fn',
          'assert',
          'sleep',
          `"use strict";\nreturn (async () => {\n${testCode}\n})();`
        )
        await run(fakeConsole, fn, assert, sleep)
        results.push({ pass: true, message: 'Все проверки пройдены' })
      } catch (err) {
        results.push({ pass: false, message: err?.message || String(err) })
      }
    }

    self.postMessage({ results, logs, error: null })
  } catch (err) {
    self.postMessage({ results: [], logs, error: err?.message || String(err) })
  }
}
