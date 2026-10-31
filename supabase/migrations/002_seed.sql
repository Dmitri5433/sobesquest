-- ============================================================
-- SobesQuest — наполнение контентом
-- Выполните ПОСЛЕ 001_schema.sql
-- Повторный запуск безопасен: сначала чистится сид-контент.
-- ВНИМАНИЕ: перезапись удалит и решения/обсуждения игроков.
-- ============================================================

delete from public.reviews;
delete from public.theory_questions;
delete from public.interview_runs;
delete from public.solves;
delete from public.tasks;
delete from public.companies;
-- Комментарии не удаляем явно: таблица comments создаётся в 003_forum.sql,
-- а при её наличии записи чистятся каскадом вместе с задачами.

-- ---------- Компании ----------
insert into public.companies (slug, name, emoji, color, tagline, description, required_level, questions, sort_order) values
('ozon-intern', 'Ozon · Стажировка', '🚀', '#005bff', 'Первый шаг в большую разработку',
 $t$Стажировка в одном из крупнейших российских e-commerce. От вас ждут базовой алгоритмической подготовки, знания одного языка и огромного желания учиться. Собеседование дружелюбное: сначала короткая теория, затем простая задача.$t$,
 'junior', '["Расскажите про свой учебный или пет-проект: что было самым сложным?", "Почему выбрали именно разработку?"]'::jsonb, 1),
('avito', 'Avito', '🛒', '#00aaff', 'Классифицированный гигант',
 $t$Avito ценит продуктовое мышление и чистый код. На собеседовании спросят основы JavaScript и попросят решить практическую задачу уровняJunior-.$t$,
 'junior', '["Как вы тестируете свой код?", "Что для вас важнее: быстро сделать фичу или красиво отрефакторить?"]'::jsonb, 2),
('tbank', 'Т-Банк', '🟡', '#ffdd2d', 'Технологии на грани финтеха',
 $t$Т-Банк известен сильным комьюнити инженеров. Собеседование на джуна начинается с базы: типы, функции, массивы — и обязательно одна задачка на логику.$t$,
 'junior', '["Какой вклад вы можете внести в команду в первые месяцы?"]'::jsonb, 3),
('yandex', 'Яндекс', '🔎', '#fc3f1d', 'Собеседование с алгоритмами',
 $t$Классика собеседований: алгоритмическая секция с live-coding, вопросы про event loop и браузер. Готовьтесь объяснять сложность своего решения.$t$,
 'middle', '["Оцените сложность вашего решения. Можно ли лучше?", "Как вы отлаживаете баг, который воспроизводится раз в неделю?"]'::jsonb, 4),
('vk', 'VK', '💬', '#0077ff', 'Соцсеть и сервисы на миллионы пользователей',
 $t$В VK спросят про асинхронность, промисы и работу с DOM. Миддам любят предлагать задачи на реализации встроенных механизмов: debounce, кэш, подписки.$t$,
 'middle', '["Расскажите про самый нагруженный сервис, который вы разрабатывали.", "Как бы вы спроектировали бесконечную ленту новостей?"]'::jsonb, 5),
('sber', 'Сбер', '💚', '#21a038', 'Финтех в масштабе страны',
 $t$Сбер переходит на собственные технологии и активно нанимает разработчиков. Ожидают уверенного владения JavaScript и понимания CI/CD.$t$,
 'middle', '["Что вы знаете о работе в regulated-индустрии, где важны релизные циклы и безопасность?"]'::jsonb, 6),
('wildberries', 'Wildberries', '🟣', '#cb11ab', 'Маркетплейс №1',
 $t$WB растёт стремительно, и команда разработки вместе с ним. Собеседование практичное: реальные задачи с витриной и корзиной, немного теории.$t$,
 'middle', '["Как бы вы оптимизировали страницу каталога с 10 000 товаров?"]'::jsonb, 7),
('google', 'Google', '🌐', '#4285f4', 'Собеседование мечты',
 $t$Легендарные interviews: структура, сложность O(n), системные вопросы. Сеньорам предлагают спроектировать компонент целиком и спрашивают про trade-offs каждого решения.$t$,
 'senior', '["Спроектируйте автодополнение поиска для миллиона пользователей. С чего начнёте?", "Расскажите о самом технически сложном решении в вашей карьере."] '::jsonb, 8),
('meta', 'Meta', '♾️', '#0668e1', 'Move fast, но с корнями',
 $t$Meta спрашивает глубокое понимание JavaScript, React и производительности. Будьте готовы к задачам на структуры данных и к вопросу «а что если пользователей в тысячу раз больше?».$t$,
 'senior', '["Как бы вы профилировали и ускорили медленный React-рендер?", "Расскажите про случай, когда вы были не согласны с решением команды."] '::jsonb, 9),
('amazon', 'Amazon', '📦', '#ff9900', 'Customer obsession',
 $t$Amazon ведёт собеседования по leadership principles: половина вопросов — про поведение и опыт, половина — про техническую глубину и дизайн систем.$t$,
 'senior', '["Расскажите о случае, когда вы взяли на себя ответственность за чужую ошибку.", "Как бы вы спроектировали систему доставки уведомлений в реальном времени?"]'::jsonb, 10);

-- ---------- Задачи: JUNIOR ----------
insert into public.tasks (level, title, description, starter_code, function_name, tests, hints, solution_code, xp, is_published) values
('junior', 'Сумма двух чисел',
 $t$Напишите функцию, которая возвращает сумму двух чисел.$t$,
 $t$function sum(a, b) {
  // верните сумму a и b
}$t$, 'sum',
 '[{"args":[1,2],"expected":3},{"args":[-1,1],"expected":0},{"args":[100,250],"expected":350}]'::jsonb,
 '["return a + b;"]'::jsonb,
 $t$function sum(a, b) {
  return a + b;
}$t$, 10, true),

('junior', 'Разворот строки',
 $t$Напишите функцию, которая принимает строку и возвращает её в обратном порядке.$t$,
 $t$function reverseString(str) {
  // переверните строку
}$t$, 'reverseString',
 '[{"args":["привет"],"expected":"тевирп"},{"args":["JS"],"expected":"SJ"},{"args":[""],"expected":""}]'::jsonb,
 '["Строку можно превратить в массив методом split(\"\")", "у массива есть метод reverse()"]'::jsonb,
 $t$function reverseString(str) {
  return str.split('').reverse().join('');
}$t$, 10, true),

