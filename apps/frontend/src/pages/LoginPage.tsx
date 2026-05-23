// apps/frontend/src/pages/LoginPage.tsx
// Dikerjakan oleh: Adhelia
// Target: Login & Register berhasil, data tersimpan di BE, UI clone Threads asli

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../stores/auth.store'

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
    <div className="min-h-screen bg-[#101010] text-[#f3f3f3] font-sans flex flex-col relative overflow-hidden selection:bg-[#333]">
      
      {/* Background Graphic (User Uploaded Pattern) */}
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
          
          {/* Logo Threads */}
          <div className="mb-6 md:mb-10 text-white">
            <svg viewBox="0 0 192 192" width={56} height={56} fill="currentColor">
              <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.23c8.25.053 14.476 2.452 18.502 7.13 2.932 3.405 4.893 8.11 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.068c.224 28.617 6.882 51.447 19.788 67.852C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z"/>
            </svg>
          </div>

          <h1 className="text-[16px] md:text-[18px] font-bold text-center mb-6 text-[#f3f3f3] tracking-wide">
            {mode === 'login' ? 'Login dengan akun Instagram Anda' : 'Buat Akun Threads Baru'}
          </h1>

          {error && (
            <div className="w-full bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl px-4 py-3 text-[14px] mb-4 text-center">
              {error}
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

          {/* Google Login container */}
          <div className="w-full flex justify-center mb-5 hover:scale-[1.02] active:scale-[0.98] transition-transform">
            <div className="overflow-hidden rounded-xl border border-[#333] bg-black">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError('Login Google gagal.')}
                theme="filled_black"
                shape="rectangular"
                size="large"
                text={mode === 'login' ? 'signin_with' : 'signup_with'}
                width="380" // approximate width of the container
              />
            </div>
          </div>

          {/* Toggle login/register -> The Instagram-style switch button */}
          <button 
            onClick={switchMode}
            className="w-full bg-transparent border border-[#333] hover:bg-[#1a1a1a] active:scale-[0.98] rounded-xl px-5 py-[16px] text-[#f3f3f3] text-[15px] font-semibold cursor-pointer flex items-center gap-4 transition-all"
          >
            <span className="flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig)" strokeWidth="2.5"/>
                <circle cx="12" cy="12" r="4.5" stroke="url(#ig2)" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
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
            <span className="flex-1 text-center">
              {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
            </span>
            <span className="text-[#555] text-lg font-light">›</span>
          </button>

        </div>
      </div>

      {/* Footer text */}
      <footer className="w-full flex justify-center pb-6 z-10 px-4">
        <p className="text-[12px] md:text-[13px] text-[#555] text-center flex flex-wrap justify-center gap-x-4 gap-y-2">
          <span>© 2026</span>
          <span className="hover:underline cursor-pointer">Ketentuan Threads</span>
          <span className="hover:underline cursor-pointer">Kebijakan Privasi</span>
          <span className="hover:underline cursor-pointer">Kebijakan Cookie</span>
          <span className="hover:underline cursor-pointer">Laporkan masalah</span>
        </p>
      </footer>

      {/* QR pojok kanan bawah (hanya di Desktop) */}
      <div className="hidden lg:flex flex-col items-center gap-3 absolute bottom-8 right-8 z-10 opacity-70 hover:opacity-100 transition-opacity">
        <p className="text-[12px] font-semibold text-[#555]">Pindai untuk aplikasi</p>
        <div className="bg-white p-2 rounded-xl">
          {/* Simple QR Code placeholder shape */}
          <svg width="84" height="84" viewBox="0 0 90 90">
            <rect width="90" height="90" fill="white" rx="4"/>
            <rect x="5" y="5" width="35" height="35" rx="6" fill="#000"/>
            <rect x="12" y="12" width="21" height="21" rx="2" fill="#fff"/>
            <rect x="17" y="17" width="11" height="11" rx="1" fill="#000"/>
            
            <rect x="50" y="5" width="35" height="35" rx="6" fill="#000"/>
            <rect x="57" y="12" width="21" height="21" rx="2" fill="#fff"/>
            <rect x="62" y="17" width="11" height="11" rx="1" fill="#000"/>
            
            <rect x="5" y="50" width="35" height="35" rx="6" fill="#000"/>
            <rect x="12" y="57" width="21" height="21" rx="2" fill="#fff"/>
            <rect x="17" y="62" width="11" height="11" rx="1" fill="#000"/>
            
            <rect x="50" y="50" width="15" height="15" rx="2" fill="#000"/>
            <rect x="70" y="50" width="15" height="15" rx="2" fill="#000"/>
            <rect x="50" y="70" width="15" height="15" rx="2" fill="#000"/>
            <rect x="70" y="70" width="15" height="15" rx="2" fill="#000"/>
            <rect x="65" y="65" width="10" height="10" rx="1" fill="#000"/>
          </svg>
        </div>
      </div>
      
    </div>
  )
}