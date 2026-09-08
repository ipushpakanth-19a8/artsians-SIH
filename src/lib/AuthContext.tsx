import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Artisan } from '../types';

export type UserRole = 'seller' | 'buyer' | 'admin' | null;

interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  artisan?: Artisan;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  login: (role: UserRole, artisan?: Artisan) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
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
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('kalatech_auth');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const role = user?.role ?? null;

  const login = (newRole: UserRole, artisan?: Artisan) => {
    const art = artisan || DEFAULT_ARTISAN;
    const newUser: AuthUser = {
      id: newRole === 'admin' ? 'admin-01' : newRole === 'buyer' ? 'buyer-01' : art.user_id,
      name: newRole === 'admin' ? 'Admin' : newRole === 'buyer' ? 'Buyer' : art.name,
      phone: newRole === 'admin' ? '9999999999' : newRole === 'buyer' ? '9876543210' : art.phone,
      role: newRole,
      artisan: newRole === 'seller' ? art : undefined,
    };
    setUser(newUser);
    try {
      localStorage.setItem('kalatech_auth', JSON.stringify(newUser));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('kalatech_auth');
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isAuthenticated: !!user }}>
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
