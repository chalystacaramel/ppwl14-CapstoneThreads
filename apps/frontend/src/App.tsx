// apps/frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Feed from './pages/Feed'
import FormPostPage from './pages/FormPostPage'
import NotifPage from './pages/NotifPage'
import EditProfilePage from './pages/EditProfilePage'
import DetailPostPage from './pages/DetailPostPage'
import Navbar from './components/layout/Navbar'
import { useAuthStore } from './stores/auth.store'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  if (!hasHydrated) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      {/* Desktop: sidebar width 200px | Mobile: bottom nav 56px */}
      <div className={isAuthenticated ? 'md:pl-[240px]' : ''}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/login" element={
            !hasHydrated ? null :
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } />
          <Route path="/post" element={<ProtectedRoute><FormPostPage /></ProtectedRoute>} />
          <Route path="/post/:id" element={<ProtectedRoute><DetailPostPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotifPage /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App