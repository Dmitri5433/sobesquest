import { useMemo } from 'react'
import { motion } from 'framer-motion'
import TerritoryFooter from './TerritoryFooter'

const COLS = 16
const ROWS = 10
const TILE = 38
const PALETTE = ['#1c3b2e', '#15334a', '#22324a', '#1e3d34', '#25314e', '#1b3d45']

/** Детерминированный псевдослучайный шум */
const noise = (r, c) => (((r * 73 + c * 151 + 7) * 31) % 97) / 97

// Фиксированные позиции объектов на карте: [row, col]
const CITY_POSITIONS = { junior: [3, 2], middle: [7, 12], senior: [2, 8] }
const OFFICE_POSITIONS = [
  [6, 3], [2, 13], [8, 5], [4, 10], [7, 7], [1, 4], [8, 13], [5, 6], [3, 5], [6, 11],
]

/**
 * Карта-территория игрока: тайлы расчищаются из тумана войны по мере прогресса.
 * @param {number} solvedCount — решено задач
 * @param {object} unlockedLevels — { junior, middle, senior }
 * @param {Array} unlockedCompanies — открытые компании [{ slug, name, emoji, color }]
 */
export default function TerritoryMap({ solvedCount = 0, unlockedLevels, unlockedCompanies = [] }) {
  const total = COLS * ROWS

  const revealOrder = useMemo(() => {
    const positions = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const dist = Math.hypot(c - (COLS - 1) / 2, r - (ROWS - 1) / 2)
        positions.push({ r, c, score: dist + noise(r, c) * 2.2 })
      }
    }
    positions.sort((a, b) => a.score - b.score)
    return positions
  }, [])

  const revealCount = Math.min(
    total,
    6 + solvedCount * 4 + (unlockedLevels?.middle ? 20 : 0) + (unlockedLevels?.senior ? 30 : 0) + unlockedCompanies.length * 10
  )
  const revealedSet = useMemo(() => {
    const set = new Set()
    for (let i = 0; i < revealCount; i++) {
      const p = revealOrder[i]
      set.add(`${p.r}:${p.c}`)
    }
    return set
  }, [revealCount, revealOrder])

  const cities = useMemo(
    () =>
      Object.entries(CITY_POSITIONS)
        .filter(([levelId]) => unlockedLevels?.[levelId])
        .map(([levelId, [r, c]]) => ({
          r, c,
          emoji: levelId === 'junior' ? '🏘' : levelId === 'middle' ? '🏙' : '🏰',
          label: levelId,
        })),
    [unlockedLevels]
  )

  const offices = useMemo(
    () =>
      unlockedCompanies
        .slice(0, OFFICE_POSITIONS.length)
        .map((company, i) => ({ ...company, r: OFFICE_POSITIONS[i][0], c: OFFICE_POSITIONS[i][1] })),
    [unlockedCompanies]
  )

  const landmarkSet = new Set([
    ...cities.map((x) => `${x.r}:${x.c}`),
    ...offices.map((x) => `${x.r}:${x.c}`),
  ])

  return (
    <div className="territory">
      <svg
        className="territory-svg"
        viewBox={`0 0 ${COLS * TILE} ${ROWS * TILE}`}
        role="img"
        aria-label="Карта освоенной территории"
      >
        {revealOrder.map(({ r, c }, index) => {
          const key = `${r}:${c}`
          const revealed = index < revealCount
          const isLandmark = landmarkSet.has(key)
          return (
            <motion.rect
              key={key}
              x={c * TILE + 2}
              y={r * TILE + 2}
              width={TILE - 4}
              height={TILE - 4}
              rx={7}
              fill={revealed ? PALETTE[Math.floor(noise(r, c) * PALETTE.length)] : 'rgba(255,255,255,0.025)'}
              stroke={revealed ? 'rgba(140,220,255,0.22)' : 'rgba(255,255,255,0.06)'}
              strokeWidth={1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: revealed ? Math.min(index * 0.012, 1.4) : 0 }}
            />
          )
        })}

        {cities.map((city) => (
          <g key={`city-${city.label}`}>
            <text x={city.c * TILE + TILE / 2} y={city.r * TILE + TILE / 2 + 7} textAnchor="middle" fontSize="22">
              {city.emoji}
            </text>
            <text
              x={city.c * TILE + TILE / 2}
              y={city.r * TILE + TILE - 2}
              textAnchor="middle"
              fontSize="9"
              className="map-label"
            >
              {city.label}
            </text>
          </g>
        ))}

        {offices.map((office) => (
          <text
            key={`office-${office.slug}`}
            x={office.c * TILE + TILE / 2}
            y={office.r * TILE + TILE / 2 + 7}
            textAnchor="middle"
            fontSize="18"
          >
            {office.emoji}
          </text>
        ))}
      </svg>

      <TerritoryFooter percent={Math.round((revealCount / total) * 100)} officesCount={offices.length} />
    </div>
  )
}