('junior', 'FizzBuzz',
 $t$Классика собеседований. Верните массив строк от 1 до n, где числа кратные 3 заменены на Fizz, кратные 5 — на Buzz, а кратные 15 — на FizzBuzz. Остальные числа — строки.$t$,
 $t$function fizzBuzz(n) {
  // соберите массив по правилам FizzBuzz
}$t$, 'fizzBuzz',
 '[{"args":[3],"expected":["1","2","Fizz"]},{"args":[5],"expected":["1","2","Fizz","4","Buzz"]},{"args":[15],"expected":["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]}]'::jsonb,
 '["Проверяйте кратность 15 до проверок 3 и 5"]'::jsonb,
 $t$function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push('FizzBuzz');
    else if (i % 3 === 0) out.push('Fizz');
    else if (i % 5 === 0) out.push('Buzz');
    else out.push(String(i));
  }
  return out;
}$t$, 15, true),

('junior', 'Максимум в массиве',
 $t$Верните наибольшее число из массива. Для пустого массива верните undefined.$t$,
 $t$function findMax(arr) {
  // найдите максимум
}$t$, 'findMax',
 '[{"args":[[3,7,2]],"expected":7},{"args":[[-5,-1,-9]],"expected":-1},{"args":[[42]],"expected":42},{"args":[[]],"expected":null}]'::jsonb,
 '["Math.max принимает числа через запятую: Math.max(...arr)"]'::jsonb,
 $t$function findMax(arr) {
  if (arr.length === 0) return undefined;
  return Math.max(...arr);
}$t$, 10, true),

('junior', 'Палиндром',
 $t$Определите, читается ли строка одинаково в обе стороны. Пробелы игнорируйте, регистр не важен.$t$,
 $t$function isPalindrome(str) {
  // проверьте палиндром
}$t$, 'isPalindrome',
 '[{"args":["шалаш"],"expected":true},{"args":["привет"],"expected":false},{"args":["А роза упала на лапу Азора"],"expected":true}]'::jsonb,
 '["Сначала приведите строку к нижнему регистру и уберите пробелы", "Сравните строку с её разворотом"]'::jsonb,
 $t$function isPalindrome(str) {
  const clean = str.toLowerCase().replace(/\s+/g, '');
  return clean === clean.split('').reverse().join('');
}$t$, 15, true),

('junior', 'Количество гласных',
 $t$Посчитайте количество гласных букв в строке. Гласные: а е ё и о у ы э ю я a e i o u. Регистр не важен.$t$,
 $t$function countVowels(str) {
  // посчитайте гласные
}$t$, 'countVowels',
 '[{"args":["привет"],"expected":2},{"args":["JavaScript"],"expected":3},{"args":["брр"],"expected":0}]'::jsonb,
 '["Можно идти по строке циклом и проверять вхождение буквы в строку гласных", "Или использовать match с регулярным выражением"]'::jsonb,
 $t$function countVowels(str) {
  const vowels = 'аеёиоуыэюяaeiou';
  let count = 0;
  for (const ch of str.toLowerCase()) {
    if (vowels.includes(ch)) count++;
  }
  return count;
}$t$, 10, true),

('junior', 'Факториал',
 $t$Верните факториал числа n. Факториал нуля равен единице.$t$,
 $t$function factorial(n) {
  // вычислите n!
}$t$, 'factorial',
 '[{"args":[5],"expected":120},{"args":[0],"expected":1},{"args":[7],"expected":5040}]'::jsonb,
 '["Можно решить циклом, а можно рекурсией: n! = n * (n-1)!"]'::jsonb,
 $t$function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}$t$, 15, true),

('junior', 'Число Фибоначчи',
 $t$Верните n-е число Фибоначчи. Ряд начинается с fib(0) = 0, fib(1) = 1, fib(2) = 1 и так далее.$t$,
 $t$function fib(n) {
  // верните n-е число Фибоначчи
}$t$, 'fib',
 '[{"args":[0],"expected":0},{"args":[1],"expected":1},{"args":[7],"expected":13},{"args":[10],"expected":55}]'::jsonb,
 '["Достаточно линейного решения с двумя переменными"]'::jsonb,
 $t$function fib(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}$t$, 20, true),

('junior', 'Среднее арифметическое',
 $t$Верните среднее арифметическое чисел массива, округлённое до двух знаков после запятой. Для пустого массива верните 0.$t$,
 $t$function average(arr) {
  // посчитайте среднее
}$t$, 'average',
 '[{"args":[[1,2,3]],"expected":2},{"args":[[1,2]],"expected":1.5},{"args":[[1,1,2]],"expected":1.33},{"args":[[]],"expected":0}]'::jsonb,
 '["Сумму массива удобно считать через reduce", "Округление: Math.round(x * 100) / 100"]'::jsonb,
 $t$function average(arr) {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc, x) => acc + x, 0);
  return Math.round((sum / arr.length) * 100) / 100;
}$t$, 10, true),

('junior', 'Удаление дубликатов',
 $t$Верните массив без дубликатов, сохранив порядок первых вхождений.$t$,
 $t$function unique(arr) {
  // уберите дубликаты
}$t$, 'unique',
 '[{"args":[[1,1,2,2,3]],"expected":[1,2,3]},{"args":[["a","b","a"]],"expected":["a","b"]},{"args":[[]],"expected":[]}]'::jsonb,
 '["Set хранит только уникальные значения", "Проверьте [...new Set(arr)]"]'::jsonb,
 $t$function unique(arr) {
  return [...new Set(arr)];
}$t$, 15, true);

-- ---------- Задачи: MIDDLE ----------
insert into public.tasks (level, title, description, starter_code, function_name, tests, test_code, hints, solution_code, xp, is_published) values
('middle', 'Плоский массив (flatten)',
 $t$Напишите функцию, которая превращает массив любой глубины вложенности в плоский массив. Метод Array.prototype.flat(Infinity) использовать нельзя — покажите алгоритм.$t$,
 $t$function flatten(arr) {
  // соберите все элементы в один уровень
}$t$, 'flatten',
 '[{"args":[[1,[2,[3,4]],5]],"expected":[1,2,3,4,5]},{"args":[[]],"expected":[]},{"args":[[[],[1]]],"expected":[1]}]'::jsonb,
 null,
 '["Рекурсия — самый естественный путь", "Если элемент — массив, добавьте результат его flatten"]'::jsonb,
 $t$function flatten(arr) {
  const out = [];
  for (const item of arr) {
    if (Array.isArray(item)) out.push(...flatten(item));
    else out.push(item);
  }
  return out;
}$t$, 20, true),

('middle', 'Разбиение на чанки',
 $t$Разбейте массив на подмассивы фиксированного размера. Последний чанк может быть меньше.$t$,
 $t$function chunk(arr, size) {
  // разбейте массив на части
}$t$, 'chunk',
 '[{"args":[[1,2,3,4,5],2],"expected":[[1,2],[3,4],[5]]},{"args":[[1,2,3,4],3],"expected":[[1,2,3],[4]]},{"args":[[],2],"expected":[]}]'::jsonb,
 null,
 '["Идите по массиву с шагом size и делайте срезы slice(i, i + size)"]'::jsonb,
 $t$function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}$t$, 15, true),

