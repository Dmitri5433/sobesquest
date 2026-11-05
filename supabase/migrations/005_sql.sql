-- ============================================================
-- SobesQuest — SQL-задачи (выполняются в браузере через sql.js)
-- Выполните ПОСЛЕ 001_schema.sql и 002_seed.sql
-- ============================================================

alter table public.tasks add column if not exists task_type text not null default 'js';
alter table public.tasks add column if not exists setup_sql text;

-- ---------- SQL-задачи ----------
insert into public.tasks (level, title, description, starter_code, function_name, task_type, setup_sql, tests, hints, solution_code, xp, is_published) values
('junior', 'SQL: Выборка товаров',
 $t$В базе есть таблица products (id, name, price). Выведите названия всех товаров, отсортировав их по цене по возрастанию.$t$,
 $t$-- напишите SQL-запрос
SELECT$t$, '', 'sql',
 $t$CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER);
INSERT INTO products (name, price) VALUES ('Ноутбук', 80000), ('Мышь', 1500), ('Кружка', 600);$t$,
 '[{"query":"SELECT name FROM products ORDER BY price ASC","expected":[["Кружка"],["Мышь"],["Ноутбук"]]}]'::jsonb,
 '["Сортировка: ORDER BY price ASC"]'::jsonb,
 $t$SELECT name FROM products ORDER BY price ASC;$t$, 15, true),

('junior', 'SQL: Фильтр по цене',
 $t$Таблица products (id, name, price). Выведите названия товаров дороже 1000, отсортировав их по цене по убыванию.$t$,
 $t$-- напишите SQL-запрос
SELECT$t$, '', 'sql',
 $t$CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER);
INSERT INTO products (name, price) VALUES ('Ноутбук', 80000), ('Мышь', 1500), ('Кружка', 600), ('Клавиатура', 4500), ('Монитор', 12000);$t$,
 '[{"query":"SELECT name FROM products WHERE price > 1000 ORDER BY price DESC","expected":[["Монитор"],["Ноутбук"],["Клавиатура"]]}]'::jsonb,
 '["Условие: WHERE price > 1000", "Порядок: ORDER BY price DESC"]'::jsonb,
 $t$SELECT name FROM products WHERE price > 1000 ORDER BY price DESC;$t$, 15, true),

('middle', 'SQL: Суммы заказов по покупателям',
 $t$Таблицы customers (id, name) и orders (id, customer_id, amount). Выведите имя покупателя и сумму его заказов, начиная с самой большой суммы.$t$,
 $t$-- подсказка: понадобится JOIN и GROUP BY
SELECT$t$, '', 'sql',
 $t$CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers (id, name) VALUES (1, 'Анна'), (2, 'Борис'), (3, 'Вера');
INSERT INTO orders (customer_id, amount) VALUES (1, 2000), (1, 3000), (2, 3200), (3, 1000);$t$,
 '[{"query":"SELECT c.name, SUM(o.amount) AS total FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name ORDER BY total DESC","expected":[["Анна", 5000], ["Борис", 3200], ["Вера", 1000]]}]'::jsonb,
 '["Соедините таблицы: JOIN customers c ON c.id = o.customer_id", "Сгруппируйте: GROUP BY c.name, сумма: SUM(o.amount)", "Псевдоним: SUM(o.amount) AS total, сортировка: ORDER BY total DESC"]'::jsonb,
 $t$SELECT c.name, SUM(o.amount) AS total
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.name
ORDER BY total DESC;$t$, 25, true),

('middle', 'SQL: Статусы заказов',
 $t$Таблица orders (id, status). Посчитайте количество заказов в каждом статусе, отсортировав результаты по алфавиту статусов.$t$,
 $t$-- подсказка: COUNT и GROUP BY
SELECT$t$, '', 'sql',
 $t$CREATE TABLE orders (id INTEGER PRIMARY KEY, status TEXT);
INSERT INTO orders (status) VALUES ('new'), ('paid'), ('paid'), ('shipped'), ('new'), ('paid'), ('cancelled');$t$,
 '[{"query":"SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY status","expected":[["cancelled", 1], ["new", 2], ["paid", 3], ["shipped", 1]]}]'::jsonb,
 '["COUNT(*) считает строки в группе", "GROUP BY status объединяет одинаковые статусы"]'::jsonb,
 $t$SELECT status, COUNT(*)
FROM orders
GROUP BY status
ORDER BY status;$t$, 20, true),

('senior', 'SQL: Клиенты без заказов',
 $t$Таблицы customers (id, name) и orders (id, customer_id). Выведите имена клиентов, у которых нет ни одного заказа, по алфавиту.$t$,
 $t$-- подсказка: NOT IN или LEFT JOIN ... IS NULL
SELECT$t$, '', 'sql',
 $t$CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER);
INSERT INTO customers (id, name) VALUES (1, 'Анна'), (2, 'Борис'), (3, 'Вера'), (4, 'Григорий');
INSERT INTO orders (customer_id) VALUES (1), (1), (3);$t$,
 '[{"query":"SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders) ORDER BY name","expected":[["Борис"], ["Григорий"]]}]'::jsonb,
 '["Подзапрос: SELECT customer_id FROM orders", "Проверка отсутствия: WHERE id NOT IN (...)", "Алфавитный порядок: ORDER BY name"]'::jsonb,
 $t$SELECT name FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders)
ORDER BY name;$t$, 30, true);
