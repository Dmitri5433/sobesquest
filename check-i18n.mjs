// Проверка i18n: все ключи t('...') из кода существуют в обоих словарях
// Запуск: node check-i18n.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

function walk(dir) {
  let files = []
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) files.push(...walk(p))
    else if (/\.jsx?$/.test(f) && !p.includes(join('src', 'i18n'))) files.push(p)
  }
  return files
}

const { ru } = await import(pathToFileURL(join(root, 'src', 'i18n', 'ru.js')).href)
const { en } = await import(pathToFileURL(join(root, 'src', 'i18n', 'en.js')).href)

const used = new Set()
for (const file of walk(join(root, 'src'))) {
  const src = readFileSync(file, 'utf8')
  for (const m of src.matchAll(/\bt\((['"])([^'"]+)\1/g)) used.add(m[2])
}

const missingRu = []
const missingEn = []
for (const key of used) {
  if (!(key in ru)) missingRu.push(key)
  if (!(key in en)) missingEn.push(key)
}
console.log('Всего ключей использовано:', used.size)
console.log('Нет в RU:', missingRu.length ? missingRu : '—')
console.log('Нет в EN:', missingEn.length ? missingEn : '—')
const onlyRu = Object.keys(ru).filter((k) => !(k in en))
const onlyEn = Object.keys(en).filter((k) => !(k in ru))
console.log('Только в RU:', onlyRu.length ? onlyRu : '—')
console.log('Только в EN:', onlyEn.length ? onlyEn : '—')
if (missingRu.length || missingEn.length || onlyRu.length || onlyEn.length) process.exitCode = 1
