import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** true, если заданы переменные окружения Supabase */
export const hasSupabase = Boolean(url && anonKey)

/** Клиент Supabase (null, пока не настроен .env) */
export const supabase = hasSupabase ? createClient(url, anonKey) : null
