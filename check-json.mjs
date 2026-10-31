// Проверка всех jsonb-литералов в сид-файле: node check-json.mjs
import { readFileSync } from 'node:fs'
const sql = readFileSync('supabase/migrations/002_seed.sql', 'utf8')
const lines = sql.split('\n')
let checked = 0
let bad = 0
lines.forEach((line, i) => {
  const re = /'((?:[^'\\]|\\.)*)'::jsonb/g
  let m
  while ((m = re.exec(line))) {
    checked++
    try {
      JSON.parse(m[1])
    } catch (e) {
      bad++
      console.log(`СТРОКА ${i + 1}: невалидный JSON — ${e.message}`)
      console.log('  длина захвата:', m[1].length)
      console.log('  конец захвата:', JSON.stringify(m[1].slice(-40)))
      console.log('  ', m[1].slice(0, 120))
    }
  }
})
console.log(`Проверено jsonb-литералов: ${checked}, ошибок: ${bad}`)
if (bad > 0) process.exitCode = 1