('middle', 'Группировка по ключу',
 $t$Сгруппируйте массив объектов по значению указанного поля. Результат — объект, где ключи — значения поля, а значения — массивы исходных объектов.$t$,
 $t$function groupByKey(arr, key) {
  // сгруппируйте объекты
}$t$, 'groupByKey',
 '[{"args":[[{"name":"Анна","city":"MSK"},{"name":"Борис","city":"SPB"},{"name":"Вера","city":"MSK"}],"city"],"expected":{"MSK":[{"name":"Анна","city":"MSK"},{"name":"Вера","city":"MSK"}],"SPB":[{"name":"Борис","city":"SPB"}]}},{"args":[[{"id":1,"done":false},{"id":2,"done":true}],"done"],"expected":{"false":[{"id":1,"done":false}],"true":[{"id":2,"done":true}]}}]'::jsonb,
 null,
 '["Заведите accumulator-объект и раскладывайте элементы по ключу item[key]"]'::jsonb,
 $t$function groupByKey(arr, key) {
  const out = {};
  for (const item of arr) {
    (out[item[key]] ??= []).push(item);
  }
  return out;
}$t$, 20, true),

('middle', 'Глубокое сравнение (deepEqual)',
 $t$Реализуйте deepEqual(a, b) — полное сравнение значений любой вложенности: примитивов, массивов и объектов. Порядок ключей объектов не важен.$t$,
 $t$function deepEqual(a, b) {
  // сравните значения рекурсивно
}$t$, 'deepEqual',
 '[{"args":[[1,2],[1,2]],"expected":true},{"args":[[1,2],[2,1]],"expected":false},{"args":[[{"a":[1,{"b":2}]}],[{"a":[1,{"b":2}]}]],"expected":true},{"args":[["x","y"],["x","z"]],"expected":false}]'::jsonb,
 null,
 '["Сначала быстрый путь: a === b", "Если оба объекта или массива — сравните количество ключей и пройдитесь рекурсивно"]'::jsonb,
 $t$function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((key) => deepEqual(a[key], b[key]));
}$t$, 25, true),

('middle', 'Глубокое клонирование (deepClone)',
 $t$Реализуйте deepClone(value), создающий полную независимую копию объекта любой вложенности. В тестах проверяется, что вложенные объекты — не ссылки на оригинал.$t$,
 $t$function deepClone(value) {
  // создайте независимую копию
}$t$, 'deepClone',
 '[]'::jsonb,
 $code$const original = { a: 1, b: { c: [1, 2, { d: 'x' }] } };
const copy = fn(original);
assert.deepEqual(copy, original, 'клон должен совпадать по структуре');
assert.notEqual(copy.b, original.b, 'вложенные объекты не должны быть ссылкой');
copy.b.c[2].d = 'y';
assert.equal(original.b.c[2].d, 'x', 'изменение клона не должно затрагивать оригинал');$code$,
 '["Рекурсия: для объекта пройдитесь по его ключам и скопируйте каждый", "Для массивов — создайте новый массив и скопируйте элементы"]'::jsonb,
 $t$function deepClone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const out = {};
  for (const key of Object.keys(value)) out[key] = deepClone(value[key]);
  return out;
}$t$, 25, true),

('middle', 'snake_case → camelCase',
 $t$Преобразуйте строку из snake_case в camelCase. Например: my_var_name → myVarName.$t$,
 $t$function snakeToCamel(str) {
  // преобразуйте строку
}$t$, 'snakeToCamel',
 '[{"args":["snake_case"],"expected":"snakeCase"},{"args":["my_var_name"],"expected":"myVarName"},{"args":["already"],"expected":"already"},{"args":["a_b_c"],"expected":"aBC"}]'::jsonb,
 null,
 '["Разбейте строку по подчёркиваниям, первую часть оставьте как есть, остальные — с заглавной буквы"]'::jsonb,
 $t$function snakeToCamel(str) {
  return str
    .split('_')
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('');
}$t$, 15, true),

('middle', 'Анаграммы',
 $t$Определите, являются ли две строки анаграммами: состоят из одних и тех же букв. Регистр и пробелы не важны.$t$,
 $t$function isAnagram(a, b) {
  // сравните состав букв
}$t$, 'isAnagram',
 '[{"args":["листок","столик"],"expected":true},{"args":["кот","ток"],"expected":true},{"args":["кот","код"],"expected":false},{"args":["Апельсин","спаниель"],"expected":true}]'::jsonb,
 null,
 '["Приведите строки к нижнему регистру и уберите пробелы", "Отсортируйте буквы и сравните результаты"]'::jsonb,
 $t$function isAnagram(a, b) {
  const norm = (s) => s.toLowerCase().replace(/\s+/g, '').split('').sort().join('');
  return norm(a) === norm(b);
}$t$, 15, true),

('middle', 'Пропущенное число',
 $t$Массив содержит числа от 1 до n+1, но одно число потерялось. Найдите его за O(n) без сортировки.$t$,
 $t$function findMissing(arr) {
  // найдите пропущенное число
}$t$, 'findMissing',
 '[{"args":[[1,2,4,5]],"expected":3},{"args":[[3,1,2,5,6]],"expected":4},{"args":[[2]],"expected":1},{"args":[[1]],"expected":2}]'::jsonb,
 null,
 '["Сумма чисел от 1 до n+1 считается формулой (n+1)(n+2)/2", "Вычтите из неё сумму массива"]'::jsonb,
 $t$function findMissing(arr) {
  const n = arr.length + 1;
  const expectedSum = (n * (n + 1)) / 2;
  const actualSum = arr.reduce((acc, x) => acc + x, 0);
  return expectedSum - actualSum;
}$t$, 20, true),

('middle', 'Debounce',
 $t$Реализуйте debounce(func, wait) — обёртку, которая вызывает func только после того, как с последнего вызова обёртки прошло wait миллисекунд. Каждая новая серия вызовов сбрасывает таймер.$t$,
 $t$function debounce(func, wait) {
  // верните обёртку с отложенным вызовом
}$t$, 'debounce',
 '[]'::jsonb,
 $code$let calls = 0;
const inc = debounce(() => { calls += 1; }, 80);
inc(); inc(); inc();
await sleep(40);
assert.equal(calls, 0, 'до истечения задержки вызова быть не должно');
await sleep(80);
assert.equal(calls, 1, 'должен случиться ровно один вызов');
inc();
await sleep(120);
assert.equal(calls, 2, 'после новой серии — ещё один вызов');$code$,
 '["Храните id таймера в замыкании", "Перед каждым вызовом сбрасывайте таймер clearTimeout"]'::jsonb,
 $t$function debounce(func, wait) {
  let timerId = null;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => func.apply(this, args), wait);
  };
}$t$, 30, true),

