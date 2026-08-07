import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { store, supabase } from '../services/store';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await store.getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const currentUser = await store.getCurrentUser();
            setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const loggedUser = await store.login(email, password);
      setUser(loggedUser);
    } catch (e) {
      console.error("Login error:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role?: UserRole) => {
      setLoading(true);
      try {
          await store.register(email, password, name, role);
          const currentUser = await store.getCurrentUser();
          if (currentUser) setUser(currentUser);
      } catch (e) {
          console.error("Register error:", e);
          throw e;
      } finally {
          setLoading(false);
      }
  };

  const logout = async () => {
    await store.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const currentUser = await store.getCurrentUser();
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      refreshUser,
      isAuthenticated: !!user,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
