
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
  isHydrated: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Valores por defecto constantes (evita hidratación inconsistente)
const DEFAULT_LANGUAGE: Language = 'es';
const DEFAULT_CURRENCY = 'EUR';

export function I18nProvider({ children }: { children: ReactNode }) {
  // ✅ SIEMPRE inicializar con valores por defecto (igual en server y client)
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ Cargar valores de localStorage DESPUÉS de la hidratación (solo en cliente)
  useEffect(() => {
    // Primero cargar de localStorage para evitar flash
    const savedLang = localStorage.getItem('user-language') as Language;
    const savedCurr = localStorage.getItem('user-currency');

    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    }
    if (savedCurr && currencies[savedCurr as keyof typeof currencies]) {
      setCurrencyState(savedCurr);
    }

    setIsHydrated(true);
  }, []);

  // Cargar desde la API (solo una vez, después de hidratación)
  useEffect(() => {
    if (!isHydrated || isInitialized) return;

    const loadSettings = async () => {
      try {
        // Solo intentar cargar desde la API si estamos en rutas autenticadas
        const isAuthRoute = 
          window.location.pathname.startsWith('/dashboard') ||
          window.location.pathname.startsWith('/transacciones') ||
          window.location.pathname.startsWith('/cuentas') ||
          window.location.pathname.startsWith('/presupuestos') ||
          window.location.pathname.startsWith('/analisis');

        if (isAuthRoute) {
          const response = await fetch('/api/settings');
          if (response.ok) {
            const data = await response.json();

            if (data.language && translations[data.language as Language]) {
              setLanguageState(data.language);
              localStorage.setItem('user-language', data.language);
            }
            if (data.currency && currencies[data.currency as keyof typeof currencies]) {
              setCurrencyState(data.currency);
              localStorage.setItem('user-currency', data.currency);
            }
          }
        }
      } catch (error) {
        console.error('Error loading settings from API:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadSettings();
  }, [isHydrated, isInitialized]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('user-language', lang);
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    localStorage.setItem('user-currency', curr);
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
    <I18nContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      currency, 
      setCurrency, 
      formatCurrency,
      isHydrated 
    }}>
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