('middle', 'EventEmitter',
 $t$Реализуйте класс EventEmitter с методами: on(event, callback) — подписка, off(event, callback) — отписка, emit(event, ...args) — вызов всех подписчиков события.$t$,
 $t$class EventEmitter {
  // on, off, emit
}$t$, 'EventEmitter',
 '[]'::jsonb,
 $code$const em = new EventEmitter();
let total = 0;
const add = (v) => { total += v; };
em.on('add', add);
em.emit('add', 5);
assert.equal(total, 5, 'подписчик должен получить событие');
em.off('add', add);
em.emit('add', 5);
assert.equal(total, 5, 'после отписки событий быть не должно');
em.on('add', add);
em.emit('add', 10);
assert.equal(total, 15, 'после повторной подписки события снова работают');$code$,
 '["Внутри — объект-карта: имя события → массив обработчиков", "emit пробегает по массиву обработчиков и вызывает каждый с аргументами"]'::jsonb,
 $t$class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(event, cb) {
    (this.listeners[event] ??= []).push(cb);
    return this;
  }
  off(event, cb) {
    this.listeners[event] = (this.listeners[event] || []).filter((h) => h !== cb);
    return this;
  }
  emit(event, ...args) {
    for (const cb of this.listeners[event] || []) cb(...args);
    return this;
  }
}$t$, 30, true);

-- ---------- Задачи: SENIOR ----------
insert into public.tasks (level, title, description, starter_code, function_name, tests, test_code, hints, solution_code, xp, is_published) values
('senior', 'LRU-кэш',
 $t$Реализуйте класс LRUCache(capacity) с методами get(key) и put(key, value). Кэш хранит не более capacity записей; при переполнении удаляется наименее недавно использованная запись. Обращение get к записи делает её «недавно использованной».$t$,
 $t$class LRUCache {
  constructor(capacity) {
    // ваш код
  }
  get(key) {
    // ваш код
  }
  put(key, value) {
    // ваш код
  }
}$t$, 'LRUCache',
 '[]'::jsonb,
 $code$const cache = new LRUCache(2);
cache.put(1, 'a');
cache.put(2, 'b');
assert.equal(cache.get(1), 'a', 'ключ 1 должен читаться');
cache.put(3, 'c');
assert.equal(cache.get(2), undefined, 'ключ 2 должен быть вытеснен');
assert.equal(cache.get(1), 'a', 'ключ 1 должен остаться');
cache.put(1, 'a2');
assert.equal(cache.get(1), 'a2', 'put по существующему ключу обновляет значение');$code$,
 '["Встроенная Map помнит порядок вставки — используйте её", "При get/put обновлении удаляйте ключ и добавляйте заново, чтобы он стал «самым свежим»"]'::jsonb,
 $t$class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      this.map.delete(this.map.keys().next().value);
    }
  }
}$t$, 35, true),

('senior', 'Throttle',
 $t$Реализуйте throttle(func, wait) — обёртку, которая пропускает не более одного вызова func за каждые wait миллисекунд. Первый вызов серии выполняется сразу, остальные игнорируются до истечения интервала.$t$,
 $t$function throttle(func, wait) {
  // верните обёртку с ограничением частоты
}$t$, 'throttle',
 '[]'::jsonb,
 $code$let calls = 0;
const tick = throttle(() => { calls += 1; }, 90);
tick(); tick(); tick();
assert.equal(calls, 1, 'первый вызов проходит сразу');
await sleep(100);
tick();
assert.equal(calls, 2, 'после интервала снова проходит один вызов');$code$,
 '["Храните время последнего вызова в замыкании", "Если прошло меньше wait — просто игнорируйте вызов"]'::jsonb,
 $t$function throttle(func, wait) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}$t$, 35, true),

('senior', 'Пул промисов с ограничением',
 $t$Реализуйте runPool(taskFactories, limit), который выполняет асинхронные задачи параллельно, но не более limit одновременно, и возвращает массив результатов в порядке исходных задач. taskFactories — массив функций, каждая возвращает Promise.$t$,
 $t$async function runPool(taskFactories, limit) {
  // выполняйте задачи не более limit одновременно
}$t$, 'runPool',
 '[]'::jsonb,
 $code$let active = 0, maxActive = 0;
const makeTask = () => async () => {
  active += 1;
  maxActive = Math.max(maxActive, active);
  await sleep(60);
  active -= 1;
  return 'ok';
};
const results = await runPool([makeTask(), makeTask(), makeTask(), makeTask(), makeTask()], 2);
assert.deepEqual(results, ['ok','ok','ok','ok','ok'], 'все задачи должны выполниться по порядку');
assert.equal(maxActive, 2, 'не больше 2 задач одновременно');$code$,
 '["Запустите первые limit задач, по завершении каждой запускайте следующую", "Обёртка вокруг задачи, которая по завершении запускает следующую из очереди — простой путь"]'::jsonb,
 $t$async function runPool(taskFactories, limit) {
  const results = new Array(taskFactories.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < taskFactories.length) {
      const index = nextIndex++;
      results[index] = await taskFactories[index]();
    }
  }
  const workers = [];
  for (let i = 0; i < Math.min(limit, taskFactories.length); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}$t$, 40, true),

('senior', 'Глубокое слияние объектов (mergeDeep)',
 $t$Реализуйте mergeDeep(a, b), который возвращает новый объект: значения b перекрывают a, а вложенные объекты сливаются рекурсивно. Исходные объекты изменять нельзя.$t$,
 $t$function mergeDeep(a, b) {
  // слейте объекты рекурсивно
}$t$, 'mergeDeep',
 '[{"args":[{"a":{"x":1,"y":2},"b":1},{"a":{"y":3}}],"expected":{"a":{"x":1,"y":3},"b":1}},{"args":[{"x":1},{"x":2,"y":2}],"expected":{"x":2,"y":2}},{"args":[{},{"a":{"b":{"c":1}}}],"expected":{"a":{"b":{"c":1}}}}]'::jsonb,
 null,
 '["Копируйте a, затем для каждого ключа b решайте: оба значения — объекты? тогда mergeDeep рекурсивно, иначе берём b"]'::jsonb,
 $t$function mergeDeep(a, b) {
  const out = { ...a };
  for (const key of Object.keys(b)) {
    if (typeof a[key] === 'object' && typeof b[key] === 'object' && a[key] !== null && b[key] !== null && !Array.isArray(a[key]) && !Array.isArray(b[key])) {
      out[key] = mergeDeep(a[key], b[key]);
    } else {
      out[key] = b[key];
    }
  }
  return out;
}$t$, 30, true),

