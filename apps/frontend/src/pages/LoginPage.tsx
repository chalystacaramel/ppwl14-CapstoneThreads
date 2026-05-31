// apps/frontend/src/pages/LoginPage.tsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'
import { BACKEND_URL } from '../constants'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'

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

// ─── Threadster Logo (dari file ke-2) ────────────────────────
function ThreadsterLogo({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none">
      <rect x="8" y="10" width="48" height="6" rx="3" fill="currentColor" />
      <rect x="27" y="10" width="10" height="44" rx="5" fill="currentColor" />
      <ellipse cx="32" cy="22" rx="16" ry="5" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.5" />
      <ellipse cx="32" cy="42" rx="12" ry="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.35" />
    </svg>
  )
}

// ─── Komponen utama ───────────────────────────────────────────
export default function LoginPage() {
  const { loginWithGoogle,
    isLoading: isGoogleLoading, error: errorGoogle } = useGoogleAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleWidth, setGoogleWidth] = useState(380)

  useEffect(() => {
    function handleResize() {
      const calculated = Math.min(window.innerWidth - 48, 380)
      setGoogleWidth(calculated > 200 ? calculated : 200)
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
        : {
          name: form.name,
          username: form.email.split('@')[0],
          email: form.email,
          password: form.password
        }
      const data = await apiFetch<AuthResponse>(endpoint, {
        method: 'POST', body: JSON.stringify(body),
      })
      setAuth(data.user, data.accessToken)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-[#101010] text-[#f3f3f3] font-sans flex flex-col relative overflow-x-hidden selection:bg-[#333]">

      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
        <img
          src="/threads-pattern.png"
          alt="background pattern"
          className="w-full max-w-[177vw] min-w-[1200px] object-cover md:object-contain object-top opacity-100"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full px-4 pt-10 pb-16 sm:pb-24">

        {/* Container Utama Form */}
        <div className="w-full max-w-[420px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">

          {/* Logo Threadster */}
          <div className="mb-6 md:mb-10 text-white">
            <ThreadsterLogo size={56} />
          </div>

          <h1 className="text-[16px] md:text-[18px] font-bold text-center mb-6 text-[#f3f3f3] tracking-wide">
            {mode === 'login' ? 'Login dengan akun Instagram Anda' : 'Buat Akun Tehreads Baru'}
          </h1>

          {error && (
            <div className="w-full bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl px-4 py-3 text-[14px] mb-4 text-center">
              {error}
            </div>
          )}
          {errorGoogle && (
            <div className="w-full bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl px-4 py-3 text-[14px] mb-4 text-center">
              {errorGoogle}
            </div>
          )}
          {/* Form Input Group */}
          <div className="w-full flex flex-col gap-3">
            {mode === 'register' && (
              <input
                className="w-full bg-[#1e1e1e] border border-[#333] focus:border-[#555] rounded-xl px-5 py-[18px] text-[#f3f3f3] text-[15px] outline-none transition-colors placeholder:text-[#555]"
                type="text" name="name" placeholder="Nama lengkap"
                value={form.name} onChange={handleChange} onKeyDown={handleKeyDown}
              />
            )}
            <input
              className="w-full bg-[#1e1e1e] border border-[#333] focus:border-[#555] rounded-xl px-5 py-[18px] text-[#f3f3f3] text-[15px] outline-none transition-colors placeholder:text-[#555]"
              type="email" name="email"
              placeholder="Nama pengguna, telepon, atau email"
              value={form.email} onChange={handleChange} onKeyDown={handleKeyDown}
            />
            <input
              className="w-full bg-[#1e1e1e] border border-[#333] focus:border-[#555] rounded-xl px-5 py-[18px] text-[#f3f3f3] text-[15px] outline-none transition-colors placeholder:text-[#555]"
              type="password" name="password" placeholder="Kata Sandi"
              value={form.password} onChange={handleChange} onKeyDown={handleKeyDown}
            />

            <button
              className="w-full bg-[#f3f3f3] hover:bg-[#e0e0e0] active:scale-[0.98] text-black border-none rounded-xl py-[16px] text-[15px] font-bold cursor-pointer mt-2 transition-all disabled:opacity-70 disabled:active:scale-100"
              onClick={handleSubmit} disabled={loading}
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'Login' : 'Daftar'}
            </button>
          </div>

          {mode === 'login' && (
            <div className="w-full text-center mt-5">
              <span className="text-[14.5px] text-[#777] hover:text-[#aaa] transition-colors cursor-pointer">
                Lupa kata sandi?
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 w-full my-7">
            <div className="flex-1 h-[1px] bg-[#333]" />
            <span className="text-[14px] text-[#555] font-semibold">atau</span>
            <div className="flex-1 h-[1px] bg-[#333]" />
          </div>

          {/* Google Login */}
          <div className="w-full flex justify-center mb-5 hover:scale-[1.02] active:scale-[0.98] transition-transform">
            <div className="overflow-hidden rounded-xl border border-[#333] bg-black">
              <button
                onClick={() => loginWithGoogle()}
                disabled={isGoogleLoading}
                style={{ width: '300px', padding: '12px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}
              >
                {isGoogleLoading ? 'Memuat...' : '🚀 Masuk dengan Google'}
              </button>
            </div>
          </div>

          {/* Toggle login/register */}
          <button
            onClick={switchMode}
            className="w-full bg-transparent border border-[#333] hover:bg-[#1a1a1a] active:scale-[0.98] rounded-xl px-5 py-[16px] text-[#f3f3f3] text-[15px] font-semibold cursor-pointer flex items-center gap-4 transition-all"
          >
            <span className="flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig)" strokeWidth="2.5" />
                <circle cx="12" cy="12" r="4.5" stroke="url(#ig2)" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
                <defs>
                  <linearGradient id="ig" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f9ce34" /><stop offset="0.4" stopColor="#ee2a7b" /><stop offset="1" stopColor="#6228d7" />
                  </linearGradient>
                  <linearGradient id="ig2" x1="8" y1="16" x2="16" y2="8" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f9ce34" /><stop offset="0.4" stopColor="#ee2a7b" /><stop offset="1" stopColor="#6228d7" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="flex-1 text-center">
              {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
            </span>
            <span className="text-[#555] text-lg font-light">›</span>
          </button>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full flex justify-center pb-6 z-10 px-4">
        <p className="text-[12px] md:text-[13px] text-[#555] text-center flex flex-wrap justify-center gap-x-4 gap-y-2">
          <span>© 2026</span>
          <span className="hover:underline cursor-pointer">Ketentuan Tehreads</span>
          <span className="hover:underline cursor-pointer">Kebijakan Privasi</span>
          <span className="hover:underline cursor-pointer">Kebijakan Cookie</span>
          <span className="hover:underline cursor-pointer">Laporkan masalah</span>
        </p>
      </footer>

      {/* QR pojok kanan bawah (Desktop only) */}
      <div className="hidden lg:flex flex-col items-center gap-3 absolute bottom-8 right-8 z-10 opacity-70 hover:opacity-100 transition-opacity">
        <p className="text-[12px] font-semibold text-[#555]">Pindai untuk aplikasi</p>
        <div className="bg-white p-2 rounded-xl">
          <svg width="84" height="84" viewBox="0 0 90 90">
            <rect width="90" height="90" fill="white" rx="4" />
            <rect x="5" y="5" width="35" height="35" rx="6" fill="#000" />
            <rect x="12" y="12" width="21" height="21" rx="2" fill="#fff" />
            <rect x="17" y="17" width="11" height="11" rx="1" fill="#000" />
            <rect x="50" y="5" width="35" height="35" rx="6" fill="#000" />
            <rect x="57" y="12" width="21" height="21" rx="2" fill="#fff" />
            <rect x="62" y="17" width="11" height="11" rx="1" fill="#000" />
            <rect x="5" y="50" width="35" height="35" rx="6" fill="#000" />
            <rect x="12" y="57" width="21" height="21" rx="2" fill="#fff" />
            <rect x="17" y="62" width="11" height="11" rx="1" fill="#000" />
            <rect x="50" y="50" width="15" height="15" rx="2" fill="#000" />
            <rect x="70" y="50" width="15" height="15" rx="2" fill="#000" />
            <rect x="50" y="70" width="15" height="15" rx="2" fill="#000" />
            <rect x="70" y="70" width="15" height="15" rx="2" fill="#000" />
            <rect x="65" y="65" width="10" height="10" rx="1" fill="#000" />
          </svg>
        </div>
      </div>

    </div>
  )
}