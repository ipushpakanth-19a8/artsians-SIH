import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Globe,
  Check,
  Volume2,
  Sparkles,
  ArrowRight,
  Mic,
  Search,
  RotateCcw,
  MapPin,
  ChevronRight,
  X,
  AlertCircle,
  VolumeX,
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { LanguageCode } from '../../types';
import {
  ALL_INDIAN_STATES,
  ALL_INDIAN_LANGUAGES,
  IndianState,
  LanguageMetadata,
  matchStateFromSpeech,
  matchLanguageFromSpeech,
  getRecommendedLanguagesForState,
} from '../../config/indiaLanguages';
import { t } from '../../i18n';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onComplete?: (stateName: string, stateCode: string, langCode: LanguageCode) => void;
  initialStep?: 'state' | 'language';
}

type OnboardingStep = 'state' | 'language';

type SpeechFeedbackState = 'idle' | 'speaking' | 'listening' | 'processing' | 'success' | 'repeat';

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialStep = 'state',
}) => {
  const {
    language: currentLang,
    selectedState: activeStateName,
    selectedStateCode: activeStateCode,
    saveLanguageAndState,
    isFirstTimeUser,
  } = useLanguage();

  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [selectedState, setSelectedState] = useState<IndianState>(() => {
    return (
      ALL_INDIAN_STATES.find(
        (s) => s.name.toLowerCase() === activeStateName.toLowerCase() || s.code === activeStateCode
      ) || ALL_INDIAN_STATES[0]
    );
  });
  const [selectedLangCode, setSelectedLangCode] = useState<LanguageCode>(currentLang);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Voice Assistant UI state
  const [speechState, setSpeechState] = useState<SpeechFeedbackState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [recognizedTranscript, setRecognizedTranscript] = useState<string>('');
  const [voiceAvailable, setVoiceAvailable] = useState<boolean>(true);
  const [isMicPermissionDenied, setIsMicPermissionDenied] = useState<boolean>(false);

  // Guard against duplicate speech triggers on re-renders
  const lastSpokenPromptRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Reset step whenever modal re-opens
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setSearchQuery('');
      setRecognizedTranscript('');
      lastSpokenPromptRef.current = null;
    }
  }, [isOpen, initialStep]);

  // Clean up speech recognition & synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {}
        }
      }
    };
  }, []);

  // Check speech synthesis & recognition availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSynthesis = 'speechSynthesis' in window;
      const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      if (!hasSynthesis && !hasRecognition) {
        setVoiceAvailable(false);
      }
    }
  }, []);

  // Stop any ongoing speech
  const stopAllSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
  }, []);

  // Helper to trigger speech synthesis
  const speakPrompt = useCallback(
    (text: string, langLocale: string = 'en-IN', onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd?.();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langLocale;
        utterance.rate = 0.92; // Clear pacing for rural artisans
        utterance.pitch = 1.02;

        utterance.onstart = () => {
          setSpeechState('speaking');
          setStatusMessage(text);
        };

        utterance.onend = () => {
          setSpeechState('idle');
          onEnd?.();
        };

        utterance.onerror = (err) => {
          console.warn('Speech synthesis error in modal:', err);
          setSpeechState('idle');
          onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.error('TTS error:', err);
        setSpeechState('idle');
        onEnd?.();
      }
    },
    []
  );

  // Helper to start speech recognition for States or Languages
  const startListening = useCallback(
    (target: 'state' | 'language') => {
      if (typeof window === 'undefined') return;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceAvailable(false);
        return;
      }

      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {}
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        // INTENTIONAL: 'en-IN' is correct here because this modal recognizes
        // state names ("Telangana", "Maharashtra") and language names ("Telugu", "Tamil")
        // which are English words. The user's selected regional locale (e.g. 'te-IN')
        // is applied to all SUBSEQUENT voice interactions via useVoiceAssistant.
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setSpeechState('listening');
          setStatusMessage(
            target === 'state' ? 'Listening for state name...' : 'Listening for language name...'
          );
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript?.trim() || '';
          setRecognizedTranscript(transcript);
          setSpeechState('processing');

          if (target === 'state') {
            const matchedState = matchStateFromSpeech(transcript);
            if (matchedState) {
              setSelectedState(matchedState);
              setSpeechState('success');
              setStatusMessage(`✓ ${matchedState.name} (${matchedState.nativeName})`);

              // Move to step 2 after brief confirmation
              setTimeout(() => {
                setStep('language');
              }, 700);
            } else {
              setSpeechState('repeat');
              setStatusMessage(`"${transcript}" - Please repeat state name`);
              speakPrompt("I didn't recognize that state. Please say your state name again.", 'en-IN', () => {
                startListening('state');
              });
            }
          } else {
            // Target is language
            const matchedLang = matchLanguageFromSpeech(transcript);
            if (matchedLang) {
              setSelectedLangCode(matchedLang.code);
              setSpeechState('success');
              setStatusMessage(`✓ ${matchedLang.name} (${matchedLang.englishName})`);

              setTimeout(() => {
                handleFinalSelection(selectedState, matchedLang.code);
              }, 600);
            } else {
              setSpeechState('repeat');
              setStatusMessage(`"${transcript}" - Please repeat language name`);
              speakPrompt("I didn't recognize that language. Please say your language again.", 'en-IN', () => {
                startListening('language');
              });
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event?.error);
          setSpeechState('idle');
          if (event?.error === 'not-allowed' || event?.error === 'permission-denied') {
            setIsMicPermissionDenied(true);
            setStatusMessage('Microphone access was denied. You can select manually.');
          }
        };

        recognition.onend = () => {
          if (speechState === 'listening') {
            setSpeechState('idle');
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
        setSpeechState('idle');
      }
    },
    [selectedState, speakPrompt]
  );

  // Automatic Voice Triggers per Step with Guard
  useEffect(() => {
    if (!isOpen) return;

    if (step === 'state') {
      const promptKey = 'welcome_state_prompt';
      if (lastSpokenPromptRef.current !== promptKey) {
        lastSpokenPromptRef.current = promptKey;
        const welcomeText = 'Welcome to ShilpSetu. Please choose your state.';
        const timer = setTimeout(() => {
          speakPrompt(welcomeText, 'en-IN', () => {
            startListening('state');
          });
        }, 300);
        return () => clearTimeout(timer);
      }
    } else if (step === 'language') {
      const promptKey = `welcome_lang_prompt_${selectedState.code}`;
      if (lastSpokenPromptRef.current !== promptKey) {
        lastSpokenPromptRef.current = promptKey;
        const langQuestion = `Please choose your language for ${selectedState.name}.`;
        const timer = setTimeout(() => {
          speakPrompt(langQuestion, 'en-IN', () => {
            startListening('language');
          });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, step, selectedState, speakPrompt, startListening]);

  // Handle State Choice by Screen Click
  const handleSelectState = (st: IndianState) => {
    stopAllSpeech();
    setSelectedState(st);
    setSpeechState('success');
    setStatusMessage(`✓ ${st.name}`);

    setTimeout(() => {
      setStep('language');
    }, 200);
  };

  // Handle Final Language Selection and Completion
  const handleFinalSelection = (st: IndianState, langCode: LanguageCode) => {
    stopAllSpeech();

    // Confirm in chosen language with voice
    const confirmationPhrases: Record<LanguageCode, { text: string; locale: string }> = {
      te: { text: 'మీ భాష తెలుగుగా ఎంచుకోబడింది.', locale: 'te-IN' },
      hi: { text: 'आपकी भाषा हिंदी चुनी गई है।', locale: 'hi-IN' },
      en: { text: 'Your language has been set to English.', locale: 'en-IN' },
      ta: { text: 'உங்கள் மொழி தமிழாக தேர்ந்தெடுக்கப்பட்டுள்ளது.', locale: 'ta-IN' },
      kn: { text: 'ನಿಮ್ಮ ಭಾಷೆ ಕನ್ನಡವಾಗಿ ಆಯ್ಕೆಯಾಗಿದೆ.', locale: 'kn-IN' },
      ml: { text: 'നിങ്ങളുടെ ഭാഷ മലയാളമായി തിരഞ്ഞെടുത്തു.', locale: 'ml-IN' },
      mr: { text: 'आपली भाषा मराठी निवडली गेली आहे.', locale: 'mr-IN' },
      gu: { text: 'તમારી ભાષા ગુજરાતી તરીકે પસંદ કરવામાં આવી છે.', locale: 'gu-IN' },
      bn: { text: 'আপনার ভাষা বাংলা হিসেবে নির্বাচন করা হয়েছে।', locale: 'bn-IN' },
      pa: { text: 'ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਚੁਣੀ ਗਈ ਹੈ।', locale: 'pa-IN' },
      or: { text: 'ଆପଣଙ୍କ ଭାଷା ଓଡ଼ିଆ ଭାବରେ ଚୟନ କରାଯାଇଛି।', locale: 'hi-IN' },
      as: { text: 'আপোনাৰ ভাষা অসমীয়া হিচাপে বাছনি কৰা হৈছে।', locale: 'bn-IN' },
    };

    const confirmData = confirmationPhrases[langCode] || confirmationPhrases.en;
    speakPrompt(confirmData.text, confirmData.locale);

    saveLanguageAndState(st.name, st.code, langCode);
    onComplete?.(st.name, st.code, langCode);
    onClose?.();
  };

  // Replay voice prompt
  const handleReplayVoice = () => {
    stopAllSpeech();
    lastSpokenPromptRef.current = null;
    if (step === 'state') {
      speakPrompt('Welcome to ShilpSetu. Please choose your state.', 'en-IN', () => {
        startListening('state');
      });
    } else {
      speakPrompt(`Please choose your language for ${selectedState.name}.`, 'en-IN', () => {
        startListening('language');
      });
    }
  };

  if (!isOpen) return null;

  // Filter states by query
  const filteredStates = ALL_INDIAN_STATES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get recommended languages for selected state
  const recommendedLanguages = getRecommendedLanguagesForState(selectedState.code);
  const recommendedCodes = new Set(recommendedLanguages.map((l) => l.code));

  // Other languages
  const otherLanguages = (Object.keys(ALL_INDIAN_LANGUAGES) as LanguageCode[])
    .filter((code) => !recommendedCodes.has(code))
    .map((code) => ALL_INDIAN_LANGUAGES[code])
    .filter(
      (l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.englishName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-5 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🇮🇳</span>
            <div>
              <h2 id="language-modal-title" className="text-base sm:text-lg font-black tracking-tight">
                ShilpSetu • Regional Setup
              </h2>
              <p className="text-[11px] text-amber-100 font-medium">
                {step === 'state' ? 'Step 1 of 2: Select State' : 'Step 2 of 2: Select Language'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="replay-voice-btn"
              onClick={handleReplayVoice}
              className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all flex items-center gap-1 text-xs font-bold"
              title="Replay Voice Instructions"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Voice Help</span>
            </button>

            {!isFirstTimeUser && onClose && (
              <button
                id="close-language-modal-btn"
                onClick={() => {
                  stopAllSpeech();
                  onClose();
                }}
                className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Voice Assistant Live Feedback Bar */}
        <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {speechState === 'speaking' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 animate-pulse">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Speaking...</span>
              </span>
            )}
            {speechState === 'listening' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 animate-pulse">
                <Mic className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>Listening...</span>
              </span>
            )}
            {speechState === 'processing' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
                <span>Processing...</span>
              </span>
            )}
            {speechState === 'success' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Selected</span>
              </span>
            )}
            {speechState === 'repeat' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span>Please repeat</span>
              </span>
            )}
            {speechState === 'idle' && (
              <span className="text-xs text-stone-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span>Voice & Screen Enabled</span>
              </span>
            )}

            {statusMessage && (
              <span className="text-xs text-stone-300 font-medium truncate max-w-[200px] sm:max-w-xs">
                {statusMessage}
              </span>
            )}
          </div>

          <button
            id="modal-listen-mic-btn"
            onClick={() => startListening(step)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              speechState === 'listening'
                ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
            title="Tap to speak"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            <span>Speak</span>
          </button>
        </div>

        {/* Fallback Notice if Mic Denied or Voice Unavailable */}
        {(!voiceAvailable || isMicPermissionDenied) && (
          <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2 text-[11px] text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
            <span>Voice input is unavailable. You can easily select your state and language manually below.</span>
          </div>
        )}

        {/* Search Bar & Step Switcher */}
        <div className="p-4 border-b border-stone-800 bg-stone-900/60 flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              id="state-language-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={step === 'state' ? 'Search state (e.g. Telangana, Bihar...)' : 'Search language (e.g. Telugu, Hindi...)'}
              className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
            <button
              id="step-state-tab-btn"
              onClick={() => {
                stopAllSpeech();
                setStep('state');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                step === 'state'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-black'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>1. State</span>
            </button>

            <button
              id="step-lang-tab-btn"
              onClick={() => {
                stopAllSpeech();
                setStep('language');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                step === 'language'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-black'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>2. Language</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: STATE SELECTION */}
          {step === 'state' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>Choose Your State / Union Territory</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Select your state or simply say it aloud (e.g. "Telangana", "Karnataka")
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-stone-400 px-2 py-0.5 bg-stone-800 rounded-full">
                  {filteredStates.length} States
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredStates.map((st) => {
                  const isSelected = selectedState.code === st.code;
                  return (
                    <button
                      key={st.code}
                      id={`state-card-${st.code.toLowerCase()}`}
                      onClick={() => handleSelectState(st)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500 shadow-md'
                          : 'bg-stone-950/60 border-stone-800 hover:border-amber-500/50 hover:bg-stone-800/50 text-stone-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-bold text-white">{st.nativeName}</span>
                          <span className="text-xs text-stone-400">({st.name})</span>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                          Languages: {st.recommendedLanguages.map((c) => ALL_INDIAN_LANGUAGES[c]?.englishName || c).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isSelected ? (
                          <span className="p-1 rounded-full bg-amber-500 text-stone-950">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-stone-300 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: LANGUAGE SELECTION */}
          {step === 'language' && (
            <div className="space-y-5">
              {/* Selected State Banner with Option to Change */}
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                      Selected State
                    </span>
                    <p className="text-xs font-bold text-white">
                      {selectedState.nativeName} • {selectedState.name}
                    </p>
                  </div>
                </div>

                <button
                  id="change-state-btn"
                  onClick={() => {
                    stopAllSpeech();
                    setStep('state');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 transition-colors"
                >
                  Change State
                </button>
              </div>

              {/* Recommended Languages for Selected State */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Recommended for {selectedState.name}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recommendedLanguages.map((lang) => {
                    const isSelected = selectedLangCode === lang.code;
                    return (
                      <button
                        key={`rec-${lang.code}`}
                        id={`rec-lang-${lang.code}`}
                        onClick={() => handleFinalSelection(selectedState, lang.code)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500 shadow-lg'
                            : 'bg-stone-950/70 border-stone-800 hover:border-amber-500 hover:bg-stone-800/60 text-stone-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-amber-300">{lang.name}</span>
                            <span className="text-xs text-stone-300 font-semibold">({lang.englishName})</span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">{lang.description}</p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300">
                            Recommended
                          </span>
                          <span className="p-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold group-hover:scale-110 transition-transform">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* All Other Indian Languages */}
              {otherLanguages.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-stone-500" />
                    <span>Other Supported Indian Languages</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {otherLanguages.map((lang) => {
                      const isSelected = selectedLangCode === lang.code;
                      return (
                        <button
                          key={`other-${lang.code}`}
                          id={`other-lang-${lang.code}`}
                          onClick={() => handleFinalSelection(selectedState, lang.code)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-white'
                              : 'bg-stone-950/40 border-stone-800 hover:border-stone-600 hover:bg-stone-800/40 text-stone-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{lang.name}</p>
                            <p className="text-[10px] text-stone-400 truncate">{lang.englishName}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-stone-950 px-5 py-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold">Low-Literacy Mode:</span>
            <span>Tap any option or speak clearly into your mic</span>
          </div>

          <div className="text-[11px] text-stone-500">
            Powered by ShilpSetu Trilingual Engine
          </div>
        </div>
      </div>
    </div>
  );
};
