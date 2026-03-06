import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AppSettings {
  language: 'en' | 'es';
  darkMode: boolean;
  toggleLanguage: () => void;
  toggleDarkMode: () => void;
}

const AppSettingsContext = createContext<AppSettings | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'es'>(() => {
    // try to read from localStorage for persistence
    try {
      const stored = localStorage.getItem('language');
      return stored === 'es' ? 'es' : 'en';
    } catch {
      return 'en';
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('darkMode');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch {}
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('darkMode', darkMode.toString());
    } catch {}
  }, [darkMode]);

  const toggleLanguage = () => setLanguage((l) => (l === 'en' ? 'es' : 'en'));
  const toggleDarkMode = () => setDarkMode((m) => !m);

  return (
    <AppSettingsContext.Provider
      value={{ language, darkMode, toggleLanguage, toggleDarkMode }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return ctx;
}
