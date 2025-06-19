import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { de, en, LocaleStrings } from './i18n';

const LANG_KEY = 'app_language';

const languageMap: Record<'de' | 'en', LocaleStrings> = { de, en };

interface LanguageContextType {
  language: 'de' | 'en';
  setLanguage: (lang: 'de' | 'en') => void;
  strings: LocaleStrings;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'de',
  setLanguage: () => {},
  strings: de,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'de' | 'en'>('de');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(LANG_KEY);
      if (stored === 'de' || stored === 'en') setLanguageState(stored);
    })();
  }, []);

  const setLanguage = (lang: 'de' | 'en') => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_KEY, lang);
  };

  const strings = languageMap[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, strings }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
} 