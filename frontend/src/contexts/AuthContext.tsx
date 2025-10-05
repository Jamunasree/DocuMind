// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { user: userData, token } = response.data.data;
      
      const formattedUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      };
      
      setUser(formattedUser);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(formattedUser));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      const { user: userData, token } = response.data.data;
      
      const formattedUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      };
      
      setUser(formattedUser);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(formattedUser));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  };

  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const response = await api.put('/users/profile', updates);
      const updatedUser = response.data.data;
      
      const formattedUser: User = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      };
      
      setUser(formattedUser);
      localStorage.setItem('user_data', JSON.stringify(formattedUser));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUserProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};