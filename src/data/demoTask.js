/** Демо-задача для главной страницы — работает даже без входа и без Supabase */
export const demoTask = {
  id: 'demo',
  level: 'junior',
  title: 'Демо: сумма двух чисел',
  description:
    'Это пример задачки, которая ждёт испытуемых. Напишите функцию, возвращающую сумму двух чисел, и нажмите «Запустить» — тесты проверят решение прямо в вашем браузере.',
  starterCode: `function sum(a, b) {
  // верните сумму a и b
}`,
  functionName: 'sum',
  tests: [
    { args: [1, 2], expected: 3 },
    { args: [-1, 1], expected: 0 },
    { args: [100, 250], expected: 350 },
  ],
  testCode: null,
  xp: 10,
}

/** Строки для анимации «печати» кода в hero-блоке */
export const heroCodeLines = [
  'function interview(candidate) {',
  "  const skills = ['js', 'algorithms', 'react'];",
  '  return candidate.learn(skills);',
  '}',
  '',
  '// level up. get the offer.',
]
