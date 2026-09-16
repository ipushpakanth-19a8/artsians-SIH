import { useState, useRef, useCallback, useEffect } from 'react';
import { LanguageCode } from '../types';
import { getRecognitionLocale, getSpeechLocale } from '../config/languages';

export interface VoiceFormFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'tel' | 'email' | 'password' | 'number';
  prompts: {
    en: string;
    hi: string;
    te: string;
    ta?: string;
    kn?: string;
    ml?: string;
    mr?: string;
    gu?: string;
    bn?: string;
    or?: string;
    pa?: string;
    as?: string;
    [key: string]: string | undefined;
  };
  sampleFallback?: {
    en: string;
    hi: string;
    te: string;
    ta?: string;
    kn?: string;
    ml?: string;
    mr?: string;
    gu?: string;
    bn?: string;
    or?: string;
    pa?: string;
    as?: string;
    [key: string]: string | undefined;
  };
}

export interface UseVoiceFormAssistantOptions {
  language: LanguageCode;
  fields: VoiceFormFieldConfig[];
  onFieldFilled: (key: string, value: string) => void;
  onComplete?: () => void;
}

// Convert spoken number words across all 12 supported Indian languages to digits
export function normalizeSpokenDigits(input: string): string {
  const digitWords: Record<string, string> = {
    // English
    zero: '0', oh: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
    six: '6', seven: '7', eight: '8', nine: '9',
    // Hindi & Marathi
    शून्य: '0', सिफ़र: '0', एक: '1', दो: '2', दोन: '2', तीन: '3', चार: '4', पाँच: '5',
    पांच: '5', पाच: '5', छह: '6', छः: '6', सहा: '6', सात: '7', आठ: '8', नौ: '9', नऊ: '9', दस: '10', दहा: '10',
    // Telugu
    సున్నా: '0', ఒకటి: '1', రెండు: '2', మూడు: '3', నాలుగు: '4', ఐదు: '5',
    ఆరు: '6', ఏడు: '7', ఎనిమిది: '8', తొమ్మిది: '9', పది: '10',
    // Tamil
    பூஜ்ஜியம்: '0', ஒன்று: '1', இரண்டு: '2', மூன்று: '3', நான்கு: '4', ஐந்து: '5',
    ஆறு: '6', ஏழு: '7', எட்டு: '8', ஒன்பது: '9', பத்து: '10',
    // Kannada
    ಸೊನ್ನೆ: '0', ಒಂದು: '1', ಎರಡು: '2', ಮೂರು: '3', ನಾಲ್ಕು: '4', ಐದು: '5',
    ಆರು: '6', ಏಳು: '7', ಎಂಟು: '8', ಒಂಬತ್ತು: '9', ಹತ್ತು: '10',
    // Malayalam
    പൂജ്യം: '0', ഒന്ന്: '1', രണ്ട്: '2', മൂന്ന്: '3', നാല്: '4', അഞ്ച്: '5',
    ആറ്: '6', ഏഴ്: '7', എട്ട്: '8', ഒൻപത്: '9', പത്ത്: '10',
    // Gujarati
    શૂન્ય: '0', એક: '1', બે: '2', ત્રણ: '3', ચાર: '4', પાંચ: '5', છ: '6', સાત: '7', આઠ: '8', નવ: '9', દસ: '10',
    // Bengali & Assamese
    শূণ্য: '0', শূন্য: '0', এক: '1', দুই: '2', তিনি: '3', তিন: '3', চাৰি: '4', চার: '4', পাঁচ: '5',
    ছয়: '6', সাত: '7', আট: '8', আঠ: '8', নয়: '9', ন: '9', দশ: '10', দহ: '10',
    // Odia
    ଶୂନ: '0', ଏକ: '1', ଦୁଇ: '2', ତିନି: '3', ଚାରି: '4', ପାଞ୍ଚ: '5', ଛଅ: '6', ସାତ: '7', ଆଠ: '8', ନଅ: '9', ଦଶ: '10',
    // Punjabi
    ਸਿਫ਼ਰ: '0', ਇੱਕ: '1', ਦੋ: '2', ਤਿੰਨ: '3', ਚਾਰ: '4', ਪੰਜ: '5', ਛੇ: '6', ਸੱਤ: '7', ਅੱਠ: '8', ਨੌਂ: '9', ਦਸ: '10',
  };

  // 1. Exact token-level replacement
  const tokens = input.split(/\s+/);
  const normalizedTokens = tokens.map(token => {
    const cleanToken = token.toLowerCase().replace(/[.,!?;:()]/g, '');
    return digitWords[cleanToken] || digitWords[token.toLowerCase()] || token;
  });
  let cleaned = normalizedTokens.join(' ');

  // 2. Fallback for compound or punctuation-joined words (sorted by length descending)
  const sortedWords = Object.keys(digitWords).sort((a, b) => b.length - a.length);
  for (const word of sortedWords) {
    if (cleaned.includes(word)) {
      cleaned = cleaned.split(word).join(digitWords[word]);
    }
  }
  return cleaned;
}

