import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Volume2, Sparkles, CheckCircle2,
  RefreshCw, AlertCircle, Edit3, ArrowRight, ShieldCheck, MapPin
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { speakText, stopSpeaking } from '../../lib/i18n';
import {
  parseConfirmationResponse,
  parseQuantityTranscript,
  parseColorsTranscript,
  cleanVoiceAnswer,
  generateAutoDescription,
} from '../../lib/voiceParsingService';
import { getArtisanFormattedLocation } from '../../services/locationService';

// ============================================================================
// TYPES & CONTRACTS
// ============================================================================

export type VoiceState =
  | 'IDLE'
  | 'ANALYZING'
  | 'SPEAKING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'CONFIRMING'
  | 'COMPLETED'
  | 'ERROR';

export type RequiredProductField =
  | 'handicraftName'
  | 'handicraftType'
  | 'colors'
  | 'location'
  | 'quantity'
  | 'description';

export interface FieldAuditStatus {
  value: any;
  source: 'ai' | 'geolocation' | 'artisan-voice' | 'artisan-manual' | 'auto-generated';
  confirmed: boolean;
}

export interface PricingResultData {
  materialCost: number;
  laborHours: number;
  fairHourlyWage: number;
  laborCost: number;
  productionCost: number;
  targetMargin: number;
  recommendedFairPrice: number;
  artisanApprovedPrice: number;
  quantity: number;
  marketBenchmarks?: any;
}

export interface ProductDetailsState {
  handicraftName: { value: string; confirmed: boolean; source: string };
  handicraftType: { value: string; confirmed: boolean; source: string };
  colors: { value: string[]; confirmed: boolean; source: string };
  location: { value: string; confirmed: boolean; source: string };
  quantity: { value: number; confirmed: boolean; source: string };
  description: { value: string; confirmed: boolean; source: string };
}

interface VoiceProductDetailsPricingWizardProps {
  language: LanguageCode;
  imageUrl?: string;
  detectedCraft: any | null;
  currentFormState: Record<string, any>;
  onFieldUpdated: (field: string, canonicalValue: any, localizedValue: any) => void;
  onProductConfirmed: (finalProduct: Record<string, any>, fieldAudits?: Record<string, FieldAuditStatus>) => void;
  onPricingCompleted: (pricingResult: PricingResultData) => void;
  onCancel?: () => void;
  onTelemetryUpdate?: (data: any) => void;
}

export const REGIONAL_SPEECH_LOCALES: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  or: 'or-IN',
  pa: 'pa-IN',
  as: 'as-IN',
};

export const PRODUCT_FIELDS: RequiredProductField[] = [
  'handicraftName',
  'handicraftType',
  'colors',
  'location',
  'quantity',
  'description',
];

// ============================================================================
// LOCALIZED PROMPT GENERATORS
// ============================================================================

function getFieldLabel(field: RequiredProductField, lang: LanguageCode): string {
  const labels: Record<RequiredProductField, Record<string, string>> = {
    handicraftName: {
      en: 'Handicraft Name',
      hi: 'शिल्प का नाम',
      te: 'హస్తకళ పేరు',
      ta: 'கைவினைப் பெயர்',
      kn: 'ಕರಕುಶಲ ಹೆಸರು',
      ml: 'കരകൗശല പേര്',
      mr: 'हस्तकलेचे नाव',
      gu: 'હસ્તકલા નામ',
      bn: 'হস্তশিল্পের নাম',
      or: 'ହସ୍ତଶିଳ୍ପ ନାମ',
      pa: 'ਦਸਤਕਾਰੀ ਦਾ ਨਾਮ',
      as: 'হস্তশিল্পৰ নাম',
    },
    handicraftType: {
      en: 'Handicraft Type',
      hi: 'शिल्प का प्रकार',
      te: 'హస్తకళ రకం',
      ta: 'கைவினை வகை',
      kn: 'ಕರಕುಶಲ ಪ್ರಕಾರ',
      ml: 'കരകൗശല തരം',
      mr: 'हस्तकलेचा प्रकार',
      gu: 'હસ્તકલા પ્રકાર',
      bn: 'হস্তশিল্পের ধরন',
      or: 'ହସ୍ତଶିଳ୍ପ ପ୍ରକାର',
      pa: 'ਦਸਤਕਾਰੀ ਦੀ ਕਿਸਮ',
      as: 'হস্তশিল্পৰ প্ৰকাৰ',
    },
    colors: {
      en: 'Product Color',
      hi: 'उत्पाद का रंग',
      te: 'ఉత్పత్తి రంగు',
      ta: 'பொருள் நிறம்',
      kn: 'ಉತ್ಪನ್ನದ ಬಣ್ಣ',
      ml: 'ഉൽപ്പന്ന നിറം',
      mr: 'उत्पादनाचा रंग',
      gu: 'ઉત્પાદન રંગ',
      bn: 'পণ্যের রঙ',
      or: 'ଉତ୍ପାଦ ରଙ୍ଗ',
      pa: 'ਉਤਪਾਦ ਦਾ ਰੰਗ',
      as: 'সামগ্ৰীৰ ৰং',
    },
    location: {
      en: 'Address / Location',
      hi: 'स्थान / पता',
      te: 'చిరునామా / ప్రాంతం',
      ta: 'முகவரி / இருப்பிடம்',
      kn: 'ವಿಳಾಸ / ಸ್ಥಳ',
      ml: 'വിലാസം / സ്ഥലം',
      mr: 'पत्ता / ठिकाण',
      gu: 'સરનામું / સ્થળ',
      bn: 'ঠিকানা / অবস্থান',
      or: 'ଠିକଣା / ସ୍ଥାନ',
      pa: 'ਪਤਾ / ਸਥਾਨ',
      as: 'ঠিকনা / স্থান',
    },
    quantity: {
      en: 'Quantity',
      hi: 'उपलब्ध मात्रा',
      te: 'లభ్య పరిమాణం',
      ta: 'கிடைக்கும் எண்ணிக்கை',
      kn: 'ಲಭ್ಯ ಪ್ರಮಾಣ',
      ml: 'ലഭ്യമായ എണ്ണം',
      mr: 'उपलब्ध प्रमाण',
      gu: 'ઉપલબ્ધ જથ્થો',
      bn: 'উপলব্ধ পরিমাণ',
      or: 'ଉପଲବ୍ଧ ପରିମାଣ',
      pa: 'ਉਪਲਬਧ ਗਿਣਤੀ',
      as: 'উপলব্ধ পৰিমাণ',
    },
    description: {
      en: 'Description',
      hi: 'उत्पाद विवरण',
      te: 'ఉత్పత్తి వివరణ',
      ta: 'பொருள் விளக்கம்',
      kn: 'ಉತ್ಪನ್ನ ವಿವರಣೆ',
      ml: 'ഉൽപ്പന്ന വിവരണം',
      mr: 'उत्पादन वर्णन',
      gu: 'ઉત્પાદન વિગત',
      bn: 'পণ্যের বিবরণ',
      or: 'ଉତ୍ପାଦ ବିବରଣୀ',
      pa: 'ਉਤਪਾਦ ਦਾ ਵੇਰਵਾ',
      as: 'সামগ্ৰীৰ বিৱৰণ',
    },
  };
  return labels[field]?.[lang] || labels[field]?.en || field;
}