('senior', 'Мемоизация с TTL',
 $t$Реализуйте memoizeTtl(func, ttl), кэширующую результаты func по аргументам, но «протухающие» через ttl миллисекунд. После истечения TTL функция вызывается заново.$t$,
 $t$function memoizeTtl(func, ttl) {
  // верните мемоизированную обёртку
}$t$, 'memoizeTtl',
 '[]'::jsonb,
 $code$let calls = 0;
const heavy = (x) => { calls += 1; return x * 2; };
const memo = memoizeTtl(heavy, 100);
assert.equal(memo(5), 10, 'первый вызов вычисляется');
assert.equal(memo(5), 10, 'второй вызов из кэша');
assert.equal(calls, 1, 'функция должна вызваться один раз');
await sleep(140);
assert.equal(memo(5), 10, 'после TTL ответ правильный');
assert.equal(calls, 2, 'после истечения TTL функция вызывается заново');$code$,
 '["Ключ кэша — JSON.stringify аргументов", "Храните в кэше и значение, и время записи"]'::jsonb,
 $t$function memoizeTtl(func, ttl) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    const hit = cache.get(key);
    const now = Date.now();
    if (hit && now - hit.time < ttl) return hit.value;
    const value = func.apply(this, args);
    cache.set(key, { value, time: now });
    return value;
  };
}$t$, 35, true),

('senior', 'Observable',
 $t$Реализуйте класс Observable с методами: subscribe(callback) возвращает объект с методом unsubscribe(), а emit(value) рассылает значение всем активным подписчикам.$t$,
 $t$class Observable {
  // subscribe и emit
}$t$, 'Observable',
 '[]'::jsonb,
 $code$const obs = new Observable();
const seen = [];
const sub = obs.subscribe((v) => seen.push(v));
obs.emit(1);
obs.emit(2);
assert.deepEqual(seen, [1, 2], 'подписчик получает значения');
sub.unsubscribe();
obs.emit(3);
assert.equal(seen.length, 2, 'после отписки значения не приходят');$code$,
 '["Храните Set подписчиков: add при subscribe, delete при unsubscribe", "emit просто пробегает по подписчикам"]'::jsonb,
 $t$class Observable {
  constructor() {
    this.subscribers = new Set();
  }
  subscribe(callback) {
    this.subscribers.add(callback);
    return {
      unsubscribe: () => this.subscribers.delete(callback),
    };
  }
  emit(value) {
    for (const cb of this.subscribers) cb(value);
  }
}$t$, 35, true),

('senior', 'Сумма дерева',
 $t$Дано дерево узлов вида { value: number, children?: Node[] }. Верните сумму value всех узлов. Дерево может быть любой глубины.$t$,
 $t$function treeSum(node) {
  // обойдите дерево
}$t$, 'treeSum',
 '[{"args":[{"value":1,"children":[{"value":2},{"value":3,"children":[{"value":4}]}]}],"expected":10},{"args":[{"value":5}],"expected":5},{"args":[{"value":0,"children":[]}],"expected":0}]'::jsonb,
 null,
 '["Рекурсия: сумма узла = его value плюс сумма детей"]'::jsonb,
 $t$function treeSum(node) {
  let sum = node.value;
  for (const child of node.children || []) {
    sum += treeSum(child);
  }
  return sum;
}$t$, 25, true),

('senior', 'Свой Promise.all',
 $t$Реализуйте promiseAll(iterables) — аналог Promise.all: принимает массив промисов и значений, возвращает Promise с массивом результатов в исходном порядке. При первой же ошибке Promise должен отклониться с исходной ошибкой.$t$,
 $t$function promiseAll(iterables) {
  // верните Promise с массивом результатов
}$t$, 'promiseAll',
 '[]'::jsonb,
 $code$const [a, b, c] = await promiseAll([
  Promise.resolve(1),
  sleep(50).then(() => 2),
  3,
]);
assert.deepEqual([a, b, c], [1, 2, 3], 'результаты должны сохранять порядок');
try {
  await promiseAll([Promise.resolve(1), Promise.reject(new Error('boom'))]);
  assert.fail('должна отклониться с первой ошибкой');
} catch (e) {
  assert.ok(e && e.message.includes('boom'), 'ошибка должна быть исходной');
}$code$,
 '["Верните new Promise, внутри посчитайте счётчик завершённых", "Заворачивайте не-промисы через Promise.resolve, записывайте результат по индексу"]'::jsonb,
 $t$function promiseAll(iterables) {
  return new Promise((resolve, reject) => {
    const results = new Array(iterables.length);
    let remaining = iterables.length;
    if (remaining === 0) return resolve(results);
    iterables.forEach((item, index) => {
      Promise.resolve(item).then((value) => {
        results[index] = value;
        remaining -= 1;
        if (remaining === 0) resolve(results);
      }, reject);
    });
  });
}$t$, 30, true),

('senior', 'Retry с задержкой',
 $t$Реализуйте retry(fn, attempts, delayMs) — вызывает асинхронную функцию fn; при ошибке повторяет попытку, но не более attempts раз, с паузой delayMs между попытками. Возвращает результат первого успешного вызова или отклоняется последней ошибкой.$t$,
 $t$async function retry(fn, attempts, delayMs) {
  // повторяйте попытки до успеха
}$t$, 'retry',
 '[]'::jsonb,
 $code$let attempts = 0;
const flaky = async () => {
  attempts += 1;
  if (attempts < 3) throw new Error('fail ' + attempts);
  return 'done';
};
const result = await retry(flaky, 5, 10);
assert.equal(result, 'done', 'должен вернуть результат после неудач');
assert.equal(attempts, 3, 'ровно 3 вызова функции');$code$,
 '["Рекурсивная вспомогательная функция с attempt-счётчиком — самый чистый вариант", "Пауза: await new Promise((r) => setTimeout(r, delayMs))"]'::jsonb,
 $t$async function retry(fn, attempts, delayMs) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}$t$, 35, true),

('senior', 'Плоский объект (flattenObject)',
 $t$Реализуйте flattenObject(obj), который превращает вложенный объект в плоский с путями через точку: { a: { b: { c: 1 } }, d: 2 } → { "a.b.c": 1, d: 2 }.$t$,
 $t$function flattenObject(obj) {
  // соберите пути через точку
}$t$, 'flattenObject',
 '[{"args":[{"a":{"b":{"c":1}},"d":2}],"expected":{"a.b.c":1,"d":2}},{"args":[{}],"expected":{}},{"args":[{"x":{"y":5}}],"expected":{"x.y":5}}]'::jsonb,
 null,
 '["Рекурсивный обход с накоплением префикса пути"]'::jsonb,
 $t$function flattenObject(obj, prefix = '') {
  const out = {};
  for (const key of Object.keys(obj)) {
    const path = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(out, flattenObject(obj[key], path));
    } else {
      out[path] = obj[key];
    }
  }
  return out;
}$t$, 25, true);

