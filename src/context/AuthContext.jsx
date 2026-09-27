import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error.message)
      return null
    }
    return data
  }

  const handleAuthChange = async (session) => {
    if (session?.user) {
      setUser(session.user)
      // Small delay to allow the DB trigger to create the profile
      let prof = await fetchProfile(session.user.id)
      if (!prof) {
        // Retry once after a short delay (trigger may still be running)
        await new Promise((r) => setTimeout(r, 1000))
        prof = await fetchProfile(session.user.id)
      }
      setProfile(prof)
    } else {
      setUser(null)
      setProfile(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    // Use onAuthStateChange exclusively — it fires INITIAL_SESSION on mount
    // with the current session, so getSession() is not needed and would cause
    // a duplicate Supabase request on every page load.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleAuthChange(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async ({ email, password, fullName, phone }) => {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedFullName = String(fullName || '').trim()
    const normalizedPhone = String(phone || '').trim()

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: normalizedFullName,
          phone: normalizedPhone || null,
        },
      },
    })
    return { data, error }
  }

  const signIn = async ({ email, password }) => {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  const refreshProfile = async () => {
    if (user) {
      const prof = await fetchProfile(user.id)
      setProfile(prof)
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isPatient: profile?.role === 'PATIENT',
    isAdmin: profile?.role === 'ADMIN',
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
