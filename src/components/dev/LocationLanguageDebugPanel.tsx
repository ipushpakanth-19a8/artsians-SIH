import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { ALL_INDIAN_LANGUAGES } from '../../config/indiaLanguages';
import { clearSavedLocation } from '../../services/locationService';

export const LocationLanguageDebugPanel: React.FC = () => {
  // MUST NOT appear in production
  if (!(import.meta as any).env?.DEV) {
    return null;
  }

  const {
    language,
    languageCode,
    selectedState,
    artisanLocation,
    saveLocationAndLanguage,
    openLanguageModal
  } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('checking...');
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);

  useEffect(() => {
    // Check Speech Recognition support
    const hasSR = typeof window !== 'undefined' &&
      Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setSpeechRecognitionSupported(hasSR);

    // Check TTS support
    const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setTtsSupported(hasTTS);

    // Check Geolocation permission state
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          setPermissionState(status.state);
          status.onchange = () => {
            setPermissionState(status.state);
          };
        })
        .catch(() => {
          setPermissionState('unknown');
        });
    } else {
      setPermissionState('unknown');
    }
  }, []);

  // Quick simulation helper
  const handleSimulate = (state: string, district: string, place: string, lang: any) => {
    saveLocationAndLanguage(
      {
        state,
        district,
        place,
        preferredLanguage: lang
      },
      lang
    );
  };

  const handleReset = () => {
    clearSavedLocation();
    try {
      localStorage.removeItem('kalatech_preferences_saved');
      localStorage.removeItem('ShilpSetu_language_chosen');
      localStorage.removeItem('kalatech_language');
    } catch {}
    window.location.reload();
  };

  return (
    <aside aria-label="Developer Location Debug Panel" className="fixed bottom-3 right-3 z-[9999] font-mono text-xs">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-stone-900/90 text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-full shadow-2xl border border-amber-500/40 backdrop-blur-md flex items-center gap-1.5 cursor-pointer text-[11px] font-bold"
          title="Open Location & Language Dev Debug Panel"
        >
          <span>🛠️ DEV: Location/Lang</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      ) : (
        <div className="w-80 bg-stone-950/95 text-stone-200 rounded-2xl shadow-2xl border border-amber-500/40 backdrop-blur-md p-4 space-y-3 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
              <span>🛠️ DEV DEBUG PANEL</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                DEV ONLY
              </span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-stone-400">Location permission:</span>
              <span className={`font-bold ${permissionState === 'granted' ? 'text-emerald-400' : permissionState === 'denied' ? 'text-rose-400' : 'text-amber-400'}`}>
                {permissionState}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">Latitude:</span>
              <span className="text-stone-300 italic">[Masked for privacy]</span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">Longitude:</span>
              <span className="text-stone-300 italic">[Masked for privacy]</span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">Detected state:</span>
              <span className="text-amber-300 font-bold">{artisanLocation.state || selectedState}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">Detected district:</span>
              <span className="text-stone-200">{artisanLocation.district || 'Not available'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">Detected place:</span>
              <span className="text-stone-200">{artisanLocation.place || 'Not available'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">Recommended language:</span>
              <span className="text-amber-300 font-bold">
                {artisanLocation.preferredLanguage || language}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">Selected language:</span>
              <span className="text-emerald-400 font-bold">{language}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">Locale (BCP-47):</span>
              <span className="text-cyan-400">{languageCode}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">Voice recognition:</span>
              <span className={speechRecognitionSupported ? 'text-emerald-400' : 'text-rose-400'}>
                {speechRecognitionSupported ? 'supported' : 'unsupported'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">TTS Speech:</span>
              <span className={ttsSupported ? 'text-emerald-400' : 'text-rose-400'}>
                {ttsSupported ? 'supported' : 'unsupported'}
              </span>
            </div>
          </div>

          {/* Preset Simulation Tools */}
          <div className="pt-2 border-t border-stone-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              Quick State Simulations:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleSimulate('Andhra Pradesh', 'Vizianagaram', 'Vizianagaram', 'te')}
                className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[10px] text-amber-300 text-left"
              >
                AP • Telugu
              </button>
              <button
                onClick={() => handleSimulate('Telangana', 'Nalgonda', 'Pochampally', 'te')}
                className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[10px] text-amber-300 text-left"
              >
                TS • Telugu
              </button>
              <button
                onClick={() => handleSimulate('Tamil Nadu', 'Madurai', 'Madurai', 'ta')}
                className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[10px] text-cyan-300 text-left"
              >
                TN • Tamil
              </button>
              <button
                onClick={() => handleSimulate('Maharashtra', 'Pune', 'Pune', 'mr')}
                className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[10px] text-emerald-300 text-left"
              >
                MH • Marathi
              </button>
              <button
                onClick={() => handleSimulate('Karnataka', 'Mysuru', 'Channapatna', 'kn')}
                className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[10px] text-purple-300 text-left"
              >
                KA • Kannada
              </button>
              <button
                onClick={() => handleSimulate('Uttar Pradesh', 'Varanasi', 'Varanasi', 'hi')}
                className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[10px] text-rose-300 text-left"
              >
                UP • Hindi
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800 flex gap-2">
            <button
              onClick={() => openLanguageModal('state')}
              className="flex-1 py-1 px-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold text-center"
            >
              Open Modal
            </button>
            <button
              onClick={handleReset}
              className="py-1 px-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] font-bold"
            >
              Reset Storage
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default LocationLanguageDebugPanel;