function getConfirmationPrompt(field: RequiredProductField, valStr: string, lang: LanguageCode): string {
  switch (field) {
    case 'handicraftName':
      if (lang === 'hi') return `शिल्प का नाम ${valStr} है। क्या यह सही है?`;
      if (lang === 'te') return `హస్తకళ పేరు ${valStr}. ఇది సరైనదేనా?`;
      return `The handicraft name is ${valStr}. Is this correct?`;
    case 'handicraftType':
      if (lang === 'hi') return `शिल्प का प्रकार ${valStr} है। क्या यह सही है?`;
      if (lang === 'te') return `హస్తకళ రకం ${valStr}. ఇది సరైనదేనా?`;
      return `The handicraft type is ${valStr}. Is this correct?`;
    case 'colors':
      if (lang === 'hi') return `उत्पाद का रंग ${valStr} है। क्या यह सही है?`;
      if (lang === 'te') return `ఉత్పత్తి రంగు ${valStr}. ఇది సరైనదేనా?`;
      return `The product color is ${valStr}. Is this correct?`;
    case 'location':
      if (lang === 'hi') return `स्थान ${valStr} है। क्या यह सही है?`;
      if (lang === 'te') return `ప్రాంతం ${valStr}. ఇది సరైనదేనా?`;
      return `The location is ${valStr}. Is this correct?`;
    case 'quantity':
      if (lang === 'hi') return `मात्रा ${valStr} पीस है। क्या यह सही है?`;
      if (lang === 'te') return `పరిమాణం ${valStr} పీసులు. ఇది సరైనదేనా?`;
      return `The quantity is ${valStr} pieces. Is this correct?`;
    case 'description':
      if (lang === 'hi') return `आपका विवरण है: ${valStr}। क्या यह सही है?`;
      if (lang === 'te') return `మీ వివరణ: ${valStr}. ఇది సరైనదేనా?`;
      return `Your description is: ${valStr}. Is this correct?`;
  }
}

function getAskValuePrompt(field: RequiredProductField, lang: LanguageCode): string {
  switch (field) {
    case 'handicraftName':
      if (lang === 'hi') return `कृपया अपनी हस्तकला का नाम बताएं।`;
      if (lang === 'te') return `దయచేసి మీ హస్తకళ పేరు చెప్పండి.`;
      return `What is the handicraft name?`;
    case 'handicraftType':
      if (lang === 'hi') return `कृपया शिल्प का प्रकार बताएं, जैसे हथकरघा या मिट्टी के बर्तन।`;
      if (lang === 'te') return `దయచేసి హస్తకళ రకం చెప్పండి.`;
      return `What is the handicraft type?`;
    case 'colors':
      if (lang === 'hi') return `उत्पाद के मुख्य रंग कौन से हैं?`;
      if (lang === 'te') return `ఉత్పత్తి ముఖ్య రంగులు ఏమిటి?`;
      return `What is the product color?`;
    case 'location':
      if (lang === 'hi') return `आपकी कार्यशाला का पता या स्थान क्या है?`;
      if (lang === 'te') return `మీ ప్రాంతం లేదా చిరునామా ఏమిటి?`;
      return `What is your workshop address or location?`;
    case 'quantity':
      if (lang === 'hi') return `कितने पीस बिक्री के लिए उपलब्ध हैं?`;
      if (lang === 'te') return `ఎన్ని పీసులు అందుబాటులో ఉన్నాయి?`;
      return `How many pieces are available?`;
    case 'description':
      if (lang === 'hi') return `उत्पाद का विवरण तैयार किया जा रहा है।`;
      if (lang === 'te') return `ఉత్పత్తి వివరణ సిద్ధమవుతోంది.`;
      return `Generating description...`;
  }
}

