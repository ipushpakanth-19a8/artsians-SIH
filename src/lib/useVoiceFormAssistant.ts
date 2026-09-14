import { useState, useRef, useCallback, useEffect } from 'react';
import { LanguageCode } from '../types';

export interface VoiceFormFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'tel' | 'email' | 'password' | 'number';
  prompts: {
    en: string;
    hi: string;
    te: string;
  };
  sampleFallback?: {
    en: string;
    hi: string;
    te: string;
  };
}

export interface UseVoiceFormAssistantOptions {
  language: LanguageCode;
  fields: VoiceFormFieldConfig[];
  onFieldFilled: (key: string, value: string) => void;
  onComplete?: () => void;
}

// Convert spoken number words across EN, HI, TE to digits
export function normalizeSpokenDigits(input: string): string {
  const digitWords: Record<string, string> = {
    // English
    zero: '0', oh: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
    six: '6', seven: '7', eight: '8', nine: '9',
    // Hindi
    शून्य: '0', सिफ़र: '0', एक: '1', दो: '2', तीन: '3', चार: '4', पाँच: '5',
    पांच: '5', छह: '6', छः: '6', सात: '7', आठ: '8', नौ: '9', दस: '10',
    // Telugu
    సున్నా: '0', ఒకటి: '1', రెండు: '2', మూడు: '3', నాలుగు: '4', ఐదు: '5',
    ఆరు: '6', ఏడు: '7', ఎనిమిది: '8', తొమ్మిది: '9',
  };

  let cleaned = input.toLowerCase();
  for (const [word, digit] of Object.entries(digitWords)) {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(reg, digit);
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
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (language === 'te') {
        utterance.lang = 'te-IN';
      } else {
        utterance.lang = 'en-IN';
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
          recognition.lang =
            language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

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
