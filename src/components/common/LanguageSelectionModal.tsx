import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, Check, Volume2, Sparkles, ArrowRight, Mic } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { LanguageCode } from '../../types';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  title?: string;
  subtitle?: string;
}

interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  spokenKeywords: string[];
  description: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    spokenKeywords: ['english', 'one', 'first', 'angrezi', 'angreji', 'inglish'],
    description: 'Explore verified Indian handicrafts with English voice assistance and navigation.',
    flag: '🇬🇧',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    spokenKeywords: ['telugu', 'three', 'third', 'telgu', 'తెలుగు', 'moodu', 'two'],
    description: 'కళాకారుల హస్తకళలు మరియు ఆర్డర్లను తెలుగు వాయిస్ సహాయంతో చూడండి.',
    flag: 'తెలుగు',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    spokenKeywords: ['hindi', 'two', 'second', 'hindee', 'हिंदी', 'हिन्दी', 'do'],
    description: 'भारतीय हस्तशिल्प और कारीगरों की संपूर्ण जानकारी और आवाज़ गाइड हिन्दी में।',
    flag: '🇮🇳',
  },
];

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectLanguage,
  title,
  subtitle,
}) => {
  const { language: currentLang, setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(currentLang);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const hasSpokenIntroRef = useRef(false);

  // Text spoken automatically asking the user which language they want
  const automaticVoiceQuestion = [
    { lang: 'en-IN', text: 'Welcome to KALAtech. Please choose your language. You can say English, Telugu, or Hindi.' },
    { lang: 'hi-IN', text: 'KALAtech में आपका स्वागत है। कृपया अपनी भाषा चुनें। आप अंग्रेजी, तेलुगु या हिंदी बोल सकते हैं।' },
    { lang: 'te-IN', text: 'KALAtech కు స్వాగతం. దయచేసి మీ భాషను ఎంచుకోండి. మీరు ఇంగ్లీష్, తెలుగు లేదా హిందీ అని చెప్పవచ్చు.' },
  ];

  // Speak multi-lingual question automatically without user having to tap any voice button
  const askWhichLanguageAutomatically = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Speak exact welcome prompt in simple default language
    const welcomeText = 'Welcome to KALAtech. Please choose your language. You can say English, Telugu, or Hindi.';
    const utterance = new SpeechSynthesisUtterance(welcomeText);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      startListeningForChoice();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      startListeningForChoice();
    };

    try {
      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {
      setIsSpeaking(false);
      startListeningForChoice();
    }
  }, [startListeningForChoice]);

  // Confirm and proceed with selected language
  const handleConfirm = useCallback((langCode: LanguageCode) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setLanguage(langCode);
    onSelectLanguage(langCode);
    onClose?.();
  }, [setLanguage, onSelectLanguage, onClose]);

  // Automatic Speech Recognition: user can just say "Hindi", "English", or "Telugu"
  const startListeningForChoice = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Multilingual recognition in Indian English/Hindi

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.toLowerCase() || '';
        setRecognizedText(transcript);

        // Check if matched any language
        for (const lang of LANGUAGES) {
          if (
            lang.spokenKeywords.some((keyword) => transcript.includes(keyword)) ||
            transcript.includes(lang.name.toLowerCase()) ||
            transcript.includes(lang.nativeName.toLowerCase())
          ) {
            setSelectedLang(lang.code);
            setTimeout(() => {
              handleConfirm(lang.code);
            }, 500);
            return;
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition for language choice error:', err);
      setIsListening(false);
    }
  }, [handleConfirm]);

  // Automatically trigger voice question as soon as modal opens
  useEffect(() => {
    if (!isOpen) return;

    hasSpokenIntroRef.current = true;

    // Small delay to ensure browser audio context is ready
    const timer = setTimeout(() => {
      askWhichLanguageAutomatically();
    }, 250);

    // Fallback: If browser restricted audio before user touched screen, speak on first touch
    const handleFirstGesture = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        if (!window.speechSynthesis.speaking) {
          askWhichLanguageAutomatically();
        }
      }
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true, passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isOpen, askWhichLanguageAutomatically]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Language Selection"
    >
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-amber-500/40 overflow-hidden flex flex-col p-6 sm:p-7">
        {/* Top Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Globe className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-['Rozha_One',serif]">
            {title || '🌐 Choose Your Language'}
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            {subtitle || 'Speaking out loud automatically • You can speak or tap your choice'}
          </p>
        </div>

        {/* Live Speaking / Listening Voice Assistance Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              {isListening ? (
                <Mic className="w-4 h-4 animate-ping" />
              ) : (
                <Volume2 className="w-4 h-4 animate-bounce" />
              )}
            </div>
            <div>
              <span className="text-xs font-black text-amber-950 block">
                {isSpeaking
                  ? '🔊 Asking: Which language do you want?'
                  : isListening
                  ? '🎙️ Listening... Say "Hindi", "English", or "Telugu"'
                  : '🔊 Voice Guide: Tap or speak your language'}
              </span>
              <span className="text-[10px] text-amber-800 font-semibold">
                {recognizedText ? `Heard: "${recognizedText}"` : 'No buttons to tap for voice — audio is automatic'}
              </span>
            </div>
          </div>

          {/* Sound wave visual bars */}
          <div className="flex items-center gap-1">
            <span className="w-1 h-3.5 bg-amber-600 rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-orange-600 rounded-full animate-pulse delay-75" />
            <span className="w-1 h-2.5 bg-amber-600 rounded-full animate-pulse delay-150" />
          </div>
        </div>

        {/* Language Cards: 1-Click Tap directly selects and proceeds */}
        <div className="space-y-3 mb-5">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code);
                  handleConfirm(lang.code);
                }}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/80 shadow-md ring-2 ring-amber-500/30'
                    : 'border-stone-200 hover:border-amber-400 bg-white hover:bg-stone-50 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="text-3xl">{lang.flag}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-900 text-base sm:text-lg">
                        {lang.nativeName}
                      </span>
                      {lang.nativeName !== lang.name && (
                        <span className="text-xs text-stone-500 font-semibold">
                          ({lang.name})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 font-medium leading-snug">
                      {lang.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected
                        ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                        : 'border-stone-300 bg-stone-100 text-stone-400'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => handleConfirm(selectedLang)}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <span>
            {selectedLang === 'hi'
              ? 'हिन्दी में जारी रखें (Continue)'
              : selectedLang === 'te'
              ? 'తెలుగులో కొనసాగించండి (Continue)'
              : 'Continue in English'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
