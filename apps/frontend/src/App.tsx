import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'

// Halaman placeholder sementara (nanti diganti tim masing-masing)
function HomePage() {
  return <div style={{ color: '#fff', padding: 24 }}>🏠 Beranda — dikerjakan Aisyah</div>
}
function FormPostPage() {
  return <div style={{ color: '#fff', padding: 24 }}>📝 Form Post — dikerjakan Andy</div>
}
function NotifPage() {
  return <div style={{ color: '#fff', padding: 24 }}>🔔 Notifikasi — dikerjakan Iqlima</div>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/post" element={<FormPostPage />} />
        <Route path="/notifications" element={<NotifPage />} />
        {/* Redirect semua path tidak dikenal ke beranda */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App