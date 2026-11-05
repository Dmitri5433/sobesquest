import initSqlJs from 'sql.js'
import { pathToFileURL } from 'node:url'

const wasmUrl = pathToFileURL('public/sql-wasm.wasm').href
const SQL = await initSqlJs({ locateFile: () => wasmUrl })

const setupSql = `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER);
INSERT INTO products (name, price) VALUES ('Ноутбук', 80000), ('Мышь', 1500), ('Кружка', 600);`

const db = new SQL.Database()
db.exec(setupSql)

const tests = [
  { query: 'SELECT name FROM products ORDER BY price ASC', expected: [['Кружка'], ['Мышь'], ['Ноутбук']] },
  { query: 'SELECT wrong_column FROM products', expected: [['x']] },
]

let pass = 0
for (const test of tests) {
  try {
    const res = db.exec(test.query)
    const rows = res.length ? res[0].values : []
    const ok = JSON.stringify(rows) === JSON.stringify(test.expected)
    console.log(ok ? 'OK ' : 'FAIL', JSON.stringify(rows))
    if (ok) pass++
  } catch (e) {
    console.log('EXPECTED-ERROR:', (e.message || '').slice(0, 60))
  }
}
console.log(pass === 1 ? 'SQL-раннер работает верно' : 'ПРОВЕРКА НЕ ПРОЙДЕНА')
