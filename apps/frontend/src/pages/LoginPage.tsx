// apps/frontend/src/pages/LoginPage.tsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../stores/auth.store'
import { BACKEND_URL } from '../constants'

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request gagal')
  return data
}

interface AuthResponse {
  accessToken: string
  user: { id: string; name: string; email: string; avatarUrl?: string; isGoogle?: boolean }
}

// ─── Threadster Logo ──────────────────────────────────────────
function ThreadsterLogo({ size = 52 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none">
      <rect x="8" y="10" width="48" height="6" rx="3" fill="currentColor" />
      <rect x="27" y="10" width="10" height="44" rx="5" fill="currentColor" />
      <ellipse cx="32" cy="22" rx="16" ry="5" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.5" />
      <ellipse cx="32" cy="42" rx="12" ry="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.35" />
    </svg>
  )
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleWidth, setGoogleWidth] = useState(360)

  useEffect(() => {
    function handleResize() {
      const w = Math.min(window.innerWidth - 48, 360)
      setGoogleWidth(w > 200 ? w : 200)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  async function handleSubmit() {
    if (!form.email || !form.password) { setError('Email dan kata sandi wajib diisi.'); return }
    if (mode === 'register' && !form.name) { setError('Nama lengkap wajib diisi.'); return }
    setLoading(true); setError(null)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }
      const data = await apiFetch<AuthResponse>(endpoint, {
        method: 'POST', body: JSON.stringify(body),
      })
      setAuth(data.user, data.accessToken)
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin(credentialResponse: any) {
    try {
      setError(null)
      const data = await apiFetch<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: credentialResponse.credential }),
      })
      setAuth(data.user, data.accessToken)
      navigate('/')
    } catch (err: any) {
      setError('Login Google gagal: ' + err.message)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login')
    setError(null)
    setForm({ name: '', email: '', password: '' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d0d0d',
      color: '#f3f3f3',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px 48px',
    }}>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}>

        {/* Logo + Brand */}
        <div style={{ color: '#f3f3f3', marginBottom: 8 }}>
          <ThreadsterLogo size={52} />
        </div>
        <h1 style={{
          fontSize: 26, fontWeight: 800,
          letterSpacing: '-0.5px',
          color: '#f3f3f3',
          fontFamily: 'Georgia, serif',
          marginBottom: 4,
        }}>
          threadster
        </h1>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 32 }}>
          {mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru'}
        </p>

        {/* Error */}
        {error && (
          <div style={{
            width: '100%',
            background: 'rgba(255,60,60,0.08)',
            border: '1px solid rgba(255,60,60,0.2)',
            color: '#ff6b6b',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            textAlign: 'center',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'register' && (
            <input
              style={inputStyle}
              type="text" name="name" placeholder="Nama lengkap"
              value={form.name} onChange={handleChange} onKeyDown={handleKeyDown}
            />
          )}
          <input
            style={inputStyle}
            type="email" name="email" placeholder="Email"
            value={form.email} onChange={handleChange} onKeyDown={handleKeyDown}
          />
          <input
            style={inputStyle}
            type="password" name="password" placeholder="Kata sandi"
            value={form.password} onChange={handleChange} onKeyDown={handleKeyDown}
          />

          <button
            style={{
              ...btnPrimary,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
          <span style={{ fontSize: 12, color: '#444', fontWeight: 600 }}>atau</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
        </div>

        {/* Google Login */}
        <div style={{
          width: '100%', display: 'flex', justifyContent: 'center',
          marginBottom: 16,
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid #222',
        }}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError('Login Google gagal.')}
            theme="filled_black"
            shape="rectangular"
            size="large"
            text={mode === 'login' ? 'signin_with' : 'signup_with'}
            width={String(googleWidth)}
          />
        </div>

        {/* Switch mode */}
        <button onClick={switchMode} style={btnSwitch}>
          {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </button>

      </div>

      {/* Footer */}
      <footer style={{ position: 'absolute', bottom: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#333' }}>
          © 2026 Threadster · Ketentuan · Privasi
        </p>
      </footer>

    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#181818',
  border: '1px solid #2a2a2a',
  borderRadius: 12,
  padding: '16px 18px',
  color: '#f3f3f3',
  fontSize: 15,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const btnPrimary: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#f3f3f3',
  color: '#0d0d0d',
  border: 'none',
  borderRadius: 12,
  padding: '16px',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  marginTop: 4,
  transition: 'opacity 0.15s',
}

const btnSwitch: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'transparent',
  border: '1px solid #222',
  borderRadius: 12,
  padding: '14px',
  color: '#aaa',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
}