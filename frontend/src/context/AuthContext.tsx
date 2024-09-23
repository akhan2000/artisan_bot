// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/User';
import { getCurrentUser } from '../services/api';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean; 
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'light');
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (token: string) => {
    try {
      console.log("Received Token:", token); // Debugging  
      setLoading(true);
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      const userData = await getCurrentUser(); // Fetch user data from backend
      console.log("Fetched User Data:", userData);
      setUser(userData);
    } catch (error) {
        console.error("Failed to fetch user data:", error);
        logout();
        throw error;
      } finally {
        setLoading(false); // Set loading to false after login attempt
        console.log("Login process completed. Loading:", loading);
      }
    };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setTheme('light'); // Reset to light mode on logout (can have a seperate file for theme context for seperation of features, but currently keeping as is for speed purposes)
    localStorage.setItem('theme', 'light');
    document.body.className = 'light-theme';
    setLoading(false);
  };

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  useEffect(() => {
    // On component mount, check if token exists and fetch user data
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then(userData => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(error => {
          console.error("Failed to fetch user data:", error);
          logout();
        })
        .finally(() => {
          setLoading(false); // Set loading to false after fetch attempt
        });
    } else {
      setLoading(false); // No token, set loading to false
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

