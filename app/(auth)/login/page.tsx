// app/(auth)/login/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // Si ya hay sesión, redirige al home
  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!alive) return
      if (data.session) router.replace('/')
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace('/')
    })
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMsg('Inicio de sesión correcto ✅')
        router.push('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
          },
        })
        if (error) throw error
        setMsg('Registro enviado. Revisa tu email para confirmar la cuenta.')
      }
    } catch (err: any) {
      setMsg(err?.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm bg-white/90">
        <h1 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>

        <form onSubmit={onSubmit} className="space-y-3" aria-describedby="auth-desc">
          <p id="auth-desc" className="sr-only">
            {mode === 'login' ? 'Formulario para iniciar sesión' : 'Formulario para crear cuenta'}
          </p>

          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div>
            <label className="text-sm">Contraseña</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {msg && <p className="text-sm">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 text-white py-2 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-4 text-sm">
          {mode === 'login' ? (
            <button className="underline" onClick={() => setMode('signup')} aria-describedby="auth-desc">
              ¿No tienes cuenta? Regístrate
            </button>
          ) : (
            <button className="underline" onClick={() => setMode('login')} aria-describedby="auth-desc">
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
