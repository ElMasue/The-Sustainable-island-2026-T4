import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for leaflet.markercluster: it expects L to be globally available
if (typeof window !== 'undefined') {
  (window as any).L = L;
}

import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { AppSettingsProvider } from './context/AppSettingsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppSettingsProvider>
          <App />
        </AppSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