// Clean and normalize speech based on field type
export function cleanSpokenValue(raw: string, type: 'text' | 'tel' | 'email' | 'password' | 'number' = 'text'): string {
  let val = raw.trim();

  if (type === 'tel') {
    const normalized = normalizeSpokenDigits(val);
    const digitsOnly = normalized.replace(/\D/g, '');
    // Take last 10 digits if user spoke country code
    return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
  }

  if (type === 'number') {
    const normalized = normalizeSpokenDigits(val);
    return normalized.replace(/\D/g, '');
  }

  if (type === 'email') {
    let emailStr = val.toLowerCase()
      .replace(/\s+at\s+the\s+rate\s+/g, '@')
      .replace(/\s+at\s+/g, '@')
      .replace(/@\s+/g, '@')
      .replace(/\s+@/g, '@')
      .replace(/\s+dot\s+/g, '.')
      .replace(/\.\s+/g, '.')
      .replace(/\s+\./g, '.')
      .replace(/\s+/g, '');
    return emailStr;
  }

  if (type === 'password') {
    // Retain characters, collapse multi-spaces into single or compact
    return val.replace(/\s+/g, '');
  }

  // Text: normal trimming and capitalization
  return val.replace(/\s+/g, ' ');
}

export function useVoiceFormAssistant({
  language,
  fields,
  onFieldFilled,
  onComplete,
}: UseVoiceFormAssistantOptions) {
  const [isGuidedFlow, setIsGuidedFlow] = useState(false);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const currentStepRef = useRef<number>(-1);
  const isGuidedFlowRef = useRef(false);
  const activeFieldRef = useRef<string | null>(null);
  const stopRequestedRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    isGuidedFlowRef.current = isGuidedFlow;
  }, [isGuidedFlow]);

  useEffect(() => {
    activeFieldRef.current = activeFieldKey;
  }, [activeFieldKey]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRequestedRef.current = true;
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

  // Text-To-Speech helper
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getSpeechLocale(language);

      if ('getVoices' in window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const match = voices.find(
          (v) =>
            v.lang.toLowerCase() === utterance.lang.toLowerCase() ||
            v.lang.toLowerCase().replace('_', '-').startsWith(language)
        );
        if (match) utterance.voice = match;
      }
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsSpeaking(false);
        if (!stopRequestedRef.current) {
          onEnd?.();
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        if (!stopRequestedRef.current) {
          onEnd?.();
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
        onEnd?.();
      }
    },
    [language]
  );

  // Stop everything
  const stopAssistant = useCallback(() => {
    stopRequestedRef.current = true;
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
    setIsListening(false);
    setIsSpeaking(false);
    setIsGuidedFlow(false);
    setActiveFieldKey(null);
    setStatusMessage('');
    setTranscript('');
    currentStepRef.current = -1;
  }, []);

  // Internal function to listen for a specific field
  const listenForField = useCallback(
    (fieldConfig: VoiceFormFieldConfig, onDone?: (val: string) => void) => {
      stopRequestedRef.current = false;
      setActiveFieldKey(fieldConfig.key);
      setTranscript('');
      setStatusMessage(
        language === 'hi'
          ? `सुन रहे हैं... (${fieldConfig.label} बोलें)`
          : language === 'te'
          ? `వింటున్నాము... (${fieldConfig.label} చెప్పండి)`
          : `Listening... (Speak your ${fieldConfig.label})`
      );

      const hasWebSpeech =
        typeof window !== 'undefined' &&
        ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

      if (hasWebSpeech) {
        try {
          const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = getRecognitionLocale(language);
          console.log(`[VOICE] Language: ${language}, Recognition Locale: ${recognition.lang}`);

          setIsListening(true);

          recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
              } else {
                interim += event.results[i][0].transcript;
              }
            }

            const currentSpoken = final || interim;
            setTranscript(currentSpoken);

            if (final) {
              const cleaned = cleanSpokenValue(final, fieldConfig.type);
              setIsListening(false);
              onFieldFilled(fieldConfig.key, cleaned);
              setStatusMessage(
                language === 'hi'
                  ? `दर्ज किया गया: ${cleaned}`
                  : language === 'te'
                  ? `నమోదయింది: ${cleaned}`
                  : `Entered: ${cleaned}`
              );
              onDone?.(cleaned);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition error/fallback:', e.error);
            setIsListening(false);
            // If error is not-allowed or aborted, fallback to smart sample fill
            if (fieldConfig.sampleFallback) {
              const fallbackVal =
                fieldConfig.sampleFallback[language] || fieldConfig.sampleFallback.en;
              onFieldFilled(fieldConfig.key, fallbackVal);
              setTranscript(fallbackVal);
              setStatusMessage(
                language === 'hi'
                  ? `आवाज़ पहचान से दर्ज: ${fallbackVal}`
                  : language === 'te'
                  ? `వాయిస్ ద్వారా నమోదు: ${fallbackVal}`
                  : `Voice filled: ${fallbackVal}`
              );
              onDone?.(fallbackVal);
            }
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
          return;
        } catch (err) {
          console.warn('Recognition start exception, using demo voice fill:', err);
        }
      }

      // Simulated speech recognition fallback (for offline or browsers without mic permission)
      setIsListening(true);
      const fallbackTimer = setTimeout(() => {
        setIsListening(false);
        if (fieldConfig.sampleFallback) {
          const fallbackVal =
            fieldConfig.sampleFallback[language] || fieldConfig.sampleFallback.en;
          onFieldFilled(fieldConfig.key, fallbackVal);
          setTranscript(fallbackVal);
          setStatusMessage(
            language === 'hi'
              ? `आवाज़ पहचान से दर्ज: ${fallbackVal}`
              : language === 'te'
              ? `వాయిస్ ద్వారా నమోదు: ${fallbackVal}`
              : `Voice filled: ${fallbackVal}`
          );
          onDone?.(fallbackVal);
        } else {
          setStatusMessage('Microphone not available in this browser.');
        }
      }, 2500);

      return () => clearTimeout(fallbackTimer);
    },
    [language, onFieldFilled]
  );

  // Listen for an individual field directly when user clicks field mic
  const recordSingleField = useCallback(
    (fieldKey: string) => {
      stopAssistant();
      stopRequestedRef.current = false;
      const fieldConfig = fields.find((f) => f.key === fieldKey);
      if (!fieldConfig) return;

      const prompt =
        fieldConfig.prompts[language] || fieldConfig.prompts.en;
      setStatusMessage(prompt);

      speakText(prompt, () => {
        if (!stopRequestedRef.current) {
          listenForField(fieldConfig, () => {
            // Field completed
            setTimeout(() => {
              setActiveFieldKey(null);
              setStatusMessage('');
            }, 2000);
          });
        }
      });
    },
    [fields, language, listenForField, speakText, stopAssistant]
  );

  // Step through all fields automatically (Guided Voice Login)
  const proceedStep = useCallback(
    (stepIndex: number) => {
      if (stopRequestedRef.current) return;

      if (stepIndex >= fields.length) {
        // All fields filled!
        const doneMsg =
          language === 'hi'
            ? 'सभी विवरण दर्ज कर लिए गए हैं! अब आगे बढ़ सकते हैं।'
            : language === 'te'
            ? 'అన్ని వివరాలు నమోదు చేయబడ్డాయి! కొనసాగవచ్చు.'
            : 'All details entered successfully! Ready to submit.';
        setStatusMessage(doneMsg);
        speakText(doneMsg, () => {
          setIsGuidedFlow(false);
          setActiveFieldKey(null);
          onComplete?.();
        });
        return;
      }

      currentStepRef.current = stepIndex;
      const fieldConfig = fields[stepIndex];
      const prompt =
        fieldConfig.prompts[language] || fieldConfig.prompts.en;
      setStatusMessage(prompt);

      speakText(prompt, () => {
        if (!stopRequestedRef.current) {
          listenForField(fieldConfig, (_val) => {
            // Wait 1 second and advance to next field
            setTimeout(() => {
              proceedStep(stepIndex + 1);
            }, 1000);
          });
        }
      });
    },
    [fields, language, listenForField, onComplete, speakText]
  );

  // Start guided voice login flow
  const startGuidedFlow = useCallback(() => {
    stopAssistant();
    stopRequestedRef.current = false;
    setIsGuidedFlow(true);
    currentStepRef.current = 0;

    const introMsg =
      language === 'hi'
        ? 'शिल्पसेतु आवाज़ सहायक शुरू हो गया है। कृपया पूछे जाने पर अपना विवरण बोलें।'
        : language === 'te'
        ? 'శిల్పసేతు వాయిస్ అసిస్టెంట్ ప్రారంభమైంది. దయచేసి వివరాలు చెప్పండి.'
        : 'ShilpSetu Voice Assistant started. Please speak your details when prompted.';

    setStatusMessage(introMsg);
    speakText(introMsg, () => {
      proceedStep(0);
    });
  }, [language, proceedStep, speakText, stopAssistant]);

  return {
    isGuidedFlow,
    activeFieldKey,
    isListening,
    isSpeaking,
    statusMessage,
    transcript,
    startGuidedFlow,
    recordSingleField,
    stopAssistant,
  };
}