-- ---------- Теория: JUNIOR ----------
insert into public.theory_questions (level, question, answer, is_published) values
('junior', 'Чем отличаются var, let и const?',
 $t$var имеет функциональную область видимости и поднимается (hoisting) с значением undefined, допускает повторное объявление. let и const имеют блочную область видимости, не доступны до объявления (temporal dead zone) и не могут быть переобъявлены. const дополнительно запрещает переприсваивание, но не делает объект иммутабельным: менять его свойства можно.$t$, true),
('junior', 'Что такое hoisting (поднятие)?',
 $t$Это механизм, при котором объявления перемещаются в начало области видимости до выполнения кода. Объявления функций поднимаются целиком и доступны до объявления, а var-переменные поднимаются без инициализации (значение undefined). let и const тоже поднимаются, но остаются в temporal dead zone до строки объявления.$t$, true),
('junior', 'Чем отличается == от ===?',
 $t$== сравнивает с приведением типов: '1' == 1 даст true, что часто приводит к неочевидным багам. === сравнивает строго — и тип, и значение, без приведения. Практическое правило: всегда использовать ===, кроме проверки на null/undefined (x == null).$t$, true),
('junior', 'Какие типы данных есть в JavaScript?',
 $t$Примитивы: number, string, boolean, null, undefined, symbol, bigint — они неизменяемы и сравниваются по значению. Плюс object, который включает массивы, функции, даты и обычные объекты — он сравнивается по ссылке. typeof null возвращает 'object' — историческая ошибка языка.$t$, true),
('junior', 'Что такое замыкание (closure)?',
 $t$Замыкание — это функция, которая запоминает лексическое окружение, в котором была создана, и сохраняет доступ к его переменным даже после того, как внешняя функция завершилась. Классические применения: счётчики, приватное состояние, колбэки с контекстом, debounce/throttle.$t$, true),
('junior', 'Что выведет typeof null и почему?',
 $t$typeof null вернёт 'object'. Это известный баг, сохранившийся с первой версии JavaScript: типы представлялись битовыми тегами, а у null тег совпадал с объектами. Исправить уже нельзя из-за обратной совместимости, поэтому надёжная проверка на null — value === null.$t$, true),
('junior', 'Чем отличаются методы массивов map, filter и reduce?',
 $t$map превращает каждый элемент и возвращает новый массив той же длины. filter отбирает элементы по условию, длина может быть меньше. reduce сворачивает массив в одно любое значение (число, объект, массив), накапливая результат через аккумулятор. Все три не изменяют исходный массив.$t$, true),
('junior', 'В чём разница между undefined и null?',
 $t$undefined означает, что значение не присвоено: такова у объявленной без значения переменной, у отсутствующего свойства, у функции без return. null — это явное «намеренное отсутствие значения», его присваивает разработчик. typeof undefined вернёт 'undefined', typeof null — 'object'.$t$, true),
('junior', 'Чем стрелочные функции отличаются от обычных?',
 $t$У стрелочных функций нет собственного this — они берут его из окружающего лексического контекста, поэтому их удобно использовать в колбэках. У них нет arguments, их нельзя использовать как конструкторы с new, и у них нет свойства prototype. Обычные функции определяют this по способу вызова.$t$, true),
('junior', 'Что такое шаблонные строки (template literals)?',
 $t$Это строки в обратных кавычках, которые поддерживают интерполяцию выражений через ${...}, многострочность без конкатенации и тегированные шаблоны (например, в styled-components или GraphQL-запросах). Пример: `Привет, ${name}! Тебе ${age} лет`.$t$, true),
('junior', 'Как проверить, что значение — массив?',
 $t$Правильный способ — Array.isArray(value). Оператор typeof для массива вернёт 'object', а instanceof Array ломается между разными контекстами (например, iframe). Array.isArray появился именно как надёжная замена этих способов.$t$, true),
('junior', 'Что такое NaN и как его корректно проверить?',
 $t$NaN — «Not a Number», результат некорректной числовой операции (например, parseInt('abc')). У него уникальное свойство: NaN !== NaN, поэтому проверка через равенство не работает. Корректные способы: Number.isNaN(value) или value !== value.$t$, true);

-- ---------- Теория: MIDDLE ----------
insert into public.theory_questions (level, question, answer, is_published) values
('middle', 'Расскажите про event loop: макро- и микрозадачи.',
 $t$JavaScript однопоточен, а event loop управляет очередью задач. Макрозадачи — setTimeout, setInterval, события DOM, I/O. Микрозадачи — промисы (.then), queueMicrotask, MutationObserver. После каждого тика call stack выполняются ВСЕ микрозадачи, затем одна макрозадача, снова микрозадачи — поэтому Promise.then отработает раньше setTimeout(fn, 0).$t$, true),
('middle', 'Что такое прототипное наследование?',
 $t$Каждый объект имеет скрытую ссылку [[Prototype]] (доступна через __proto__ или Object.getPrototypeOf). При обращении к свойству движок ищет его в объекте, затем в прототипе, и так до null — это цепочка прототипов. Методы массивов берутся именно из Array.prototype. Классы в ES6 — синтаксический сахар над той же модели.$t$, true),
('middle', 'Что такое this в JavaScript и как он определяется?',
 $t$this определяется способом вызова, а не местом объявления: при вызове метода — объект слева от точки, при обычном вызове — undefined (strict) или globalThis, при new — новый объект, у стрелочных функций — лексический this из внешней области. Явно задать можно через call/apply/bind. Это частый источник багов в колбэках.$t$, true),
('middle', 'Расскажите про состояния Promise и комбинаторы all, allSettled, race, any.',
 $t$Promise имеет три состояния: pending, fulfilled, rejected — переход происходит один раз. Promise.all отклоняется при первой ошибке (fail-fast), allSettled ждёт все и возвращает статусы, race возвращает первый завершившийся (успех или ошибка), any — первый успешный, отклоняется только если все с ошибкой. all — для зависимых запросов, allSettled — для независимых.$t$, true),
('middle', 'Что такое debounce и throttle, где применяются?',
 $t$Debounce откладывает вызов до паузы в событиях — подходит для поиска по вводу и валидации форм: ждём, пока пользователь перестанет печатать. Throttle пропускает не более одного вызова за интервал — подходит для scroll, resize, mousemove: нужен стабильный ритм. Оба реализуются через замыкания и таймеры.$t$, true),
('middle', 'Глубокое и поверхностное копирование: в чём разница и как сделать глубокую копию?',
 $t$Поверхностная копия (Object.assign, spread, Array.slice) копирует только первый уровень — вложенные объекты остаются ссылками. Глубокая копия клонирует всё дерево: structuredClone(value) — современный способ, JSON.parse(JSON.stringify(value)) — с ограничениями (теряются функции, undefined, Date), рекурсивная функция — полный контроль.$t$, true),
