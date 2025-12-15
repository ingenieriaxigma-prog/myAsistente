// Context para información del usuario

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  birthDate: string;
  gender: string;
  photoUrl: string;
  createdAt: Date;
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (userData: UserProfile) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback((userData: UserProfile) => {
    setUser(userData);
    // Aquí se podría guardar en localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: user !== null,
    login,
    logout,
    updateProfile,
  }), [user, login, logout, updateProfile]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Hook personalizado para usar el contexto de usuario
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de UserProvider');
  }
  return context;
}
