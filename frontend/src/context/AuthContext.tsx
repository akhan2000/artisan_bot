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
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: true,
  theme: 'light',
  setTheme: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });
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

    const logout = (resetTheme: boolean = false) => {
      console.log(`Logging out. Reset theme: ${resetTheme}`);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
  
      if (resetTheme) {
        setTheme('light'); // Reset to light mode
        localStorage.setItem('theme', 'light');
        document.body.className = 'light-theme';
        console.log("Theme reset to light.");
      }
  
      setLoading(false);
      console.log("User logged out, token removed from storage");
    };

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', theme);
  }, [theme]);


  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          setLoading(true); // Start loading
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
          console.log("Initialized Auth - User Data:", userData);
        } catch (error) {
          console.error("Failed to fetch user data on init:", error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading, theme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

