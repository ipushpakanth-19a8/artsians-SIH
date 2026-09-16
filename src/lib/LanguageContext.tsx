import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LanguageCode } from '../types';
import { ALL_INDIAN_LANGUAGES, ALL_INDIAN_STATES } from '../config/indiaLanguages';

interface LanguageContextType {
  language: LanguageCode;
  languageCode: string; // BCP-47 tag e.g. "te-IN"
  selectedLanguageName: string; // Native or English name
  selectedState: string; // e.g. "Telangana"
  selectedStateCode: string; // e.g. "TS"
  isFirstTimeUser: boolean;
  isLanguageModalOpen: boolean;
  setLanguage: (lang: LanguageCode) => void;
  setSelectedState: (stateName: string, stateCode?: string) => void;
  saveLanguageAndState: (stateName: string, stateCode: string, lang: LanguageCode) => void;
  openLanguageModal: (initialStep?: 'state' | 'language') => void;
  closeLanguageModal: () => void;
  replayVoiceIntro: () => void;
  initialModalStep: 'state' | 'language';
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  languageCode: 'en-IN',
  selectedLanguageName: 'English',
  selectedState: 'Telangana',
  selectedStateCode: 'TS',
  isFirstTimeUser: true,
  isLanguageModalOpen: false,
  setLanguage: () => {},
  setSelectedState: () => {},
  saveLanguageAndState: () => {},
  openLanguageModal: () => {},
  closeLanguageModal: () => {},
  replayVoiceIntro: () => {},
  initialModalStep: 'state',
});

const VALID_LANGUAGES: LanguageCode[] = [
  'en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'or', 'pa', 'as'
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Check if first-time visitor
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(() => {
    try {
      const chosen = localStorage.getItem('ShilpSetu_language_chosen');
      const storedLang = localStorage.getItem('ShilpSetu_language');
      const storedState = localStorage.getItem('ShilpSetu_state');
      return !(chosen === 'true' && storedLang && storedState);
    } catch {
      return true;
    }
  });

  // Current language
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem('ShilpSetu_language') as LanguageCode;
      if (VALID_LANGUAGES.includes(stored)) return stored;
    } catch {}
    return 'en';
  });

  // Current selected state
  const [selectedState, setSelectedStateValue] = useState<string>(() => {
    try {
      return localStorage.getItem('ShilpSetu_state') || 'Telangana';
    } catch {
      return 'Telangana';
    }
  });

  // Current selected state code
  const [selectedStateCode, setSelectedStateCodeValue] = useState<string>(() => {
    try {
      return localStorage.getItem('ShilpSetu_state_code') || 'TS';
    } catch {
      return 'TS';
    }
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(() => {
    try {
      const chosen = localStorage.getItem('ShilpSetu_language_chosen');
      return !chosen;
    } catch {
      return true;
    }
  });

  const [initialModalStep, setInitialModalStep] = useState<'state' | 'language'>('state');

  // Set Language and persist
  const setLanguage = useCallback((lang: LanguageCode) => {
    if (!VALID_LANGUAGES.includes(lang)) return;
    setLanguageState(lang);
    try {
      localStorage.setItem('ShilpSetu_language', lang);
      const bcp = ALL_INDIAN_LANGUAGES[lang]?.bcp47 || `${lang}-IN`;
      localStorage.setItem('ShilpSetu_language_code', bcp);
    } catch {}
  }, []);

  // Set State and persist
  const setSelectedState = useCallback((stateName: string, stateCode?: string) => {
    setSelectedStateValue(stateName);
    const code = stateCode || ALL_INDIAN_STATES.find(s => s.name.toLowerCase() === stateName.toLowerCase())?.code || 'IN';
    setSelectedStateCodeValue(code);
    try {
      localStorage.setItem('ShilpSetu_state', stateName);
      localStorage.setItem('ShilpSetu_state_code', code);
    } catch {}
  }, []);

  // Save both state and language atomically
  const saveLanguageAndState = useCallback((stateName: string, stateCode: string, lang: LanguageCode) => {
    setSelectedStateValue(stateName);
    setSelectedStateCodeValue(stateCode);
    setLanguageState(lang);
    setIsFirstTimeUser(false);
    setIsLanguageModalOpen(false);

    try {
      localStorage.setItem('ShilpSetu_state', stateName);
      localStorage.setItem('ShilpSetu_state_code', stateCode);
      localStorage.setItem('ShilpSetu_language', lang);
      const bcp = ALL_INDIAN_LANGUAGES[lang]?.bcp47 || `${lang}-IN`;
      localStorage.setItem('ShilpSetu_language_code', bcp);
      localStorage.setItem('ShilpSetu_language_chosen', 'true');
    } catch {}
  }, []);

  const openLanguageModal = useCallback((step: 'state' | 'language' = 'state') => {
    setInitialModalStep(step);
    setIsLanguageModalOpen(true);
  }, []);

  const closeLanguageModal = useCallback(() => {
    setIsLanguageModalOpen(false);
  }, []);

  const replayVoiceIntro = useCallback(() => {
    setInitialModalStep('state');
    setIsLanguageModalOpen(true);
  }, []);

  // Sync document language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const languageCode = ALL_INDIAN_LANGUAGES[language]?.bcp47 || `${language}-IN`;
  const selectedLanguageName = ALL_INDIAN_LANGUAGES[language]?.name || 'English';

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageCode,
        selectedLanguageName,
        selectedState,
        selectedStateCode,
        isFirstTimeUser,
        isLanguageModalOpen,
        setLanguage,
        setSelectedState,
        saveLanguageAndState,
        openLanguageModal,
        closeLanguageModal,
        replayVoiceIntro,
        initialModalStep,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
