import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminAuthProvider } from './AdminAuthContext';
import { AdminApp } from './AdminApp';
import { RootErrorBoundary } from '../components/common/RootErrorBoundary';
import '../index.css';

const container = document.getElementById('admin-root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <RootErrorBoundary>
        <AdminAuthProvider>
          <AdminApp />
        </AdminAuthProvider>
      </RootErrorBoundary>
    </StrictMode>
  );
}
