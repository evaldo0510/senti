import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  sensoryMode: boolean;
  toggleSensoryMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [sensoryMode, setSensoryMode] = useState<boolean>(() => {
    return localStorage.getItem('sensoryMode') === 'true';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (sensoryMode) {
      root.style.filter = "sepia(45%) brightness(85%) contrast(92%)";
      root.style.transition = "filter 0.5s ease-in-out";
      localStorage.setItem('sensoryMode', 'true');
    } else {
      root.style.filter = "";
      root.style.transition = "filter 0.5s ease-in-out";
      localStorage.setItem('sensoryMode', 'false');
    }
  }, [sensoryMode]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleSensoryMode = () => {
    setSensoryMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, sensoryMode, toggleSensoryMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
