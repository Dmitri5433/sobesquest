import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, hasSupabase } from './supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = идёт загрузка, null = гость, object = сессия есть
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [solvedIds, setSolvedIds] = useState(() => new Set())

  const loadUserData = useCallback(async (userId) => {
    if (!supabase) return
    const [{ data: prof, error: profError }, { data: solves }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('solves').select('task_id').eq('user_id', userId),
    ])
    if (!profError) setProfile(prof)
    setSolvedIds(new Set((solves || []).map((s) => s.task_id)))
  }, [])

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      return
    }
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session ?? null)
      if (data.session) loadUserData(data.session.user.id)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      if (nextSession) loadUserData(nextSession.user.id)
      else {
        setProfile(null)
        setSolvedIds(new Set())
      }
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [loadUserData])

  const signUp = useCallback(async ({ username, email, password }) => {
    if (!supabase) throw new Error('DB_NOT_CONNECTED')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) throw error
    return data
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) throw new Error('DB_NOT_CONNECTED')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  /** Отметить задачу решённой (локально + в БД, повторная отметка безопасна) */
  const markSolved = useCallback(async (taskId) => {
    setSolvedIds((prev) => {
      const next = new Set(prev)
      next.add(taskId)
      return next
    })
    if (!supabase || !session?.user) return
    const { error } = await supabase
      .from('solves')
      .insert({ user_id: session.user.id, task_id: taskId })
    // unique-нарушение = уже решена, это не ошибка
    if (error && error.code !== '23505') console.warn('solves.insert:', error.message)
  }, [session])

  const value = useMemo(
    () => ({
      hasSupabase,
      ready: session !== undefined,
      session,
      user: session?.user ?? null,
      profile,
      solvedIds,
      isGuest: !session,
      isAdmin: profile?.role === 'admin',
      signUp,
      signIn,
      signOut,
      markSolved,
      refreshProfile: () => session?.user && loadUserData(session.user.id),
    }),
    [session, profile, solvedIds, signUp, signIn, signOut, markSolved, loadUserData]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
