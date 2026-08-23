import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp.tsx';
import { AuthProvider } from './hooks/useAuth';
import { OfflineProvider } from './lib/OfflineContext';
import './index.css';


// Suppress harmless Firebase connectivity warnings in dev environment
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args.map(a => (typeof a === 'string' ? a : (a?.message || a?.toString() || ''))).join(' ');
  if (
    msg.includes('Could not reach Cloud Firestore backend') || 
    msg.includes('[code=unavailable]') ||
    msg.includes("Backend didn't respond")
  ) {
    return;
  }
  originalConsoleError(...args);
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}



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
