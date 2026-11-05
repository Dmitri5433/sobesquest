import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ru } from '../i18n/ru'
import { en } from '../i18n/en'

const DICTS = { ru, en }
const LANG_KEY = 'sq_lang'
const THEME_KEY = 'sq_theme'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(LANG_KEY)
    return saved === 'en' || saved === 'ru' ? saved : 'ru'
  })
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY)
    return saved === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo(() => {
    const t = (key, params) => {
      let text = DICTS[lang]?.[key] ?? DICTS.ru[key] ?? key
      if (params) {
        for (const [name, val] of Object.entries(params)) {
          text = text.replaceAll(`{${name}}`, String(val))
        }
      }
      return text
    }
    return { lang, setLang, theme, setTheme, t, locale: lang === 'ru' ? 'ru-RU' : 'en-US' }
  }, [lang, theme])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  return useContext(LanguageContext)
}
