'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define theme types
export type ThemeType = 'dark' | 'light';

// Interface for the theme context state
interface ThemeContextState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextState>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: true,
});

// Props for the ThemeProvider component
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeType;
}

// The provider component that wraps the application
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'dark' 
}) => {
  // Initialize theme state from localStorage if available, otherwise use defaultTheme
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('polkadotDeFiTheme');
      return (savedTheme as ThemeType) || defaultTheme;
    }
    return defaultTheme;
  });

  // Computed property for dark mode check
  const isDark = theme === 'dark';

  // Effect to update document classes and localStorage when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Save to localStorage
      localStorage.setItem('polkadotDeFiTheme', theme);
      
      // Update document classes
      const root = window.document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        // Set dark mode colors for the document
        document.documentElement.style.setProperty('--background-color', '#0f172a');
        document.documentElement.style.setProperty('--text-color', '#f8fafc');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        // Set light mode colors for the document
        document.documentElement.style.setProperty('--background-color', '#f8fafc');
        document.documentElement.style.setProperty('--text-color', '#0f172a');
      }
    }
  }, [theme]);

  // Set the theme
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  // Toggle between dark and light themes
  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Provide the theme context to children components
  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
