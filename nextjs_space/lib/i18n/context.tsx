
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, currencies } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.es;
  currency: string;
  setCurrency: (curr: string) => void;
  formatCurrency: (amount: number) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Inicializar con valores de localStorage si existen
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user-language') as Language;
      if (saved && translations[saved]) {
        return saved;
      }
    }
    return 'es';
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user-currency');
      if (saved && currencies[saved as keyof typeof currencies]) {
        return saved;
      }
    }
    return 'EUR';
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Cargar desde la API en segundo plano (solo en rutas autenticadas) - SOLO UNA VEZ
    if (isInitialized) return;
    
    const loadSettings = async () => {
      try {
        // Solo intentar cargar desde la API si estamos en rutas que requieren autenticación
        const isAuthRoute = typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/dashboard') ||
          window.location.pathname.startsWith('/transacciones') ||
          window.location.pathname.startsWith('/cuentas') ||
          window.location.pathname.startsWith('/presupuestos') ||
          window.location.pathname.startsWith('/analisis')
        );

        if (isAuthRoute) {
          const response = await fetch('/api/settings');
          // Solo actualizar si el usuario está autenticado (status 200)
          if (response.ok) {
            const data = await response.json();
            
            // Solo actualizar si son diferentes de los valores de localStorage
            const storedLang = localStorage.getItem('user-language');
            const storedCurr = localStorage.getItem('user-currency');
            
            if (data.language && translations[data.language as Language] && data.language !== storedLang) {
              setLanguageState(data.language);
              if (typeof window !== 'undefined') {
                localStorage.setItem('user-language', data.language);
              }
            }
            if (data.currency && currencies[data.currency as keyof typeof currencies] && data.currency !== storedCurr) {
              setCurrencyState(data.currency);
              if (typeof window !== 'undefined') {
                localStorage.setItem('user-currency', data.currency);
              }
            }
          }
        }
        setIsInitialized(true);
      } catch (error) {
        // Error de red o servidor, seguir con localStorage o valores por defecto
        console.error('Error loading settings from API:', error);
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-language', lang);
    }
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-currency', curr);
    }
  };

  const formatCurrency = (amount: number): string => {
    const currencyInfo = currencies[currency as keyof typeof currencies];
    if (!currencyInfo) return `${amount.toFixed(2)} ${currency}`;
    
    const formatted = amount.toFixed(2);
    return currencyInfo.position === 'before'
      ? `${currencyInfo.symbol}${formatted}`
      : `${formatted}${currencyInfo.symbol}`;
  };

  const t = translations[language];

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, currency, setCurrency, formatCurrency }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n debe ser usado dentro de I18nProvider');
  }
  return context;
}