('middle', 'Как работает сборщик мусора и какие бывают утечки памяти?',
 $t$V8 использует алгоритм mark-and-sweep: от корней (global, стек) помечаются достижимые объекты, недостижимые удаляются. Утечки возникают, когда ссылки сохраняются случайно: незачищенные таймеры и слушатели, замыкания, удерживающие большие данные, растущие глобальные переменные, забытые подписки. Помогают DevTools Memory и heap snapshots.$t$, true),
('middle', 'Что такое генераторы (function*)?',
 $t$Генератор — функция, выполнение которой можно приостанавливать: yield возвращает значение и ставит функцию на паузу, next() продолжает. Удобны для ленивых вычислений, обхода больших данных без загрузки в память, бесконечных последовательностей. На генераторах работают итераторы и redux-saga.$t$, true),
('middle', 'Что делает Strict Mode?',
 $t$'use strict' включает более строгий режим: присваивание необъявленной переменной бросает ошибку, this при обычном вызове — undefined, дубликаты ключей и параметров запрещены, delete по переменным запрещён. ES-модули и классы работают в strict mode по умолчанию.$t$, true),
('middle', 'Чем отличаются call, apply и bind?',
 $t$Все три управляют this. call(context, arg1, arg2) вызывает функцию сразу с аргументами по одному, apply(context, [args]) — сразу, но аргументы массивом, bind(context) — не вызывает, а возвращает новую функцию с «прибитым» this (каррирование частичных применений тоже удобно делать через bind).$t$, true),
('middle', 'Чем ES-модули отличаются от CommonJS?',
 $t$ES-модули (import/export) — статические: зависимости известны до выполнения, отсюда tree-shaking и top-level await; работаю асинхронно в браузере. CommonJS (require/module.exports) — динамический, загрузка синхронная в рантайме, стандарт для Node до недавнего времени. В браузере нативно работают только ES-модули.$t$, true),
('middle', 'Как работает async/await под капотом?',
 $t$async-функция всегда возвращает Promise, а await — синтаксический сахар над .then: выполнение функции приостанавливается и продолжается в микрозадаче. Ошибки ловятся try/catch. Важно помнить: последовательные await медленнее, чем Promise.all для независимых запросов, а await в цикле for превращает параллельную работу в последовательную.$t$, true);

-- ---------- Теория: SENIOR ----------
insert into public.theory_questions (level, question, answer, is_published) values
('senior', 'Как бы вы спроектировали архитектуру крупного SPA?',
 $t$Ключевые решения: модульная структура по фичам (feature-sliced), а не по типам файлов; code-splitting по маршрутам и тяжёлым блокам; чёткая граница API-слоя; типизация; ленивая загрузка виджетов; изоляция состояния — глобально только сессия и тема, остальное локально. Важны договорённости о фич-флагах, дизайн-система и автотесты на критические пути.$t$, true),
('senior', 'Что такое SSR, SSG, ISR и когда что выбирать?',
 $t$SSR рендерит страницу на сервере на каждый запрос — нужен для часто меняющихся персонализированных данных. SSG собирает статику на билде — максимум скорости для контентных страниц. ISR (Incremental Static Regeneration) — статика с периодической регенерацией, компромисс между ними. Выбор определяется частотой изменений данных и требованиями SEO.$t$, true),
('senior', 'Как обеспечить безопасность фронтенда?',
 $t$XSS: экранирование пользовательского ввода, отказ от dangerouslySetInnerHTML, CSP-заголовки. CSRF: SameSite-куки, CSRF-токены. Данные: не хранить секреты во фронтенде, минимизировать в localStorage. Плюс зависимости: аудит пакетов, lock-файлы, subresource integrity. HTTPS и security-заголовки — обязательный базис.$t$, true),
('senior', 'С чего начать оптимизацию производительности веб-приложения?',
 $t$Сначала измерить, потом оптимизировать: Lighthouse, DevTools Performance, RUM-метрики (Core Web Vitals: LCP, INP, CLS). Типичные рычаги: code-splitting и сжатие бандлов, кэширование, оптимизация изображений, виртуализация длинных списков, устранение layout thrashing, web workers для тяжёлых вычислений. Каждое изменение валидируется повторным замером.$t$, true),
('senior', 'Микрофронтенды: за и против?',
 $t$За: независимые команды, независимые релизы, изоляция технологий. Против: дублирование зависимостей и стилей, сложность консистентности UX, оверхед инфраструктуры, сложная отладка. Разумно, когда несколько больших команд работают над одной витриной с разными циклами релизов; для одного продукта это обычно лишнее усложнение.$t$, true),
('senior', 'Что такое Web Workers и когда их применять?',
 $t$Web Worker — фоновый поток с собственным event loop, без доступа к DOM, общение через сообщения (postMessage) или SharedArrayBuffer. Применение: парсинг больших файлов, тяжёлые вычисления, обработка изображений, шифрование — всё, что способно подвесить UI. Наша платформа так же запускает пользовательский код в воркере с таймаутом.$t$, true),
('senior', 'Плюсы и минусы глобального стора состояния?',
 $t$Глобальный стор даёт единый источник истины и удобный devtools, но провоцирует вынос туда всего подряд: лишние ре-рендеры, сложность тестирования, связность модулей. Здоровый подход: серверные данные держать в кэше (react-query/SWR), локальное состояние — локально, глобально — только сессия, тема, фич-флаги. Стор — не свалка.$t$, true),
('senior', 'Как работает HTTPS на высоком уровне?',
 $t$TLS-handshake: клиент и сервер договариваются о шифрах, сервер предъявляет сертификат, подписанный доверенным CA, происходит обмен ключами (ECDHE), далее всё шифруется симметрично. Это даёт конфиденциальность, целостность и аутентификацию сервера. HTTP/2 и HTTP/3 (QUIC) работают только поверх TLS.$t$, true),
('senior', 'Расскажите про пирамиду тестирования фронтенда.',
 $t$Основание — быстрые unit-тесты утилит и хуков; середина — интеграционные тесты компонентов (Testing Library: тестируем поведение, не реализацию); вершина — немного e2e-сценариев (Playwright) на критические пути: логин, оплата. Антипаттерн — мороженое: куча медленных e2e и отсутствие юнитов. Важно: статический анализ (типы, линтер) ловит больше всего багов за меньшие деньги.$t$, true),
('senior', 'Зачем нужна иммутабельность в React/Redux?',
 $t$React сравнивает состояние и пропсы по ссылке — мутация не меняет ссылку и не вызывает ререндер, поэтому обновления делают новыми объектами (spread, structuredClone, immmer). Иммутабельность даёт предсказуемость, простую отладку (снапшоты состояния), дешёвое кэширование через memo. Цена — аллокации, но для UI они несущественны.$t$, true),
