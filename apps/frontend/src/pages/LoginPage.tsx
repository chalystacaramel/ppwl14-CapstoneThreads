// apps/frontend/src/pages/LoginPage.tsx
// Dikerjakan oleh: Adhelia
// Target: Login & Register berhasil, data tersimpan di BE

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuthStore } from "../stores/auth.store";
import { toast } from 'sonner'  

// ─── API helper ───────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
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

// ─── Bola dekoratif ──────────────────────────────────────────
function ThreadsBall({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      width: 220, height: 220, borderRadius: '50%',
      background: '#1a1a1a', border: '1px solid #2a2a2a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0, ...style,
    }}>
      <div style={{
        fontSize: 26, fontWeight: 900, color: '#333',
        letterSpacing: 3, transform: 'rotate(-30deg)',
        lineHeight: 1.3, textAlign: 'center', userSelect: 'none',
      }}>
        THREADS<br />SCHOOL<br />THREADS<br />SCH<br />THREADS
      </div>
    </div>
  )
}

// ─── Komponen utama ───────────────────────────────────────────
export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  // ── Login / Register biasa ────────────────────────────────
  async function handleSubmit() {
    if (!form.email || !form.password) { setError('Email dan password wajib diisi.'); return }
    if (mode === 'register' && !form.name) { setError('Nama wajib diisi.'); return }
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
      toast.success(`Selamat datang, ${data.user.name}! 👋`)
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Login Google ──────────────────────────────────────────
  async function handleGoogleLogin(credentialResponse: any) {
    try {
      setError(null)
      const googleToken = credentialResponse.credential
      const data = await apiFetch<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: googleToken }),
      })
      setAuth(data.user, data.accessToken)
      toast.success(`Selamat datang, ${data.user.name}! 👋`)  // tambah ini
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
    <div style={s.page}>
      {/* Bola kiri */}
      <div style={s.ballsLeft}>
        <ThreadsBall style={{ transform: 'translate(-60px, -50px)' }} />
        <ThreadsBall style={{ transform: 'translate(-30px, 30px)' }} />
      </div>

      {/* Form tengah */}
      <div style={s.center}>
        {/* Logo Threads */}
        <div style={s.logoWrap}>
          <svg viewBox="0 0 192 192" width={52} height={52} fill="white">
            <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.23c8.25.053 14.476 2.452 18.502 7.13 2.932 3.405 4.893 8.11 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.068c.224 28.617 6.882 51.447 19.788 67.852C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z"/>
          </svg>
        </div>

        <h2 style={s.title}>
          {mode === 'login' ? 'Login dengan akun Instagram Anda' : 'Buat Akun Baru'}
        </h2>

        {error && <div style={s.errorBox}>{error}</div>}

        {/* Form email/password */}
        <div style={s.form}>
          {mode === 'register' && (
            <input style={s.input} type="text" name="name" placeholder="Nama lengkap"
              value={form.name} onChange={handleChange} onKeyDown={handleKeyDown} />
          )}
          <input style={s.input} type="email" name="email"
            placeholder="Nama pengguna, telepon, atau email"
            value={form.email} onChange={handleChange} onKeyDown={handleKeyDown} />
          <input style={s.input} type="password" name="password" placeholder="Kata Sandi"
            value={form.password} onChange={handleChange} onKeyDown={handleKeyDown} />

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? 'Memproses...' : mode === 'login' ? 'Login' : 'Daftar'}
          </button>
        </div>

        {mode === 'login' && (
          <p style={s.forgotText}>Lupa kata sandi?</p>
        )}

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>atau</span>
          <div style={s.dividerLine} />
        </div>

        {/* Google Login */}
        <div style={s.googleWrap}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError('Login Google gagal.')}
            theme="filled_black"
            shape="rectangular"
            size="large"
            text={mode === 'login' ? 'signin_with' : 'signup_with'}
            width="380"
          />
        </div>

        {/* Toggle login/register */}
        <button style={s.igBtn} onClick={switchMode}>
          <span style={s.igIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig)" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" stroke="url(#ig2)" strokeWidth="2"/>
              <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
              <defs>
                <linearGradient id="ig" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f9ce34"/><stop offset="0.4" stopColor="#ee2a7b"/><stop offset="1" stopColor="#6228d7"/>
                </linearGradient>
                <linearGradient id="ig2" x1="8" y1="16" x2="16" y2="8" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f9ce34"/><stop offset="0.4" stopColor="#ee2a7b"/><stop offset="1" stopColor="#6228d7"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span style={{ flex: 1, textAlign: 'center' }}>
            {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </span>
          <span style={{ color: '#888' }}>›</span>
        </button>

        <p style={s.footer}>
          © 2026 &nbsp;·&nbsp;
          <span style={s.footerLink}>Ketentuan Threads</span> &nbsp;·&nbsp;
          <span style={s.footerLink}>Kebijakan Privasi</span> &nbsp;·&nbsp;
          <span style={s.footerLink}>Kebijakan Cookie</span> &nbsp;·&nbsp;
          <span style={s.footerLink}>Laporkan masalah</span>
        </p>
      </div>

      {/* Bola kanan */}
      <div style={s.ballsRight}>
        <ThreadsBall style={{ transform: 'translate(60px, -50px)' }} />
        <ThreadsBall style={{ transform: 'translate(30px, 30px)' }} />
      </div>

      {/* QR pojok kanan bawah */}
      <div style={s.qrWrap}>
        <p style={s.qrText}>Pindai untuk mendapatkan aplikasi</p>
        <div style={s.qrBox}>
          <svg width="90" height="90" viewBox="0 0 90 90">
            <rect width="90" height="90" fill="white"/>
            <rect x="5" y="5" width="35" height="35" rx="4" fill="#000"/>
            <rect x="11" y="11" width="23" height="23" rx="1" fill="#fff"/>
            <rect x="16" y="16" width="13" height="13" fill="#000"/>
            <rect x="50" y="5" width="35" height="35" rx="4" fill="#000"/>
            <rect x="56" y="11" width="23" height="23" rx="1" fill="#fff"/>
            <rect x="61" y="16" width="13" height="13" fill="#000"/>
            <rect x="5" y="50" width="35" height="35" rx="4" fill="#000"/>
            <rect x="11" y="56" width="23" height="23" rx="1" fill="#fff"/>
            <rect x="16" y="61" width="13" height="13" fill="#000"/>
            <rect x="50" y="50" width="10" height="10" fill="#000"/>
            <rect x="65" y="50" width="10" height="10" fill="#000"/>
            <rect x="50" y="65" width="10" height="10" fill="#000"/>
            <rect x="65" y="65" width="10" height="10" fill="#000"/>
            <rect x="75" y="50" width="10" height="10" fill="#000"/>
            <rect x="75" y="65" width="10" height="10" fill="#000"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', backgroundColor: '#101010',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#f3f3f3', position: 'relative', overflow: 'hidden',
  },
  ballsLeft: {
    position: 'absolute', left: -80, top: '50%',
    transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column',
  },
  ballsRight: {
    position: 'absolute', right: -80, top: '50%',
    transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column',
  },
  center: {
    width: '100%', maxWidth: 420, display: 'flex',
    flexDirection: 'column', alignItems: 'center', zIndex: 1,
    padding: '0 20px', boxSizing: 'border-box',
  },
  logoWrap: { marginBottom: 28 },
  title: { fontSize: 15, fontWeight: 600, textAlign: 'center', marginBottom: 20, color: '#f3f3f3' },
  form: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    width: '100%', backgroundColor: '#1e1e1e', border: '1px solid #333',
    borderRadius: 12, padding: '14px 16px', color: '#f3f3f3', fontSize: 15,
    outline: 'none', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', backgroundColor: '#f3f3f3', color: '#000', border: 'none',
    borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginTop: 4,
  },
  forgotText: { fontSize: 13, color: '#888', marginTop: 14, cursor: 'pointer' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333' },
  dividerText: { fontSize: 13, color: '#555' },
  googleWrap: { width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 12 },
  igBtn: {
    width: '100%', backgroundColor: '#1e1e1e', border: '1px solid #333',
    borderRadius: 12, padding: '14px 16px', color: '#f3f3f3', fontSize: 15,
    fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
    marginTop: 8,
  },
  igIcon: { display: 'flex', alignItems: 'center' },
  errorBox: {
    width: '100%', backgroundColor: '#2a1010', border: '1px solid #ff4444',
    color: '#ff8080', borderRadius: 8, padding: '10px 14px', fontSize: 13,
    marginBottom: 12, boxSizing: 'border-box',
  },
  footer: { marginTop: 32, fontSize: 12, color: '#555', textAlign: 'center', lineHeight: 2 },
  footerLink: { cursor: 'pointer' },
  qrWrap: {
    position: 'absolute', bottom: 24, right: 24,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  qrText: { fontSize: 12, color: '#555' },
  qrBox: { borderRadius: 8, overflow: 'hidden', border: '1px solid #333' },
}