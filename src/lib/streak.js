// Стрики и теплокарта активности по дням (ключ дня — YYYY-MM-DD в локальном времени)

const DAY_MS = 24 * 60 * 60 * 1000

export function dayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date, n) {
  return new Date(date.getTime() + n * DAY_MS)
}

/**
 * @param {string[]} dayKeys — дни активности ('YYYY-MM-DD')
 * @returns {{ current: number, best: number, activeToday: boolean, totalActive: number }}
 */
export function computeStreaks(dayKeys) {
  const days = new Set(dayKeys)
  const today = new Date()
  today.setHours(12, 0, 0, 0) // полдень — защита от сдвига DST при прибавлении дней

  const keyOf = (date) => dayKey(date)

  // Текущий стрик: сегодня или вчера — начало, иначе стрик прерван
  let cursor = null
  if (days.has(keyOf(today))) cursor = today
  else if (days.has(keyOf(addDays(today, -1)))) cursor = addDays(today, -1)

  let current = 0
  while (cursor && days.has(keyOf(cursor))) {
    current += 1
    cursor = addDays(cursor, -1)
  }

  // Лучший стрик: сравниваем дни по календарю (Date.UTC), чтобы переходы
  // часов (DST) не ломали разницу между датами
  const utcDayNumber = (key) => {
    const [y, m, d] = key.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  const sorted = [...days].sort()
  let best = 0
  let run = 0
  let prevUtc = null
  for (const key of sorted) {
    const utc = utcDayNumber(key)
    run = prevUtc !== null && utc - prevUtc === DAY_MS ? run + 1 : 1
    best = Math.max(best, run)
    prevUtc = utc
  }

  return {
    current,
    best,
    activeToday: days.has(keyOf(today)),
    totalActive: days.size,
  }
}
