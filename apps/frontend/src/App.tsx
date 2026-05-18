import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
<<<<<<< HEAD

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
=======
import Feed from './pages/Feed'
import FormPostPage from './pages/FormPostPage'
import NotifPage from './pages/NotifPage'
import DetailPostPage from './pages/DetailPostPage'
>>>>>>> 7397ce46e8b8638c965fbbf288adb3afa417592f

function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/post" element={<FormPostPage />} />
        <Route path="/notifications" element={<NotifPage />} />
        {/* Redirect semua path tidak dikenal ke beranda */}
=======
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/post/new" element={<FormPostPage />} />
        <Route path="/post/:id" element={<DetailPostPage />} />
        <Route path="/notifications" element={<NotifPage />} />
>>>>>>> 7397ce46e8b8638c965fbbf288adb3afa417592f
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App