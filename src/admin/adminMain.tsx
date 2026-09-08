import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminAuthProvider } from './AdminAuthContext';
import { AdminApp } from './AdminApp';
import '../index.css';

const container = document.getElementById('admin-root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <AdminAuthProvider>
        <AdminApp />
      </AdminAuthProvider>
    </StrictMode>
  );
}
