export const LEVEL_IDS = ['junior', 'middle', 'senior']

export const LEVELS = {
  junior: {
    id: 'junior',
    name: 'Junior',
    title: 'Начальный уровень',
    color: '#34d399',
    description: 'Основы JavaScript: типы, функции, массивы и первые алгоритмы.',
  },
  middle: {
    id: 'middle',
    name: 'Middle',
    title: 'Средний уровень',
    color: '#fbbf24',
    description: 'Замыкания, глубокие структуры, асинхронность и классические вопросы мидла.',
  },
  senior: {
    id: 'senior',
    name: 'Senior',
    title: 'Продвинутый уровень',
    color: '#f472b6',
    description: 'Кэши, промис-инфраструктура и задачи уровня технического лидa.',
  },
}

export const COMPLETION_THRESHOLD = 0.7

/**
 * Считает прогресс по уровням и разблокировки.
 * @param {Array} tasks — задачи из БД
 * @param {Set<number>} solvedIds — id решённых задач
 */
export function buildProgress(tasks, solvedIds) {
  const published = (tasks || []).filter((t) => t.is_published !== false)

  const byLevel = {}
  for (const levelId of LEVEL_IDS) {
    const list = published.filter((t) => t.level === levelId)
    byLevel[levelId] = {
      total: list.length,
      solved: list.filter((t) => solvedIds.has(t.id)).length,
      earnedXp: list.reduce((sum, t) => sum + (solvedIds.has(t.id) ? t.xp : 0), 0),
      maxXp: list.reduce((sum, t) => sum + t.xp, 0),
    }
  }

  const isLevelCompleted = (levelId) => {
    const level = byLevel[levelId]
    // Пустой уровень (нет задач) не блокирует прогрессию
    return level.total === 0 || level.solved / level.total >= COMPLETION_THRESHOLD
  }

  const unlocked = {
    junior: true,
    middle: isLevelCompleted('junior'),
    senior: isLevelCompleted('junior') && isLevelCompleted('middle'),
  }

  const requiredToComplete = (levelId) => Math.ceil(byLevel[levelId].total * COMPLETION_THRESHOLD)

  const solvedTotal = LEVEL_IDS.reduce((sum, id) => sum + byLevel[id].solved, 0)
  const earnedXp = LEVEL_IDS.reduce((sum, id) => sum + byLevel[id].earnedXp, 0)

  // Уровень игрока для рейтинга/карты: senior открыт только когда открыт
  let currentLevel = 'junior'
  if (unlocked.senior) currentLevel = 'senior'
  else if (unlocked.middle) currentLevel = 'middle'

  return { byLevel, unlocked, isLevelCompleted, requiredToComplete, solvedTotal, earnedXp, currentLevel }
}