('senior', 'WebSocket или SSE: когда что выбирать?',
 $t$WebSocket — двусторонний канал поверх TCP: чаты, игры, совместное редактирование. SSE (Server-Sent Events) — односторонний поток сервер→клиент поверх обычного HTTP: ленты уведомлений, биржевые тикеры. SSE проще в реализации, автоматически переподключается и дружит с прокси; WebSocket нужен, когда клиент шлёт данные часто.$t$, true),
('senior', 'Какие этапы обязательны в CI/CD для фронтенда?',
 $t$Линт и типизация, unit/интеграционные тесты, сборка с проверкой размера бандла (budget), e2e на критических сценариях, превью-деплой для каждой ветки (ревью глазами), затем прод с возможностью мгновенного отката. Отдельная ценность — прогон визуальных тестов и Lighthouse с порогами, чтобы регрессии ловились до релиза.$t$, true);

-- ---------- Теория: HR ----------
insert into public.theory_questions (level, question, answer, is_published) values
('hr', 'Расскажите о себе за пару минут.',
 $t$Структура ответа: кто вы по профессии и какой опыт — 2–3 ключевых факта (стек, масштаб задач), чем гордитесь (один конкретный результат в цифрах), почему ищете новое место и что вам интересно в этой роли. Держитесь 1.5–2 минут, не пересказывайте резюме целиком — выделите главное и оставьте детали для уточняющих вопросов.$t$, true),
('hr', 'Почему хотите работать именно у нас?',
 $t$Сильный ответ связывает три вещи: что вы знаете о компании (продукты, технологии, масштаб), что вас там привлекает конкретно (задачи, техстек, культура, рост) и что вы принесёте команде. Избегайте ответов «у вас большая зарплата» и шаблонов «стабильная компания» — говорите про конкретику из вакансии и открытых источников.$t$, true),
('hr', 'Какие у вас сильные и слабые стороны?',
 $t$Сильные: 1–2 качества с доказательствами (примеры, где это помогло проекту). Слабые: честное, но не критичное для должности ограничение + как вы с ним работаете. Пример: «склонен уходить в перфекционизм — научился фиксировать время на задачу и согласовывать определение готовности заранее». Не говорите «я трудоголик» — это звучит неискренне.$t$, true),
('hr', 'Расскажите о сложном конфликте в команде.',
 $t$Используйте схему STAR: ситуация → задача → действия → результат. Выберите реальный профессиональный конфликт (например, спор о техническом решении), покажите, что вы слушали другую сторону, искали критерии решения, а не побеждали в споре, и как в итоге договорились. Главное — конструктивная роль, а не «я был прав».$t$, true),
('hr', 'Почему ушли с прошлого места работы?',
 $t$Формула: нейтрально о прошлом + позитивно о будущем. «Проекты там были завершены, я вырос до X, но дальше на этом стеке/роли расти было некуда — а хочу развиваться в Y, поэтому ищу команду, где такие задачи есть». Не критикуйте бывшего работодателя и начальника — интервьюер спроецирует это на новую компанию.$t$, true),
('hr', 'Кем видите себя через 3–5 лет?',
 $t$Покажите реалистичный вектор развития, связанный с позицией: углубление экспертизы (например, от фич — к проектированию систем), менторство джунов, участие в архитектурных решениях. Ответ «хочу стать вашим руководителем» настораживает, «не знаю» — демотивирует. Оптимально — рост внутри профессии.$t$, true),
('hr', 'Расскажите о своём самом успешном проекте.',
 $t$Выберите проект с измеримым результатом (ускорил в 3 раза, поднял конверсию на N%, сократил количество багов). Опишите контекст, вашу конкретную роль, самое сложное техническое решение и итог в цифрах. Будьте готовы к вопросу «а что бы вы сделали иначе сейчас?» — он почти наверняка последует.$t$, true),
('hr', 'Как справляетесь с дедлайнами и давлением?',
 $t$Дайте систему, а не пафос: декомпозиция задач, честная оценка с буфером, ранний эскалационный разговор, если сроки нереальны, приоритизация с менеджером. Пример из жизни, где давление было высоким и вы вышли из ситуации без потери качества, укрепит ответ.$t$, true),
('hr', 'Какие у вас ожидания по зарплате?',
 $t$Лучше иметь подготовленную вилку, основанную на анализе рынка для вашего грейда, и произнести её уверенно: «вилка от X до Y, готов обсуждать в зависимости от полного пакета». Можно переспросить бюджет вакансии, но ответ «сколько дадите» ослабляет позицию. Знайте свой минимум заранее.$t$, true),
('hr', 'Есть ли вопросы к нам?',
 $t$Отказ от вопросов читается как отсутствие интереса. Хорошие вопросы: как устроен процесс разработки и релизов, какие задачи будут в первые 3 месяца, как измеряется успех на этой позиции, почему эта вакансия открыта, как выглядит рост инженера в команде. Это тоже оценка вас — задавайте вдумчивые вопросы.$t$, true);

-- ---------- Примеры отзывов ----------
insert into public.reviews (user_id, author_name, company_slug, rating, text, created_at) values
(null, 'Дмитрий', 'yandex', 5, 'Алгоритмическая секция была честной: две задачи, одну решил не до конца, но дали время подумать вслух — это засчитывается. Совет: проговаривайте свои рассуждения, молчание там воспринимают плохо.', now() - interval '12 days'),
(null, 'Алина', 'ozon-intern', 5, 'Стажировочное собеседование оказалось дружелюбнее, чем я боялась. Сначала пара вопросов про основы JS, потом простая задача на массивы. Главное — не молчать и задавать уточняющие вопросы.', now() - interval '8 days'),
(null, 'Сергей', 'google', 4, 'Два раунда по 45 минут: структура данных и системный дизайн. Жёстко по времени, но интервьюер активно помогал наводящими вопросами. Начинайте с уточнения требований задачи — это сразу плюс.', now() - interval '20 days'),
(null, 'Марина', 'avito', 4, 'Тёплое собеседование: поговорили про опыт, дали практическую задачу с реальным кейсом. Из минусов — долго ждала обратной связи, почти две недели.', now() - interval '15 days'),
(null, 'Игорь', 'sber', 3, 'Технически вопросы стандартные, но процесс оказался бюрократичным: три этапа, много ожиданий между ними. Задачка на асинхронность была интересной.', now() - interval '30 days'),
(null, 'Настя', 'meta', 5, 'Глубоко копнули React и производительность. Совет будущим: обязательно повторите структуру данных и поймите, как работает reconciliation — без этого секцию не пройти.', now() - interval '25 days');
