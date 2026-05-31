// apps/frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Feed from './pages/Feed'
import FormPostPage from './pages/FormPostPage'
import NotifPage from './pages/NotifPage'
import EditProfilePage from './pages/EditProfilePage'
import DetailPostPage from './pages/DetailPostPage'
import Navbar from './components/Navbar'
import { useAuthStore } from './stores/useAuthStore'

// Guard 1: Untuk halaman yang WAJIB LOGIN
function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

// Guard 2: Untuk halaman yang TIDAK BOLEH DIAKSES kalau sudah login (e.g., /login)
function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <BrowserRouter>
      {/* Navbar hanya muncul jika sudah login */}
      {isAuthenticated && <Navbar />}
      
      {/* Layout wrapper untuk konten utama */}
      <div className={isAuthenticated ? 'md:pl-60' : ''}>
        <Routes>
          
          {/* 🔐 KELOMPOK RUTE PROTECTED (Wajib Login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Feed />} />
            <Route path="/post" element={<FormPostPage />} />
            <Route path="/post/:id" element={<DetailPostPage />} />
            <Route path="/notifications" element={<NotifPage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
          </Route>

          {/* 🔓 KELOMPOK RUTE GUEST (Tidak Boleh Login) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* 🔄 Fallback untuk route yang tidak terdaftar */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  )
}