/**
 * Резервный каталог компаний — показывается, пока Supabase не настроен,
 * чтобы интерфейс можно было посмотреть локально без базы.
 * Полностью совпадает с сид-данными 002_seed.sql.
 */
export const fallbackCompanies = [
  {
    id: 1,
    slug: 'ozon-intern',
    name: 'Ozon · Стажировка',
    emoji: '🚀',
    color: '#005bff',
    tagline: 'Первый шаг в большую разработку',
    description:
      'Стажировка в одном из крупнейших российских e-commerce. От вас ждут базовой алгоритмической подготовки, знания одного языка и огромного желания учиться.',
    required_level: 'junior',
    sort_order: 1,
  },
  {
    id: 2,
    slug: 'avito',
    name: 'Avito',
    emoji: '🛒',
    color: '#00aaff',
    tagline: 'Классифицированный гигант',
    description:
      'Avito ценит продуктовое мышление и чистый код. На собеседовании спросят основы JavaScript и попросят решить практическую задачу.',
    required_level: 'junior',
    sort_order: 2,
  },
  {
    id: 3,
    slug: 'tbank',
    name: 'Т-Банк',
    emoji: '🟡',
    color: '#ffdd2d',
    tagline: 'Технологии на грани финтеха',
    description:
      'Т-Банк известен сильным комьюнити инженеров. Собеседование на джуна начинается с базы: типы, функции, массивы — и одна задачка на логику.',
    required_level: 'junior',
    sort_order: 3,
  },
  {
    id: 4,
    slug: 'yandex',
    name: 'Яндекс',
    emoji: '🔎',
    color: '#fc3f1d',
    tagline: 'Собеседование с алгоритмами',
    description:
      'Классика собеседований: алгоритмическая секция с live-coding, вопросы про event loop и браузер. Готовьтесь объяснять сложность своего решения.',
    required_level: 'middle',
    sort_order: 4,
  },
  {
    id: 5,
    slug: 'vk',
    name: 'VK',
    emoji: '💬',
    color: '#0077ff',
    tagline: 'Соцсеть и сервисы на миллионы пользователей',
    description:
      'В VK спросят про асинхронность, промисы и работу с DOM. Миддам любят предлагать задачи на реализацию встроенных механизмов.',
    required_level: 'middle',
    sort_order: 5,
  },
  {
    id: 6,
    slug: 'sber',
    name: 'Сбер',
    emoji: '💚',
    color: '#21a038',
    tagline: 'Финтех в масштабе страны',
    description:
      'Сбер переходит на собственные технологии и активно нанимает разработчиков. Ожидают уверенного владения JavaScript и понимания CI/CD.',
    required_level: 'middle',
    sort_order: 6,
  },
  {
    id: 7,
    slug: 'wildberries',
    name: 'Wildberries',
    emoji: '🟣',
    color: '#cb11ab',
    tagline: 'Маркетплейс №1',
    description:
      'WB растёт стремительно, и команда разработки вместе с ним. Собеседование практичное: реальные задачи с витриной и корзиной.',
    required_level: 'middle',
    sort_order: 7,
  },
  {
    id: 8,
    slug: 'google',
    name: 'Google',
    emoji: '🌐',
    color: '#4285f4',
    tagline: 'Собеседование мечты',
    description:
      'Легендарные interviews: структура, сложность O(n), системные вопросы. Сеньорам предлагают спроектировать компонент целиком.',
    required_level: 'senior',
    sort_order: 8,
  },
  {
    id: 9,
    slug: 'meta',
    name: 'Meta',
    emoji: '♾️',
    color: '#0668e1',
    tagline: 'Move fast, но с корнями',
    description:
      'Meta спрашивает глубокое понимание JavaScript, React и производительности. Будьте готовы к задачам на структуры данных.',
    required_level: 'senior',
    sort_order: 9,
  },
  {
    id: 10,
    slug: 'amazon',
    name: 'Amazon',
    emoji: '📦',
    color: '#ff9900',
    tagline: 'Customer obsession',
    description:
      'Amazon ведёт собеседования по leadership principles: половина вопросов — про поведение и опыт, половина — про техническую глубину.',
    required_level: 'senior',
    sort_order: 10,
  },
]
