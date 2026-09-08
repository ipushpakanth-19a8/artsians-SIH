import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Artisan } from '../types';

export type UserRole = 'seller' | 'buyer' | null;

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  craft_type?: string;
  business_name?: string;
  location?: string;
  state?: string;
  artisan?: Artisan;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  login: (role: UserRole, artisan?: Artisan) => void;
  loginSeller: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupSeller: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    craft_type: string;
    business_name?: string;
    location?: string;
    state?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginBuyer: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupBuyer: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    location?: string;
    state?: string;
    address?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  loginSeller: async () => ({ success: false }),
  signupSeller: async () => ({ success: false }),
  loginBuyer: async () => ({ success: false }),
  signupBuyer: async () => ({ success: false }),
  logout: () => {},
});

const DEFAULT_ARTISAN: Artisan = {
  id: 'art-01',
  user_id: 'usr-01',
  name: 'Rameshwar Rao',
  category: 'Weaving',
  state: 'Telangana',
  district: 'Yadadri Bhoodan Pochampally',
  bio: 'Master weaver carrying forward hereditary double-ikat Pochampally handloom traditions for over 25 years.',
  experience_years: 25,
  profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  phone: '+91 98480 12345',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('kalatech_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('kalatech_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role === 'admin') {
          // If previous admin was stored, clear it from main site
          localStorage.removeItem('kalatech_auth');
          return null;
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  const role = user?.role ?? null;

  const saveAuth = (newUser: AuthUser, newToken?: string) => {
    setUser(newUser);
    if (newToken) {
      setToken(newToken);
      try {
        localStorage.setItem('kalatech_token', newToken);
      } catch {}
    }
    try {
      localStorage.setItem('kalatech_auth', JSON.stringify(newUser));
    } catch {}
  };

  // Synchronous demo/fallback login
  const login = (newRole: UserRole, artisan?: Artisan) => {
    if (!newRole) {
      logout();
      return;
    }
    const art = artisan || DEFAULT_ARTISAN;
    const demoUser: AuthUser = {
      id: newRole === 'buyer' ? 'usr-buyer-01' : art.user_id,
      name: newRole === 'buyer' ? 'Anita Deshmukh' : art.name,
      phone: newRole === 'buyer' ? '9444077889' : art.phone,
      email: newRole === 'buyer' ? 'buyer@culturecurate.in' : 'rameshwar@artisan.in',
      role: newRole,
      craft_type: newRole === 'seller' ? art.category : undefined,
      artisan: newRole === 'seller' ? art : undefined,
    };
    saveAuth(demoUser, `demo-token-${newRole}-${Date.now()}`);
  };

  // Real Seller Login via Backend API
  const loginSeller = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/seller/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Seller sign in failed' };
      }
      const authUser: AuthUser = {
        ...data.user,
        role: 'seller',
        artisan: data.artisan || DEFAULT_ARTISAN,
      };
      saveAuth(authUser, data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to backend' };
    }
  };

  // Real Seller Sign Up via Backend API
  const signupSeller = async (formData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    craft_type: string;
    business_name?: string;
    location?: string;
    state?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/seller/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Seller registration failed' };
      }
      const authUser: AuthUser = {
        ...data.user,
        role: 'seller',
        artisan: data.artisan || DEFAULT_ARTISAN,
      };
      saveAuth(authUser, data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to backend' };
    }
  };

  // Real Buyer Login via Backend API
  const loginBuyer = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/buyer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Buyer sign in failed' };
      }
      const authUser: AuthUser = {
        ...data.user,
        role: 'buyer',
      };
      saveAuth(authUser, data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to backend' };
    }
  };

  // Real Buyer Sign Up via Backend API
  const signupBuyer = async (formData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    location?: string;
    state?: string;
    address?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/buyer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Buyer registration failed' };
      }
      const authUser: AuthUser = {
        ...data.user,
        role: 'buyer',
      };
      saveAuth(authUser, data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to backend' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('kalatech_auth');
      localStorage.removeItem('kalatech_token');
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user,
        login,
        loginSeller,
        signupSeller,
        loginBuyer,
        signupBuyer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function ProtectedRoute({ allowedRoles, children }: { allowedRoles: UserRole[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
