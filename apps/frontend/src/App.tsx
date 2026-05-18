import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Feed from './pages/Feed'
import FormPostPage from './pages/FormPostPage'
import NotifPage from './pages/NotifPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/post" element={<FormPostPage />} />
        <Route path="/notifications" element={<NotifPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App