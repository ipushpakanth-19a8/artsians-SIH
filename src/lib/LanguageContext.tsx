import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LanguageCode, ArtisanLocation } from '../types';
import { ALL_INDIAN_LANGUAGES, ALL_INDIAN_STATES } from '../config/indiaLanguages';
import {
  getSavedLocation,
  saveLocation,
  getSavedLanguage,
  saveLanguage
} from '../services/locationService';
import { normalizeStateName } from '../config/stateLanguageMap';

interface LanguageContextType {
  language: LanguageCode;
  languageCode: string; // BCP-47 tag e.g. "te-IN"
  selectedLanguageName: string; // Native or English name
  selectedState: string; // e.g. "Telangana"
  selectedStateCode: string; // e.g. "TS"
  artisanLocation: ArtisanLocation;
  isFirstTimeUser: boolean;
  isLanguageModalOpen: boolean;
  setLanguage: (lang: LanguageCode) => void;
  setSelectedState: (stateName: string, stateCode?: string) => void;
  setArtisanLocation: (location: ArtisanLocation) => void;
  saveLanguageAndState: (stateName: string, stateCode: string, lang: LanguageCode) => void;
  saveLocationAndLanguage: (location: ArtisanLocation, lang: LanguageCode) => void;
  openLanguageModal: (initialStep?: 'state' | 'language') => void;
  closeLanguageModal: () => void;
  replayVoiceIntro: () => void;
  initialModalStep: 'state' | 'language';
}

const DEFAULT_LOCATION: ArtisanLocation = {
  state: 'Telangana',
  district: 'Pochampally',
  place: 'Pochampally',
  preferredLanguage: 'te'
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  languageCode: 'en-IN',
  selectedLanguageName: 'English',
  selectedState: 'Telangana',
  selectedStateCode: 'TS',
  artisanLocation: DEFAULT_LOCATION,
  isFirstTimeUser: true,
  isLanguageModalOpen: false,
  setLanguage: () => {},
  setSelectedState: () => {},
  setArtisanLocation: () => {},
  saveLanguageAndState: () => {},
  saveLocationAndLanguage: () => {},
  openLanguageModal: () => {},
  closeLanguageModal: () => {},
  replayVoiceIntro: () => {},
  initialModalStep: 'state',
});

const VALID_LANGUAGES: LanguageCode[] = [
  'en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'or', 'pa', 'as'
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Check if returning user with saved preferences
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(() => {
    try {
      const chosen = localStorage.getItem('kalatech_preferences_saved') || localStorage.getItem('ShilpSetu_language_chosen');
      const storedLang = getSavedLanguage();
      const storedLoc = getSavedLocation();
      return !(chosen === 'true' && (storedLang || storedLoc));
    } catch {
      return true;
    }
  });

  // Current artisan location
  const [artisanLocation, setArtisanLocationState] = useState<ArtisanLocation>(() => {
    const saved = getSavedLocation();
    if (saved) return saved;
    return DEFAULT_LOCATION;
  });

  // Priority-based language initialization:
  // 1. User explicit / saved language
  // 2. Location recommended language
  // 3. Browser language
  // 4. English fallback ('en')
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const savedLang = getSavedLanguage();
      if (savedLang && VALID_LANGUAGES.includes(savedLang)) return savedLang;

      // Check browser language
      if (typeof navigator !== 'undefined' && navigator.language) {
        const browserPrefix = navigator.language.split('-')[0].toLowerCase() as LanguageCode;
        if (VALID_LANGUAGES.includes(browserPrefix)) return browserPrefix;
      }
    } catch {}
    return 'en';
  });

  // Current selected state
  const [selectedState, setSelectedStateValue] = useState<string>(() => {
    const saved = getSavedLocation();
    if (saved?.state) return saved.state;
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
      const chosen = localStorage.getItem('kalatech_preferences_saved') || localStorage.getItem('ShilpSetu_language_chosen');
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
    saveLanguage(lang);
    setArtisanLocationState(prev => ({ ...prev, preferredLanguage: lang }));
  }, []);

  // Set Artisan Location
  const setArtisanLocation = useCallback((loc: ArtisanLocation) => {
    const norm = normalizeStateName(loc.state) || loc.state;
    const updated = { ...loc, state: norm };
    setArtisanLocationState(updated);
    setSelectedStateValue(norm);
    saveLocation(updated);
  }, []);

  // Set State and persist
  const setSelectedState = useCallback((stateName: string, stateCode?: string) => {
    const norm = normalizeStateName(stateName) || stateName;
    setSelectedStateValue(norm);
    const code = stateCode || ALL_INDIAN_STATES.find(s => s.name.toLowerCase() === norm.toLowerCase())?.code || 'IN';
    setSelectedStateCodeValue(code);
    setArtisanLocationState(prev => {
      const updated = { ...prev, state: norm };
      saveLocation(updated);
      return updated;
    });
    try {
      localStorage.setItem('ShilpSetu_state', norm);
      localStorage.setItem('ShilpSetu_state_code', code);
    } catch {}
  }, []);

  // Save location + language together
  const saveLocationAndLanguage = useCallback((loc: ArtisanLocation, lang: LanguageCode) => {
    const normState = normalizeStateName(loc.state) || loc.state || 'Telangana';
    const stateObj = ALL_INDIAN_STATES.find(s => s.name.toLowerCase() === normState.toLowerCase());
    const stateCode = stateObj?.code || 'IN';

    const finalLoc: ArtisanLocation = {
      ...loc,
      state: normState,
      district: loc.district || 'Not available',
      place: loc.place || 'Not available',
      preferredLanguage: lang
    };

    setArtisanLocationState(finalLoc);
    setSelectedStateValue(normState);
    setSelectedStateCodeValue(stateCode);
    setLanguageState(lang);
    setIsFirstTimeUser(false);
    setIsLanguageModalOpen(false);

    saveLocation(finalLoc);
    saveLanguage(lang);

    try {
      localStorage.setItem('kalatech_preferences_saved', 'true');
      localStorage.setItem('ShilpSetu_language_chosen', 'true');
      localStorage.setItem('ShilpSetu_state', normState);
      localStorage.setItem('ShilpSetu_state_code', stateCode);
    } catch {}
  }, []);

  // Save both state and language atomically (legacy compatibility)
  const saveLanguageAndState = useCallback((stateName: string, stateCode: string, lang: LanguageCode) => {
    saveLocationAndLanguage({
      state: stateName,
      district: 'Not available',
      place: 'Not available',
      preferredLanguage: lang
    }, lang);
  }, [saveLocationAndLanguage]);

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
        artisanLocation,
        isFirstTimeUser,
        isLanguageModalOpen,
        setLanguage,
        setSelectedState,
        setArtisanLocation,
        saveLanguageAndState,
        saveLocationAndLanguage,
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
