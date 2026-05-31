import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="136995182110-55u2eagcn3dabur37ckqm9ti77neu7oe.apps.googleusercontent.com">
      <App />
      <Toaster position="top-center" richColors />
    </GoogleOAuthProvider>
  </StrictMode>
)