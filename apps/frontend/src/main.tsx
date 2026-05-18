<<<<<<< HEAD
// apps/frontend/src/main.tsx
=======
>>>>>>> 7397ce46e8b8638c965fbbf288adb3afa417592f
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'
<<<<<<< HEAD

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <App />
=======
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
      <Toaster position="top-center" richColors />
>>>>>>> 7397ce46e8b8638c965fbbf288adb3afa417592f
    </GoogleOAuthProvider>
  </StrictMode>
)