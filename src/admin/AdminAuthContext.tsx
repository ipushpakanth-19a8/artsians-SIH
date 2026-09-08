import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin';
  last_login?: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  fetchAdmin: (url: string, options?: RequestInit) => Promise<Response>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminUser: null,
  adminToken: null,
  isAuthenticated: false,
  loginAdmin: async () => ({ success: false }),
  logoutAdmin: () => {},
  fetchAdmin: async () => new Response(),
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('kalatech_admin_token') || null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('kalatech_admin_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role === 'admin') return parsed;
      }
    } catch {}
    return null;
  });

  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      const user: AdminUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: 'admin',
        last_login: data.user.last_login,
      };

      setAdminUser(user);
      setAdminToken(data.token);

      try {
        localStorage.setItem('kalatech_admin_token', data.token);
        localStorage.setItem('kalatech_admin_user', JSON.stringify(user));
      } catch {}

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection failed' };
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setAdminToken(null);
    try {
      localStorage.removeItem('kalatech_admin_token');
      localStorage.removeItem('kalatech_admin_user');
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
  };

  // Helper to make authenticated requests to /api/admin/*
  const fetchAdmin = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (adminToken) {
      headers.set('Authorization', `Bearer ${adminToken}`);
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    return fetch(url, {
      ...options,
      headers,
    });
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isAuthenticated: !!adminUser && !!adminToken,
        loginAdmin,
        logoutAdmin,
        fetchAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
