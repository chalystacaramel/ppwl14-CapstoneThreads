// apps/frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Feed from './pages/Feed'
import FormPostPage from './pages/FormPostPage'
import NotifPage from './pages/NotifPage'
import DetailPostPage from './pages/DetailPostPage'
import EditProfilePage from './pages/EditProfilePage'
import Navbar from './components/layout/Navbar'
import { useAuthStore } from './stores/auth.store'

// ─── Layout wrapper (Navbar + content) ────────────────────────
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#101010' }}>
      <div className="threads-desktop-nav" style={{ display: 'none' }}>
        <Navbar />
      </div>
      <div style={{ flex: 1 }} className="threads-main-content">
        {children}
      </div>
      <div className="threads-mobile-nav" style={{ display: 'none' }}>
        <Navbar />
      </div>
      <style>{`
        @media (min-width: 768px) {
          .threads-desktop-nav { display: block !important; }
          .threads-mobile-nav { display: none !important; }
          .threads-main-content { margin-left: 72px !important; }
        }
        @media (max-width: 767px) {
          .threads-desktop-nav { display: none !important; }
          .threads-mobile-nav { display: block !important; }
          .threads-main-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Protected Route ──────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// ─── Profile placeholder ──────────────────────────────────────
function ProfilePage() {
  return <AppLayout><div style={{ color: '#f3f3f3', padding: 24 }}>👤 Profil — coming soon</div></AppLayout>
}

function SearchPage() {
  return <AppLayout><div style={{ color: '#f3f3f3', padding: 24 }}>🔍 Pencarian — coming soon</div></AppLayout>
}

// ─── App ──────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout><Feed /></AppLayout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/post/new" element={<ProtectedRoute><FormPostPage /></ProtectedRoute>} />
        <Route path="/post/:id" element={<AppLayout><DetailPostPage /></AppLayout>} />
        <Route path="/notifications" element={<ProtectedRoute><NotifPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<AppLayout><ProfilePage /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App