import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { SupportedLanguage } from '../services/translationService';

interface AppSettings {
  language: SupportedLanguage;
  darkMode: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  toggleDarkMode: () => void;
}

const AppSettingsContext = createContext<AppSettings | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    // try to read from localStorage for persistence
    try {
      const stored = localStorage.getItem('language');
      if (stored === 'en' || stored === 'es' || stored === 'da' || stored === 'is') {
        return stored;
      }
      return 'en';
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

  const setLanguage = (lang: SupportedLanguage) => setLanguageState(lang);
  
  const toggleLanguage = () => {
    setLanguageState((l) => {
      const langs: SupportedLanguage[] = ['en', 'es', 'da', 'is'];
      const currentIndex = langs.indexOf(l);
      const nextIndex = (currentIndex + 1) % langs.length;
      return langs[nextIndex];
    });
  };
  
  const toggleDarkMode = () => setDarkMode((m) => !m);

  return (
    <AppSettingsContext.Provider
      value={{ language, darkMode, setLanguage, toggleLanguage, toggleDarkMode }}
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
