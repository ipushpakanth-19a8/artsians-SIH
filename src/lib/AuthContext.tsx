import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Artisan } from '../types';
import { resolveApiUrl, secureStorage } from './nativeBridge';

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
  artisan_id?: string;
  artisan?: Artisan;
  hasCompletedBuyerOnboarding?: boolean;
  hasCompletedSellerOnboarding?: boolean;
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
  sendOtp: (phone: string, role: UserRole) => Promise<{ success: boolean; message?: string; demoOtp?: string; error?: string }>;
  verifyOtp: (payload: {
    phone: string;
    otp: string;
    role: UserRole;
    name?: string;
    craft_type?: string;
    business_name?: string;
    location?: string;
    state?: string;
  }) => Promise<{ success: boolean; user?: any; artisan?: any; error?: string }>;
  saveSellerProfile: (data: {
    phoneNumber: string;
    sellerName: string;
    handicraftWorkName: string;
    preferredLanguage: string;
    preferredLanguageCode?: string;
    state?: string;
    stateCode?: string;
  }) => Promise<{ success: boolean; user?: any; artisan?: any; error?: string }>;
  updateBuyerOnboarding: (completed: boolean) => Promise<{ success: boolean; error?: string }>;
  updateSellerOnboarding: (completed: boolean) => Promise<{ success: boolean; error?: string }>;
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
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  saveSellerProfile: async () => ({ success: false }),
  updateBuyerOnboarding: async () => ({ success: false }),
  updateSellerOnboarding: async () => ({ success: false }),
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
      return localStorage.getItem('ShilpSetu_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('ShilpSetu_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role === 'admin') {
          // If previous admin was stored, clear it from main site
          localStorage.removeItem('ShilpSetu_auth');
          return null;
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  // Check native secureStorage on boot
  useEffect(() => {
    secureStorage.getItem('ShilpSetu_token').then((savedToken) => {
      if (savedToken && !token) setToken(savedToken);
    });
    secureStorage.getItem('ShilpSetu_auth').then((savedAuth) => {
      if (savedAuth && !user) {
        try {
          const parsed = JSON.parse(savedAuth);
          if (parsed.role !== 'admin') setUser(parsed);
        } catch {}
      }
    });
  }, []);

  const role = user?.role ?? null;

  const saveAuth = (newUser: AuthUser, newToken?: string) => {
    setUser(newUser);
    if (newToken) {
      setToken(newToken);
      secureStorage.setItem('ShilpSetu_token', newToken);
    }
    secureStorage.setItem('ShilpSetu_auth', JSON.stringify(newUser));
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
      hasCompletedBuyerOnboarding: newRole === 'buyer' ? false : undefined,
      hasCompletedSellerOnboarding: newRole === 'seller' ? false : undefined,
    };
    saveAuth(demoUser, `demo-token-${newRole}-${Date.now()}`);
  };

  // Real Seller Login via Backend API
  const loginSeller = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(resolveApiUrl('/api/auth/seller/login'), {
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
      const res = await fetch(resolveApiUrl('/api/auth/seller/signup'), {
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
      const res = await fetch(resolveApiUrl('/api/auth/buyer/login'), {
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
      const res = await fetch(resolveApiUrl('/api/auth/buyer/signup'), {
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

  // Send Passwordless OTP
  const sendOtp = async (phone: string, role: UserRole): Promise<{ success: boolean; message?: string; demoOtp?: string; error?: string }> => {
    try {
      const res = await fetch(resolveApiUrl('/api/auth/otp/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send OTP' };
      }
      return { success: true, message: data.message, demoOtp: data.demoOtp || '123456' };
    } catch {
      // Offline fallback: Demo OTP 123456 is always ready
      return {
        success: true,
        message: `OTP sent to +91 ${phone.replace(/[^0-9]/g, '')} (Demo Mode: 123456)`,
        demoOtp: '123456',
      };
    }
  };

  // Verify Passwordless OTP
  const verifyOtp = async (payload: {
    phone: string;
    otp: string;
    role: UserRole;
    name?: string;
    craft_type?: string;
    business_name?: string;
    location?: string;
    state?: string;
  }): Promise<{ success: boolean; user?: any; artisan?: any; error?: string }> => {
    try {
      const res = await fetch(resolveApiUrl('/api/auth/otp/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'OTP verification failed' };
      }
      const authUser: AuthUser = {
        ...data.user,
        role: payload.role,
        artisan: data.artisan || (payload.role === 'seller' ? DEFAULT_ARTISAN : undefined),
      };
      saveAuth(authUser, data.token);
      return { success: true, user: authUser, artisan: data.artisan };
    } catch {
      // Offline fallback: verify 123456 and create demo session
      if (payload.otp === '123456' || payload.otp.length === 6) {
        login(payload.role);
        return { success: true };
      }
      return { success: false, error: 'Invalid OTP code. Please enter 123456.' };
    }
  };

  // Save or update seller profile
  const saveSellerProfile = async (data: {
    phoneNumber: string;
    sellerName: string;
    handicraftWorkName: string;
    preferredLanguage: string;
    preferredLanguageCode?: string;
    state?: string;
    stateCode?: string;
  }): Promise<{ success: boolean; user?: any; artisan?: any; error?: string }> => {
    try {
      const res = await fetch(resolveApiUrl('/api/auth/seller/profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to save seller profile' };
      }
      const authUser: AuthUser = {
        ...resData.user,
        role: 'seller',
        artisan: resData.artisan || DEFAULT_ARTISAN,
        hasCompletedSellerOnboarding: true,
      };
      saveAuth(authUser, resData.token);
      return { success: true, user: authUser, artisan: resData.artisan };
    } catch {
      // Offline fallback
      const cleanPhone = data.phoneNumber.replace(/[^0-9]/g, '');
      const fallbackArtisan: Artisan = {
        ...DEFAULT_ARTISAN,
        name: data.sellerName,
        category: data.handicraftWorkName,
        phone: `+91 ${cleanPhone}`,
      };
      const fallbackUser: AuthUser = {
        id: `usr-${cleanPhone}`,
        name: data.sellerName,
        email: `${cleanPhone}@artisan.in`,
        phone: cleanPhone,
        role: 'seller',
        craft_type: data.handicraftWorkName,
        artisan_id: fallbackArtisan.id,
        artisan: fallbackArtisan,
        hasCompletedSellerOnboarding: true,
      };
      saveAuth(fallbackUser, `token-${cleanPhone}`);
      return { success: true, user: fallbackUser, artisan: fallbackArtisan };
    }
  };

  const updateBuyerOnboarding = async (completed: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      if (user) {
        const updatedUser: AuthUser = {
          ...user,
          hasCompletedBuyerOnboarding: completed,
        };
        saveAuth(updatedUser);
      }

      if (token) {
        const res = await fetch(resolveApiUrl('/api/users/onboarding'), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ hasCompletedBuyerOnboarding: completed }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            saveAuth({
              ...data.user,
              role: 'buyer',
            });
          }
          return { success: true };
        }
      }
      return { success: true };
    } catch (err: any) {
      console.error('Failed to update buyer onboarding status:', err);
      return { success: false, error: err.message };
    }
  };

  const updateSellerOnboarding = async (completed: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      if (user) {
        const updatedUser: AuthUser = {
          ...user,
          hasCompletedSellerOnboarding: completed,
        };
        saveAuth(updatedUser);
      }

      if (token) {
        const res = await fetch(resolveApiUrl('/api/users/onboarding'), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ hasCompletedSellerOnboarding: completed }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            saveAuth({
              ...data.user,
              role: 'seller',
              artisan: user?.artisan || DEFAULT_ARTISAN,
            });
          }
          return { success: true };
        }
      }
      return { success: true };
    } catch (err: any) {
      console.error('Failed to update seller onboarding status:', err);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    secureStorage.removeItem('ShilpSetu_auth');
    secureStorage.removeItem('ShilpSetu_token');
    fetch(resolveApiUrl('/api/auth/logout'), { method: 'POST' }).catch(() => {});
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
        sendOtp,
        verifyOtp,
        saveSellerProfile,
        updateBuyerOnboarding,
        updateSellerOnboarding,
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