function getCorrectionPrompt(field: RequiredProductField, lang: LanguageCode): string {
  if (lang === 'hi') return `कृपया सही मान बताएं।`;
  if (lang === 'te') return `దయచేసి సరైన సమాచారం చెప్పండి.`;
  return `Please tell me the correct value.`;
}

function getNoSpeechPrompt(lang: LanguageCode): string {
  if (lang === 'hi') return `मुझे कुछ सुनाई नहीं दिया। कृपया दोबारा बोलें।`;
  if (lang === 'te') return `నాకు ఏమీ వినిపించలేదు. దయచేసి మళ్ళీ చెప్పండి.`;
  return `I didn't hear anything. Please try again.`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const VoiceProductDetailsPricingWizard: React.FC<VoiceProductDetailsPricingWizardProps> = ({
  language,
  imageUrl,
  detectedCraft,
  currentFormState,
  onFieldUpdated,
  onProductConfirmed,
  onCancel,
  onTelemetryUpdate,
}) => {
  const speechLocale = REGIONAL_SPEECH_LOCALES[language] || 'en-IN';
  const SpeechRecClass =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
  const isSpeechRecAvailable = Boolean(SpeechRecClass);
  const isTtsAvailable = typeof window !== 'undefined' && Boolean(window.speechSynthesis);

  // --------------------------------------------------------------------------
  // 1. CENTRAL PRODUCT DETAILS STATE (Section 18)
  // --------------------------------------------------------------------------
  const [productState, setProductState] = useState<ProductDetailsState>(() => {
    const rawColors = detectedCraft?.colors || currentFormState.colors;
    const colorsArr = Array.isArray(rawColors)
      ? rawColors
      : typeof rawColors === 'string' && rawColors.trim()
      ? rawColors.split(',').map((c: string) => c.trim()).filter(Boolean)
      : [];

    const initialName = detectedCraft?.craftName || currentFormState.title || '';
    const initialType = detectedCraft?.craftCategory || currentFormState.category || '';
    const initialLoc = currentFormState.madeInLocation || '';
    const initialQty = Number(currentFormState.quantity) || 0;

    return {
      handicraftName: {
        value: initialName,
        confirmed: false,
        source: initialName ? 'ai' : '',
      },
      handicraftType: {
        value: initialType,
        confirmed: false,
        source: initialType ? 'ai' : '',
      },
      colors: {
        value: colorsArr,
        confirmed: false,
        source: colorsArr.length ? 'ai' : '',
      },
      location: {
        value: initialLoc,
        confirmed: false,
        source: initialLoc ? 'geolocation' : '',
      },
      quantity: {
        value: initialQty,
        confirmed: false,
        source: initialQty ? 'artisan-voice' : '',
      },
      description: {
        value: '',
        confirmed: false,
        source: '',
      },
    };
  });

  // --------------------------------------------------------------------------
  // 2. VOICE STATE MACHINE (Section 10)
  // --------------------------------------------------------------------------
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number>(0);
  const currentField = PRODUCT_FIELDS[currentFieldIndex] || 'handicraftName';

  // Sub-mode for current field:
  // 'CONFIRMING': speaking/listening for YES/NO
  // 'ANSWERING': waiting for artisan's initial answer
  // 'CORRECTING': artisan said NO, waiting for correction
  // 'FINAL_CONFIRMATION': all 6 confirmed, asking final summary YES/NO
  const [fieldMode, setFieldMode] = useState<'CONFIRMING' | 'ANSWERING' | 'CORRECTING' | 'FINAL_CONFIRMATION'>('CONFIRMING');

  // UI / Transcript state
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [noSpeechRetries, setNoSpeechRetries] = useState<number>(0);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualInputVal, setManualInputVal] = useState<string>('');
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Diagnostic Test States
  const [devTestTtsRunning, setDevTestTtsRunning] = useState<boolean>(false);
  const [devTestMicRunning, setDevTestMicRunning] = useState<boolean>(false);
  const [devMicTranscript, setDevMicTranscript] = useState<string>('');

  // Refs for audio safety
  const isMountedRef = useRef<boolean>(true);
  const recognitionRef = useRef<any>(null);
  const delayTimerRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);

  // Helper to format field value into readable string
  const formatFieldValue = useCallback((field: RequiredProductField, state: ProductDetailsState): string => {
    const item = state[field];
    if (!item) return '';
    if (field === 'colors') {
      return (item.value as string[]).join(', ');
    }
    if (field === 'quantity') {
      const q = typeof item.value === 'number' ? item.value : Number(item.value);
      return q > 0 ? String(q) : '';
    }
    return String(item.value || '');
  }, []);

  // --------------------------------------------------------------------------
  // DEV-ONLY STRUCTURED CONSOLE LOGS (Section 11)
  // --------------------------------------------------------------------------
  const devLog = useCallback((key: string, val: any) => {
    if ((import.meta as any).env?.DEV) {
      console.log(`[VOICE] ${key} =`, val);
    }
  }, []);

  // Initial environment audit log
  useEffect(() => {
    devLog('language', language);
    devLog('speechLocale', speechLocale);
    devLog('recognitionSupported', isSpeechRecAvailable);
    devLog('ttsSupported', isTtsAvailable);
  }, [language, speechLocale, isSpeechRecAvailable, isTtsAvailable, devLog]);

  // Telemetry updates
  useEffect(() => {
    if (onTelemetryUpdate) {
      onTelemetryUpdate({
        voiceState,
        currentField,
        transcript: interimTranscript || transcript,
        productState,
        speechLocale,
        speechRecognitionSupported: isSpeechRecAvailable,
        ttsSupported: isTtsAvailable,
        micPermissionError,
      });
    }
  }, [voiceState, currentField, transcript, interimTranscript, productState, speechLocale, isSpeechRecAvailable, isTtsAvailable, micPermissionError, onTelemetryUpdate]);

  // --------------------------------------------------------------------------
  // LOCATION AUTO-DETECTION (Section 3)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!productState.location.value) {
      getArtisanFormattedLocation().then((res) => {
        if (res.success && res.formattedLocation) {
          setProductState((prev) => ({
            ...prev,
            location: {
              value: res.formattedLocation,
              confirmed: false,
              source: 'geolocation',
            },
          }));
          onFieldUpdated('madeInLocation', res.formattedLocation, res.formattedLocation);
        } else {
          setProductState((prev) => ({
            ...prev,
            location: {
              value: 'Location unavailable',
              confirmed: false,
              source: 'unavailable',
            },
          }));
        }
      });
    }
  }, []);

  // --------------------------------------------------------------------------
  // DESCRIPTION REGENERATION (Section 20)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const { handicraftName, handicraftType, colors, location, quantity } = productState;
    if (handicraftName.value && handicraftType.value) {
      const generated = generateAutoDescription(
        {
          handicraftName: handicraftName.value,
          handicraftType: handicraftType.value,
          colors: colors.value,
          location: location.value,
          quantity: quantity.value,
        },
        language
      );
      setProductState((prev) => {
        if (prev.description.value !== generated) {
          return {
            ...prev,
            description: {
              value: generated,
              confirmed: false,
              source: 'auto-generated',
            },
          };
        }
        return prev;
      });
      onFieldUpdated('description', generated, generated);
    }
  }, [
    productState.handicraftName.value,
    productState.handicraftType.value,
    productState.colors.value,
    productState.location.value,
    productState.quantity.value,
    language,
  ]);

  // --------------------------------------------------------------------------
  // SAFE ASYNC TTS WRAPPER (Never TTS + mic simultaneously)
  // --------------------------------------------------------------------------
  const safeSpeak = useCallback(
    (textToSpeak: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!isMountedRef.current || !isTtsAvailable) {
          resolve();
          return;
        }

        // 1. Immediately kill active microphone
        if (recognitionRef.current && isListeningRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {}
          isListeningRef.current = false;
        }
        stopSpeaking();

        isSpeakingRef.current = true;
        setVoiceState('SPEAKING');
        setActivePrompt(textToSpeak);
        devLog('prompt', textToSpeak);

        speakText(
          textToSpeak,
          language,
          () => {
            isSpeakingRef.current = false;
            resolve();
          },
          () => {
            devLog('TTS starting', textToSpeak);
          }
        );
      });
    },
    [language, isTtsAvailable, devLog]
  );

  // --------------------------------------------------------------------------
  // SAFE MICROPHONE CONTROLLER (300-800ms delay after TTS)
  // --------------------------------------------------------------------------
  const safeListen = useCallback(() => {
    if (!isMountedRef.current) return;

    if (!isSpeechRecAvailable || !recognitionRef.current) {
      setShowManualInput(true);
      setVoiceState('IDLE');
      return;
    }

    if (isSpeakingRef.current) {
      console.warn('[VOICE] Blocked attempt to start microphone while TTS is speaking');
      return;
    }

    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);

    // 300-800ms mandatory safety delay (Section 10)
    delayTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current || isSpeakingRef.current) return;
      try {
        devLog('recognition starting', speechLocale);
        setTranscript('');
        setInterimTranscript('');
        recognitionRef.current.lang = speechLocale;
        recognitionRef.current.start();
      } catch (err: any) {
        // Recognition might already be running
        devLog('recognition start note', err?.message);
      }
    }, 450);
  }, [isSpeechRecAvailable, speechLocale, devLog]);

  // --------------------------------------------------------------------------
  // INITIALIZE SPEECH RECOGNITION (Section 13)
  // --------------------------------------------------------------------------
  useEffect(() => {
    isMountedRef.current = true;

    if (!SpeechRecClass) {
      setShowManualInput(true);
      return;
    }

    try {
      const rec = new SpeechRecClass();
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = speechLocale;

      rec.onstart = () => {
        if (!isMountedRef.current) return;
        isListeningRef.current = true;
        setVoiceState('LISTENING');
        setMicPermissionError(null);
        devLog('recognition started', true);
      };

      rec.onresult = (event: any) => {
        if (!isMountedRef.current) return;
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
          devLog('interim transcript', interim);
        }

        if (final) {
          devLog('final transcript', final);
          setTranscript(final.trim());
          setInterimTranscript('');
          try {
            rec.stop();
          } catch {}
          isListeningRef.current = false;
          handleArtisanSpeech(final.trim());
        }
      };

      rec.onerror = (event: any) => {
        devLog('recognition error', event.error);
        if (!isMountedRef.current) return;
        isListeningRef.current = false;

        if (event.error === 'not-allowed') {
          setMicPermissionError('Microphone permission is required for voice input.');
          setVoiceState('ERROR');
          setShowManualInput(true);
          devLog('microphonePermission', 'denied');
        } else if (event.error === 'no-speech') {
          handleNoSpeech();
        } else {
          setVoiceState('IDLE');
        }
      };

      rec.onend = () => {
        devLog('recognition ended', true);
        isListeningRef.current = false;
      };

      recognitionRef.current = rec;
    } catch (e: any) {
      console.warn('SpeechRecognition init error:', e);
    }

    return () => {
      isMountedRef.current = false;
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [speechLocale]);

  // --------------------------------------------------------------------------
  // NO-SPEECH RETRY HANDLER (Section 16: MAX_RETRIES = 2)
  // --------------------------------------------------------------------------
  const handleNoSpeech = async () => {
    if (noSpeechRetries < 2) {
      setNoSpeechRetries((r) => r + 1);
      const prompt = getNoSpeechPrompt(language);
      await safeSpeak(prompt);
      safeListen();
    } else {
      setShowManualInput(true);
      setVoiceState('IDLE');
    }
  };

  // --------------------------------------------------------------------------
  // ADVANCE TO NEXT FIELD OR FINAL SUMMARY
  // --------------------------------------------------------------------------
  const advanceToNext = useCallback(
    async (nextIdx: number, updatedState: ProductDetailsState) => {
      if (nextIdx < PRODUCT_FIELDS.length) {
        setCurrentFieldIndex(nextIdx);
        const nextFieldKey = PRODUCT_FIELDS[nextIdx];
        devLog('currentField', nextFieldKey);
        devLog('moving to next field', nextFieldKey);

        const currentVal = updatedState[nextFieldKey];
        const valStr = formatFieldValue(nextFieldKey, updatedState);

        if (valStr && valStr !== 'Location unavailable') {
          // AI detected or auto-filled: Ask "Is this correct?"
          setFieldMode('CONFIRMING');
          const prompt = getConfirmationPrompt(nextFieldKey, valStr, language);
          await safeSpeak(prompt);
          setVoiceState('CONFIRMING');
          safeListen();
        } else {
          // Empty or unknown: Ask "What is the [field]?"
          setFieldMode('ANSWERING');
          const prompt = getAskValuePrompt(nextFieldKey, language);
          await safeSpeak(prompt);
          setVoiceState('LISTENING');
          safeListen();
        }
      } else {
        // All 6 fields confirmed! Initiate Final Summary (Section 21)
        setFieldMode('FINAL_CONFIRMATION');
        const s = updatedState;
        const summaryText =
          language === 'hi'
            ? `आपके उत्पाद के सभी विवरण: नाम: ${s.handicraftName.value}, प्रकार: ${s.handicraftType.value}, रंग: ${(s.colors.value || []).join(', ')}, स्थान: ${s.location.value}, मात्रा: ${s.quantity.value} पीस। क्या ये सभी विवरण सही हैं?`
            : language === 'te'
            ? `మీ ఉత్పత్తి వివరాలు: పేరు: ${s.handicraftName.value}, రకం: ${s.handicraftType.value}, రంగు: ${(s.colors.value || []).join(', ')}, స్థానం: ${s.location.value}, పరిమాణం: ${s.quantity.value} పీసులు. ఈ వివరాలన్నీ సరైనవేనా?`
            : `Your product details are: Handicraft Name: ${s.handicraftName.value}. Type: ${s.handicraftType.value}. Color: ${(s.colors.value || []).join(', ')}. Location: ${s.location.value}. Quantity: ${s.quantity.value}. Description: ${s.description.value}. Are all these details correct?`;

        devLog('final summary', summaryText);
        await safeSpeak(summaryText);
        setVoiceState('CONFIRMING');
        safeListen();
      }
    },
    [language, formatFieldValue, safeSpeak, safeListen, devLog]
  );

  // --------------------------------------------------------------------------
  // PROCESS ARTISAN SPEECH (Sections 7, 8, 9, 17)
  // --------------------------------------------------------------------------
  const handleArtisanSpeech = async (speechText: string) => {
    setVoiceState('PROCESSING');
    setNoSpeechRetries(0);

    // CASE 1: FINAL CONFIRMATION (All 6 details confirmed)
    if (fieldMode === 'FINAL_CONFIRMATION') {
      const confirmation = parseConfirmationResponse(speechText, language);
      devLog('confirmation', confirmation);

      if (confirmation === 'yes') {
        setVoiceState('COMPLETED');
        const successMsg =
          language === 'hi'
            ? 'बहुत बढ़िया! आपके उत्पाद के विवरण सुरक्षित कर लिए गए हैं।'
            : language === 'te'
            ? 'అద్భుతం! మీ హస్తకళ వివరాలు భద్రపరచబడ్డాయి.'
            : 'Great! Your product details are confirmed.';
        await safeSpeak(successMsg);

        // Notify parent with final product details
        const finalProduct = {
          productName: productState.handicraftName.value,
          title: productState.handicraftName.value,
          category: productState.handicraftType.value,
          craftType: productState.handicraftType.value,
          colors: productState.colors.value.join(', '),
          madeInLocation: productState.location.value,
          region: productState.location.value,
          quantity: productState.quantity.value,
          shortDesc: productState.description.value,
          story: productState.description.value,
          description: productState.description.value,
        };
        onProductConfirmed(finalProduct);
        return;
      } else {
        // Artisan said NO to final summary: ask which detail to change
        const whichFieldMsg =
          language === 'hi'
            ? 'आप किस विवरण को बदलना चाहते हैं?'
            : language === 'te'
            ? 'మీరు ఏ వివరాలను మార్చాలనుకుంటున్నారు?'
            : 'Which detail should I change?';
        await safeSpeak(whichFieldMsg);
        setFieldMode('CORRECTING');
        safeListen();
        return;
      }
    }

    // CASE 2: CURRENT FIELD CONFIRMATION ("Is this correct?")
    if (fieldMode === 'CONFIRMING') {
      const confirmation = parseConfirmationResponse(speechText, language);
      devLog('confirmation', confirmation);

      if (confirmation === 'yes') {
        // Field confirmed! (Section 7)
        devLog('field saved', currentField);
        const updatedState = {
          ...productState,
          [currentField]: {
            ...productState[currentField],
            confirmed: true,
          },
        };
        setProductState(updatedState);
        await advanceToNext(currentFieldIndex + 1, updatedState);
        return;
      } else if (confirmation === 'no') {
        // Artisan says NO: ask for correction of ONLY this field (Section 8)
        setFieldMode('CORRECTING');
        const askCorrection = getCorrectionPrompt(currentField, language);
        await safeSpeak(askCorrection);
        setVoiceState('LISTENING');
        safeListen();
        return;
      }
    }

    // CASE 3: ANSWERING OR CORRECTING FIELD VALUE
    let parsedValue: any = null;

    if (currentField === 'quantity') {
      parsedValue = parseQuantityTranscript(speechText);
      if (!parsedValue || parsedValue <= 0) {
        devLog('parsed value', 'invalid quantity');
        const retryQty =
          language === 'hi'
            ? 'कृपया उपलब्ध संख्या स्पष्ट बोलें, जैसे पाँच या दस।'
            : language === 'te'
            ? 'దయచేసి పరిమాణం సంఖ్య చెప్పండి, ఉదాహరణకు ఐదు లేదా పది.'
            : 'Please say a positive number, such as 5 or 10.';
        await safeSpeak(retryQty);
        safeListen();
        return;
      }
    } else if (currentField === 'colors') {
      parsedValue = parseColorsTranscript(speechText);
      if (!parsedValue.length) {
        parsedValue = [cleanVoiceAnswer(speechText, currentField)];
      }
    } else {
      parsedValue = cleanVoiceAnswer(speechText, currentField);
    }

    devLog('parsed value', parsedValue);

    // Save candidate value to product state
    const updatedState = {
      ...productState,
      [currentField]: {
        value: parsedValue,
        confirmed: false,
        source: 'artisan-voice',
      },
    };
    setProductState(updatedState);

    // Update parent
    if (currentField === 'handicraftName') {
      onFieldUpdated('title', parsedValue, parsedValue);
    } else if (currentField === 'handicraftType') {
      onFieldUpdated('craftType', parsedValue, parsedValue);
    } else if (currentField === 'colors') {
      onFieldUpdated('colors', parsedValue.join(', '), parsedValue.join(', '));
    } else if (currentField === 'location') {
      onFieldUpdated('madeInLocation', parsedValue, parsedValue);
    } else if (currentField === 'quantity') {
      onFieldUpdated('quantity', parsedValue, parsedValue);
    }

    // Speak candidate value back to artisan and ask "Is this correct?" (Section 6, 8)
    const displayStr = Array.isArray(parsedValue) ? parsedValue.join(', ') : String(parsedValue);
    setFieldMode('CONFIRMING');
    const confirmPrompt = getConfirmationPrompt(currentField, displayStr, language);
    await safeSpeak(confirmPrompt);
    setVoiceState('CONFIRMING');
    safeListen();
  };

  // --------------------------------------------------------------------------
  // MANUAL FIELD SUBMISSION
  // --------------------------------------------------------------------------
  const handleManualSubmit = async () => {
    if (!manualInputVal.trim()) return;
    const raw = manualInputVal.trim();
    let val: any = raw;

    if (currentField === 'quantity') {
      const num = parseInt(raw, 10);
      if (isNaN(num) || num <= 0) return;
      val = num;
    } else if (currentField === 'colors') {
      val = raw.split(',').map((c) => c.trim()).filter(Boolean);
    }

    const updatedState = {
      ...productState,
      [currentField]: {
        value: val,
        confirmed: true,
        source: 'artisan-manual',
      },
    };
    setProductState(updatedState);
    setShowManualInput(false);
    setManualInputVal('');

    await advanceToNext(currentFieldIndex + 1, updatedState);
  };

  // --------------------------------------------------------------------------
  // START VOICE FLOW ON LOAD
  // --------------------------------------------------------------------------
  const startFlow = useCallback(async () => {
    setVoiceState('ANALYZING');
    const firstField = PRODUCT_FIELDS[0];
    devLog('currentField', firstField);

    const valStr = formatFieldValue(firstField, productState);
    if (valStr) {
      setFieldMode('CONFIRMING');
      const prompt = getConfirmationPrompt(firstField, valStr, language);
      await safeSpeak(prompt);
      setVoiceState('CONFIRMING');
      safeListen();
    } else {
      setFieldMode('ANSWERING');
      const prompt = getAskValuePrompt(firstField, language);
      await safeSpeak(prompt);
      setVoiceState('LISTENING');
      safeListen();
    }
  }, [language, productState, formatFieldValue, safeSpeak, safeListen, devLog]);

  // Auto-start once when detectedCraft or imageUrl arrives
  const hasStartedRef = useRef<boolean>(false);
  useEffect(() => {
    if (!hasStartedRef.current && (detectedCraft || imageUrl)) {
      hasStartedRef.current = true;
      const t = setTimeout(() => {
        startFlow();
      }, 700);
      return () => clearTimeout(t);
    }
  }, [detectedCraft, imageUrl, startFlow]);

  // --------------------------------------------------------------------------
  // DEV DIAGNOSTIC TESTS (Sections 12 & 13)
  // --------------------------------------------------------------------------
  const runTtsIndependentTest = async () => {
    setDevTestTtsRunning(true);
    devLog('TTS test starting', 'Please confirm your product details.');
    await safeSpeak('Please confirm your product details.');
    devLog('TTS test completed', true);
    setDevTestTtsRunning(false);
  };

  const runMicIndependentTest = () => {
    if (!SpeechRecClass) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }
    setDevTestMicRunning(true);
    setDevMicTranscript('');
    try {
      const rec = new SpeechRecClass();
      rec.lang = speechLocale;
      rec.continuous = false;
      rec.interimResults = true;

      rec.onstart = () => devLog('mic test started', speechLocale);
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setDevMicTranscript(text);
        devLog('mic test transcript', text);
      };
      rec.onerror = (e: any) => {
        devLog('mic test error', e.error);
        setDevTestMicRunning(false);
      };
      rec.onend = () => {
        devLog('mic test ended', true);
        setDevTestMicRunning(false);
      };
      rec.start();
    } catch (e: any) {
      devLog('mic test exception', e?.message);
      setDevTestMicRunning(false);
    }
  };

  // Progress computation (1 to 6)
  const confirmedCount = PRODUCT_FIELDS.filter((f) => productState[f].confirmed).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Banner: Progress and Voice State with Double-Bezel Framing */}
      <div className="p-1 rounded-[2rem] bg-[#EFE7D8]/60 border border-[#D9CEB8]/80 shadow-xs">
        <div className="bg-[#FFFDF8] rounded-[1.75rem] p-5 border border-[#E8DFC9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A8462D]/10 text-[#A8462D] border border-[#A8462D]/20 flex items-center justify-center font-black">
              {confirmedCount} / 6
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#29221D] font-['Playfair_Display',serif]">
                Product Details Voice Verification
              </h3>
              <p className="text-xs text-[#7A6E65]">
                One-by-one voice confirmation with your multilingual artisan voice assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                voiceState === 'LISTENING'
                  ? 'bg-rose-100 text-rose-800 animate-pulse border border-rose-300'
                  : voiceState === 'SPEAKING'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : voiceState === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-[#F7F2E8] text-[#7A6E65] border border-[#D9CEB8]'
              }`}
            >
              {voiceState === 'LISTENING' && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />}
              {voiceState === 'SPEAKING' && <Volume2 className="w-3.5 h-3.5 animate-bounce text-[#A8462D]" />}
              <span>State: {voiceState}</span>
            </span>

            <button
              type="button"
              onClick={startFlow}
              title="Restart Voice Assistant"
              className="p-2 rounded-xl bg-[#F7F2E8] hover:bg-[#EAE0CD] text-[#29221D] border border-[#D9CEB8] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Clean 6-Field Product Details, Right = Prominent Voice Assistant */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* ================================================== */}
        {/* PRODUCT DETAILS (Section 1, 18, 19) */}
        {/* ================================================== */}
        <div className="md:col-span-6 p-1 rounded-[2rem] bg-[#EFE7D8]/60 border border-[#D9CEB8]/80 shadow-xs">
          <div className="bg-[#FFFDF8] rounded-[1.75rem] p-6 border border-[#E8DFC9] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9CEB8]">
              <h4 className="font-extrabold text-sm text-[#29221D] uppercase tracking-wider font-['Playfair_Display',serif]">
                Product Details (6 Fields)
              </h4>
              <span className="text-xs text-[#7A6E65] font-semibold bg-[#F7F2E8] px-2.5 py-0.5 rounded-full border border-[#D9CEB8]">
                {confirmedCount} of 6 Confirmed
              </span>
            </div>

            <div className="space-y-3">
              {PRODUCT_FIELDS.map((field, idx) => {
                const item = productState[field];
                const isCurrent = field === currentField;
                const valDisplay = formatFieldValue(field, productState);

                return (
                  <div
                    key={field}
                    onClick={() => {
                      setCurrentFieldIndex(idx);
                      setFieldMode('CONFIRMING');
                      const p = getConfirmationPrompt(field, valDisplay || 'Not specified', language);
                      safeSpeak(p);
                      safeListen();
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-[#A8462D] bg-[#A8462D]/10 ring-2 ring-[#A8462D]/20 shadow-xs'
                        : item.confirmed
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : 'border-[#D9CEB8] bg-[#F7F2E8]/40 hover:border-[#A8462D]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#7A6E65] uppercase">
                        {idx + 1}. {getFieldLabel(field, language)}
                      </span>
                      {item.confirmed ? (
                        <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      ) : item.value ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                          {item.source === 'ai' ? 'AI Detected' : item.source === 'geolocation' ? 'GPS Detected' : 'Unconfirmed'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-[#9C8F84]">
                          Waiting for voice
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-[#29221D] mt-1 line-clamp-2">
                      {valDisplay || <span className="italic text-[#9C8F84] font-normal">Not provided yet</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* PROMINENT VOICE ASSISTANT CARD (Section 19) */}
        {/* ================================================== */}
        <div className="md:col-span-6 space-y-4">
          <div className="p-1 rounded-[2rem] bg-[#EFE7D8]/60 border border-[#D9CEB8]/80 shadow-xs">
            <div className="bg-[#FFFDF8] rounded-[1.75rem] p-6 border border-[#E8DFC9] space-y-5">
              {/* Speaker / Microphone Status Animation */}
              <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-md ${
                    voiceState === 'SPEAKING'
                      ? 'bg-[#C88732] text-white scale-105 animate-pulse ring-4 ring-[#C88732]/20'
                      : voiceState === 'LISTENING'
                      ? 'bg-[#A8462D] text-white scale-110 ring-4 ring-[#A8462D]/30 animate-pulse'
                      : voiceState === 'COMPLETED'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#F7F2E8] text-[#7A6E65] border border-[#D9CEB8]'
                  }`}
                >
                  {voiceState === 'SPEAKING' ? (
                    <Volume2 className="w-10 h-10" />
                  ) : voiceState === 'LISTENING' ? (
                    <Mic className="w-10 h-10" />
                  ) : voiceState === 'COMPLETED' ? (
                    <CheckCircle2 className="w-10 h-10" />
                  ) : (
                    <MicOff className="w-8 h-8 text-[#9C8F84]" />
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-[#A8462D] tracking-wider bg-[#A8462D]/10 px-2.5 py-0.5 rounded-md border border-[#A8462D]/20">
                    Step {currentFieldIndex + 1} of 6 • {getFieldLabel(currentField, language)}
                  </span>
                  <p className="text-base font-bold text-[#29221D] mt-1.5 px-4 font-['Playfair_Display',serif]">
                    {activePrompt || 'Preparing voice prompt...'}
                  </p>
                </div>
              </div>

            {/* Live Transcript Display Box (Section 13) */}
            <div className="bg-white rounded-2xl p-4 border border-[#eadfd4] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
                <span className="flex items-center gap-1.5">
                  <Mic className={`w-3.5 h-3.5 ${voiceState === 'LISTENING' ? 'text-rose-600 animate-spin' : ''}`} />
                  {voiceState === 'LISTENING' ? '🎤 Listening for answer...' : 'Last Answer Transcript:'}
                </span>
                <span className="font-mono text-[10px] text-stone-400">{speechLocale}</span>
              </div>

              <div className="min-h-[44px] flex items-center">
                {interimTranscript ? (
                  <p className="text-sm font-semibold text-[#9c4124] italic">
                    "{interimTranscript}"
                  </p>
                ) : transcript ? (
                  <p className="text-sm font-black text-stone-900">
                    "{transcript}"
                  </p>
                ) : (
                  <p className="text-xs text-stone-400 italic">
                    {voiceState === 'LISTENING'
                      ? 'Say "Yes", "No", or speak your correction...'
                      : 'Audio transcript will appear here'}
                  </p>
                )}
              </div>
            </div>

            {/* Microphone Permission Warning (Section 15) */}
            {micPermissionError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{micPermissionError}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMicPermissionError(null);
                      safeListen();
                    }}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualInput(true)}
                    className="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Enter Manually
                  </button>
                </div>
              </div>
            )}

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#eadfd4]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => safeSpeak(activePrompt)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (voiceState === 'LISTENING') {
                      try {
                        recognitionRef.current?.stop();
                      } catch {}
                      isListeningRef.current = false;
                      setVoiceState('IDLE');
                    } else {
                      safeListen();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    voiceState === 'LISTENING'
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{voiceState === 'LISTENING' ? 'Stop Mic' : 'Start Mic'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-xs text-[#9c4124] hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{showManualInput ? 'Hide Manual Edit' : 'Edit Current Detail'}</span>
              </button>
            </div>

            {/* Manual Edit Panel for Current Field (Section 14 & 19) */}
            {showManualInput && (
              <div className="p-4 rounded-2xl bg-white border border-[#eadfd4] space-y-3 pt-3 animate-fade-in">
                <label className="block text-xs font-black text-stone-700">
                  Manual Entry for: {getFieldLabel(currentField, language)}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={currentField === 'quantity' ? 'number' : 'text'}
                    value={manualInputVal}
                    onChange={(e) => setManualInputVal(e.target.value)}
                    placeholder={`Enter ${getFieldLabel(currentField, language)}`}
                    className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9c4124] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    className="px-4 py-2 bg-[#A8462D] text-white rounded-xl text-xs font-bold hover:bg-[#8E3822] cursor-pointer shadow-xs"
                  >
                    Save & Next
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* ================================================== */}
          {/* DEV-ONLY DIAGNOSTIC PANEL (Section 11, 12, 13) */}
          {/* ================================================== */}
          {(import.meta as any).env?.DEV && (
            <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 text-xs space-y-3 font-mono">
              <div className="flex items-center justify-between text-stone-400 text-[11px] pb-1 border-b border-stone-800">
                <span className="font-bold text-amber-400">DEV VOICE DIAGNOSTICS</span>
                <span>Locale: {speechLocale}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>TTS Supported: <span className={isTtsAvailable ? 'text-emerald-400 font-bold' : 'text-rose-400'}>{String(isTtsAvailable)}</span></div>
                <div>SpeechRec: <span className={isSpeechRecAvailable ? 'text-emerald-400 font-bold' : 'text-rose-400'}>{String(isSpeechRecAvailable)}</span></div>
                <div>Current Field: <span className="text-amber-300">{currentField}</span></div>
                <div>Field Mode: <span className="text-amber-300">{fieldMode}</span></div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={runTtsIndependentTest}
                  disabled={devTestTtsRunning}
                  className="flex-1 py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                >
                  {devTestTtsRunning ? 'Testing TTS...' : 'Test 1: Test TTS'}
                </button>
                <button
                  type="button"
                  onClick={runMicIndependentTest}
                  disabled={devTestMicRunning}
                  className="flex-1 py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
                >
                  {devTestMicRunning ? 'Listening...' : 'Test 2: Test Mic'}
                </button>
              </div>

              {devMicTranscript && (
                <div className="p-2 rounded bg-stone-950 text-emerald-400 text-[11px]">
                  Mic Test: "{devMicTranscript}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
