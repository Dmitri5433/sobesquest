import { readFileSync } from 'node:fs'
import pkg from 'node-sql-parser'
const { Parser } = pkg
const parser = new Parser()
for (const f of ['001_schema.sql', '002_seed.sql', '003_forum.sql', '004_activity.sql']) {
  const sql = readFileSync(`supabase/migrations/${f}`, 'utf8')
  try {
    parser.astify(sql, { database: 'postgresql' })
    console.log(`OK: ${f}`)
  } catch (e) {
    console.log(`ОШИБКА в ${f}:`, String(e.message).slice(0, 300))
  }
}
