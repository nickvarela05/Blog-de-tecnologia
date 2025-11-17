import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type ThemeSetting = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  themeSetting: ThemeSetting;
  setThemeSetting: (theme: ThemeSetting) => void;
  effectiveTheme: EffectiveTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): EffectiveTheme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeSetting;
    if (['light', 'dark', 'system'].includes(savedTheme)) {
        return savedTheme;
    }
    return 'system';
  });
  
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>(getSystemTheme);
  
  const effectiveTheme: EffectiveTheme = themeSetting === 'system' ? systemTheme : themeSetting;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => setSystemTheme(getSystemTheme());
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', themeSetting);
  }, [effectiveTheme, themeSetting]);

  return (
    <ThemeContext.Provider value={{ themeSetting, setThemeSetting, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
