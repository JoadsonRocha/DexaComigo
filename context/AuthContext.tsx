
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { store } from '../services/store';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
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
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
      const loggedUser = await store.login(email);
      setUser(loggedUser);
    } catch (e) {
      console.error("Login error:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await store.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
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
