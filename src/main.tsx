import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp.tsx';
import { AuthProvider } from './hooks/useAuth';
import { OfflineProvider } from './lib/OfflineContext';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // We could show a toast here
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});

const isAdminRoute = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OfflineProvider>
    <AuthProvider>
      {isAdminRoute ? <AdminApp /> : <App />}
    </AuthProvider>
    </OfflineProvider>
  </StrictMode>,
);
