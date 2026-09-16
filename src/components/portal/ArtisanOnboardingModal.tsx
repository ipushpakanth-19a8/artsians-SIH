import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Sparkles, Volume2, ArrowRight, CheckCircle2, X, ShieldCheck, Mic, Check, RotateCcw, Edit3, KeyRound, Palette, AlertCircle } from 'lucide-react';
import { LanguageCode } from '../../types';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { normalizeSpokenDigits } from '../../lib/useVoiceFormAssistant';
import { getRecognitionLocale, getSpeechLocale } from '../../config/languages';
import { getVoicePrompts } from '../../config/voicePrompts';

interface ArtisanOnboardingModalProps {
  language: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
  onSpeak?: (text: string) => void;
}

// Stages of the new seller login & initial profile flow
type FlowStep =
  | 'phone_input'
  | 'phone_confirm'
  | 'otp_input'
  | 'name_voice'
  | 'craft_voice'
  | 'final_confirm';

// Helper to clean spoken names (remove conversational sentence starters)
export function extractCleanName(raw: string): string {
  let cleaned = raw.trim();
  // English prefixes
  cleaned = cleaned.replace(/^(my name is|i am called|this is|i am|name is)\s+/i, '');
  // Hindi prefixes & suffixes
  cleaned = cleaned.replace(/^(मेरा नाम|नाम है|मैं हूँ|मैं)\s+/i, '');
  cleaned = cleaned.replace(/\s+(है|हूँ)$/i, '');
  // Telugu prefixes & suffixes
  cleaned = cleaned.replace(/^(నా పేరు|నా పేరు ఏమిటంటే|పేరు)\s+/i, '');
  cleaned = cleaned.replace(/\s+(అండి|గారు)$/i, '');
  // Remove punctuation
  cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  return cleaned.trim();
}

// Helper to clean spoken craft names
export function extractCleanCraft(raw: string): string {
  let cleaned = raw.trim();
  // English prefixes
  cleaned = cleaned.replace(/^(i do|my work is|my handicraft is|we make|i make|handicraft work is|it is|i practice)\s+/i, '');
  // Hindi prefixes & suffixes
  cleaned = cleaned.replace(/^(मेरा काम|हस्तशिल्प कार्य|हम बनाते हैं|काम है|मैं करता हूँ)\s+/i, '');
  cleaned = cleaned.replace(/\s+(का काम|करता हूँ|करती हूँ|है)$/i, '');
  // Telugu prefixes & suffixes
  cleaned = cleaned.replace(/^(నా పని|మా హస్తకళ పని|మేము చేసే పని|పని)\s+/i, '');
  cleaned = cleaned.replace(/\s+(చేస్తాను|చేస్తాము|పని)$/i, '');
  // Remove punctuation
  cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  return cleaned.trim();
}

// Affirmative / Negative detection
function isAffirmative(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    lower.includes('yes') ||
    lower.includes('confirm') ||
    lower.includes('correct') ||
    lower.includes('yeah') ||
    lower.includes('yup') ||
    lower.includes('haan') ||
    lower.includes('ha') ||
    lower.includes('sahi') ||
    lower.includes('theek') ||
    lower.includes('avunu') ||
    lower.includes('avnu') ||
    lower.includes('sare') ||
    lower.includes('sarle')
  );
}

function isNegative(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    lower.includes('no') ||
    lower.includes('nope') ||
    lower.includes('nahi') ||
    lower.includes('galat') ||
    lower.includes('wrong') ||
    lower.includes('kaadu') ||
    lower.includes('kadu') ||
    lower.includes('tappu')
  );
}

export const ArtisanOnboardingModal: React.FC<ArtisanOnboardingModalProps> = ({
  language,
  isOpen,
  onClose,
}) => {
  const { sendOtp, verifyOtp, saveSellerProfile } = useAuth();
  const { selectedState, selectedStateCode, languageCode } = useLanguage();
  const navigate = useNavigate();

  // Primary Step State
  const [step, setStep] = useState<FlowStep>('phone_input');

  // Profile Data
  const [phone, setPhone] = useState('');
  const [detectedPhone, setDetectedPhone] = useState('');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [sellerName, setSellerName] = useState('');
  const [handicraftWorkName, setHandicraftWorkName] = useState('');

  // Editing state toggles for manual editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingCraft, setIsEditingCraft] = useState(false);

  // Status & Voice Feedback States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('Ready');
  const [heardTranscript, setHeardTranscript] = useState<string>('');
  const [voiceAvailable, setVoiceAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Guards to prevent duplicate audio triggers across React re-renders
  const lastSpokenStepRef = useRef<string>('');
  const isMountedRef = useRef(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopAllVoice();
    };
  }, []);

  // Text-To-Speech (TTS) Engine
  const speakVoice = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setVoiceAvailable(false);
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      setIsSpeaking(true);
      setVoiceStatus('🔊 Speaking...');

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
      console.log(`[VOICE] Speaking in ${language}, Speech Locale: ${utterance.lang}, Voice: ${utterance.voice?.name || 'Default'}`);

      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        if (isMountedRef.current) setIsSpeaking(true);
      };

      utterance.onend = () => {
        if (isMountedRef.current) {
          setIsSpeaking(false);
          onEnd?.();
        }
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        if (isMountedRef.current) {
          setIsSpeaking(false);
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

  // Stop All Active Speech & Listening
  const stopAllVoice = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setIsSpeaking(false);
    setIsListening(false);
  }, []);

  // Speech Recognition (STT) Engine
  const startListening = useCallback(
    (onResult: (text: string) => void, onEnd?: () => void) => {
      if (typeof window === 'undefined') {
        setVoiceAvailable(false);
        return;
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceAvailable(false);
        setVoiceStatus('Voice input is unavailable. You can enter the details manually.');
        onEnd?.();
        return;
      }

      stopAllVoice();

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = getRecognitionLocale(language);
        console.log(`[VOICE] Language: ${language}, Recognition Locale: ${recognition.lang}`);

        recognition.onstart = () => {
          if (isMountedRef.current) {
            setIsListening(true);
            setVoiceStatus('🎙️ Listening...');
          }
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          if (isMountedRef.current) {
            setHeardTranscript(transcript);
            setVoiceStatus(`✓ Got it: "${transcript}"`);
            onResult(transcript);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e?.error);
          if (isMountedRef.current) {
            setIsListening(false);
            if (e?.error === 'not-allowed') {
              setVoiceAvailable(false);
              setVoiceStatus('Voice input is unavailable. You can enter the details manually.');
            } else {
              setVoiceStatus('❓ Please repeat');
            }
            onEnd?.();
          }
        };

        recognition.onend = () => {
          if (isMountedRef.current) {
            setIsListening(false);
            onEnd?.();
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
        setIsListening(false);
        onEnd?.();
      }
    },
    [language, stopAllVoice]
  );

  // =========================================================================
  // STEP 1: PHONE NUMBER
  // =========================================================================
  const triggerPhoneInput = useCallback(() => {
    const prompts = getVoicePrompts(language);
    setVoiceStatus('🔊 Asking for mobile number...');
    speakVoice(prompts.askPhone, () => {
      startListening((spoken) => {
        const parsed = normalizeSpokenDigits(spoken);
        const clean = parsed.replace(/\D/g, '').slice(-10);

        if (clean.length === 10) {
          setDetectedPhone(clean);
          setPhone(clean);
          lastSpokenStepRef.current = ''; // Allow confirm step to run
          setStep('phone_confirm');
        } else if (clean.length > 0) {
          setPhone(clean);
          setDetectedPhone(clean);
          speakVoice(prompts.repeatPhone, () => {
            triggerPhoneInput();
          });
        } else {
          // Empty speech: never skip question
          speakVoice(prompts.repeatPhone, () => {
            triggerPhoneInput();
          });
        }
      });
    });
  }, [language, speakVoice, startListening]);

  // =========================================================================
  // STEP 1.5: PHONE NUMBER CONFIRMATION
  // =========================================================================
  const triggerPhoneConfirm = useCallback(
    (num: string) => {
      const prompts = getVoicePrompts(language);
      const spaced = num.split('').join(' ');
      const confirmText = prompts.confirmPhone(spaced);

      setVoiceStatus(`🔊 Confirming mobile number: ${num}`);
      speakVoice(confirmText, () => {
        startListening((answer) => {
          if (isAffirmative(answer)) {
            handlePhoneConfirmed(num);
          } else if (isNegative(answer)) {
            setStep('phone_input');
            lastSpokenStepRef.current = '';
          } else {
            setVoiceStatus(`Heard "${answer}". Please tap Yes or No.`);
          }
        });
      });
    },
    [language, speakVoice, startListening]
  );

  const handlePhoneConfirmed = async (targetPhone: string) => {
    stopAllVoice();
    setLoading(true);
    setErrorMsg('');
    const clean = targetPhone.replace(/\D/g, '').slice(-10);
    const res = await sendOtp(clean, 'seller');
    setLoading(false);

    if (res.success) {
      setPhone(clean);
      setOtp(['1', '2', '3', '4', '5', '6']);
      lastSpokenStepRef.current = '';
      setStep('otp_input');
    } else {
      setErrorMsg(res.error || 'Failed to send OTP.');
    }
  };

  // =========================================================================
  // STEP 2: OTP VERIFICATION
  // =========================================================================
  const triggerOtpInput = useCallback(() => {
    const prompts = getVoicePrompts(language);

    setVoiceStatus('🔊 Asking for OTP...');
    speakVoice(prompts.askOtp, () => {
      startListening((spokenOtp) => {
        const parsed = normalizeSpokenDigits(spokenOtp);
        const digits = parsed.replace(/\D/g, '').slice(0, 6);
        if (digits.length > 0) {
          const newOtp = [...otp];
          for (let i = 0; i < 6; i++) {
            if (digits[i]) newOtp[i] = digits[i];
          }
          setOtp(newOtp);
          if (digits.length === 6) {
            handleVerifyOtpDigits(newOtp.join(''));
          }
        } else {
          // Empty speech: do not skip
          speakVoice(prompts.repeatOtp, () => {
            triggerOtpInput();
          });
        }
      });
    });
  }, [language, speakVoice, startListening, otp]);

  const handleVerifyOtpDigits = async (otpCode: string) => {
    if (otpCode.length < 4) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    stopAllVoice();

    const clean = phone.replace(/\D/g, '').slice(-10);
    const res = await verifyOtp({
      phone: clean,
      otp: otpCode,
      role: 'seller',
    });
    setLoading(false);

    if (res.success) {
      // If returning user already has a name & craft, pre-populate
      if (res.user?.name && res.user.name !== 'Artisan Craftsperson') {
        setSellerName(res.user.name);
      }
      if (res.user?.craft_type && res.user.craft_type !== 'Weaving') {
        setHandicraftWorkName(res.user.craft_type);
      } else if (res.artisan?.category) {
        setHandicraftWorkName(res.artisan.category);
      }

      lastSpokenStepRef.current = '';
      setStep('name_voice');
    } else {
      setErrorMsg(res.error || 'Invalid OTP code. Please enter 123456.');
    }
  };

  // =========================================================================
  // STEP 3: SELLER NAME — VOICE ENTRY
  // =========================================================================
  const triggerNameVoice = useCallback(() => {
    const prompts = getVoicePrompts(language);

    setVoiceStatus('🔊 Asking for seller name...');
    speakVoice(prompts.askName, () => {
      startListening((spokenName) => {
        const clean = extractCleanName(spokenName);
        if (clean.length >= 2) {
          setSellerName(clean);
          setVoiceStatus(`✓ Got it: "${clean}"`);
        } else {
          // Empty or unclear speech: stay on same question
          speakVoice(prompts.repeatName, () => {
            triggerNameVoice();
          });
        }
      });
    });
  }, [language, speakVoice, startListening]);

  const handleConfirmName = () => {
    if (!sellerName.trim()) {
      setErrorMsg('Please enter or speak your name first.');
      return;
    }
    setErrorMsg('');
    stopAllVoice();
    setIsEditingName(false);
    lastSpokenStepRef.current = '';
    setStep('craft_voice');
  };

  // =========================================================================
  // STEP 4: HANDICRAFT WORK NAME — VOICE ENTRY
  // =========================================================================
  const triggerCraftVoice = useCallback(() => {
    const prompts = getVoicePrompts(language);

    setVoiceStatus('🔊 Asking for handicraft work name...');
    speakVoice(prompts.askCraft, () => {
      startListening((spokenCraft) => {
        const clean = extractCleanCraft(spokenCraft);
        if (clean.length >= 2) {
          setHandicraftWorkName(clean);
          setVoiceStatus(`✓ Got it: "${clean}"`);
        } else {
          // Empty or unclear speech: stay on same question
          speakVoice(prompts.repeatCraft, () => {
            triggerCraftVoice();
          });
        }
      });
    });
  }, [language, speakVoice, startListening]);

  const handleConfirmCraft = () => {
    if (!handicraftWorkName.trim()) {
      setErrorMsg('Please enter or speak your craft work name first.');
      return;
    }
    setErrorMsg('');
    stopAllVoice();
    setIsEditingCraft(false);
    lastSpokenStepRef.current = '';
    setStep('final_confirm');
  };

  // =========================================================================
  // STEP 5: FINAL PROFILE CONFIRMATION & SAVE
  // =========================================================================
  const triggerFinalConfirm = useCallback(() => {
    const prompts = getVoicePrompts(language);
    const summaryPrompt = prompts.confirmSummary(
      sellerName || 'Artisan',
      handicraftWorkName || 'Handicrafts'
    );

    setVoiceStatus('🔊 Confirming seller profile details...');
    speakVoice(summaryPrompt, () => {
      startListening((answer) => {
        if (isAffirmative(answer)) {
          handleSaveAndContinue();
        } else if (isNegative(answer)) {
          setVoiceStatus('You can edit either field below.');
        }
      });
    });
  }, [language, sellerName, handicraftWorkName, speakVoice, startListening]);

  const handleSaveAndContinue = async () => {
    stopAllVoice();
    setLoading(true);
    setErrorMsg('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const res = await saveSellerProfile({
      phoneNumber: cleanPhone,
      sellerName: sellerName.trim() || 'Master Craftsperson',
      handicraftWorkName: handicraftWorkName.trim() || 'Traditional Handicrafts',
      preferredLanguage: language,
      preferredLanguageCode: languageCode,
      state: selectedState,
      stateCode: selectedStateCode,
    });
    setLoading(false);

    if (res.success) {
      sessionStorage.setItem('open_seller_tutorial', 'true');
      sessionStorage.removeItem('ShilpSetu_seen_seller_tour');
      onClose();
      navigate('/seller');
    } else {
      setErrorMsg(res.error || 'Failed to save profile. Please try again.');
    }
  };

  // =========================================================================
  // AUTOMATIC VOICE TRIGGERS GUARDED AGAINST RE-RENDERS
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

    if (step === 'phone_input' && lastSpokenStepRef.current !== 'phone_input') {
      lastSpokenStepRef.current = 'phone_input';
      const timer = setTimeout(() => triggerPhoneInput(), 400);
      return () => clearTimeout(timer);
    }

    if (step === 'phone_confirm' && lastSpokenStepRef.current !== 'phone_confirm') {
      lastSpokenStepRef.current = 'phone_confirm';
      const timer = setTimeout(() => triggerPhoneConfirm(detectedPhone || phone), 400);
      return () => clearTimeout(timer);
    }

    if (step === 'otp_input' && lastSpokenStepRef.current !== 'otp_input') {
      lastSpokenStepRef.current = 'otp_input';
      const timer = setTimeout(() => triggerOtpInput(), 400);
      return () => clearTimeout(timer);
    }

    if (step === 'name_voice' && lastSpokenStepRef.current !== 'name_voice') {
      lastSpokenStepRef.current = 'name_voice';
      const timer = setTimeout(() => triggerNameVoice(), 400);
      return () => clearTimeout(timer);
    }

    if (step === 'craft_voice' && lastSpokenStepRef.current !== 'craft_voice') {
      lastSpokenStepRef.current = 'craft_voice';
      const timer = setTimeout(() => triggerCraftVoice(), 400);
      return () => clearTimeout(timer);
    }

    if (step === 'final_confirm' && lastSpokenStepRef.current !== 'final_confirm') {
      lastSpokenStepRef.current = 'final_confirm';
      const timer = setTimeout(() => triggerFinalConfirm(), 400);
      return () => clearTimeout(timer);
    }
  }, [
    isOpen,
    step,
    detectedPhone,
    phone,
    triggerPhoneInput,
    triggerPhoneConfirm,
    triggerOtpInput,
    triggerNameVoice,
    triggerCraftVoice,
    triggerFinalConfirm,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-stone-50 rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header with trilingual title */}
        <div className="bg-gradient-to-r from-amber-800 via-[#9c4124] to-[#83341b] px-5 py-4 sm:px-6 sm:py-5 text-white relative shrink-0 shadow-sm">
          <button
            onClick={() => {
              stopAllVoice();
              onClose();
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-['Rozha_One',serif] tracking-tight">
                {language === 'te'
                  ? 'కళాకారుల లాగిన్ & ప్రొఫైల్'
                  : language === 'hi'
                  ? 'कारीगर लॉगिन एवं प्रोफ़ाइल'
                  : 'Artisan Login & Profile Setup'}
              </h2>
              <p className="text-amber-100 text-xs font-medium">
                {language === 'te'
                  ? 'ధ్వని-ఆధారిత త్వరిత నమోదు'
                  : language === 'hi'
                  ? 'आवाज़-आधारित त्वरित सत्यापन'
                  : 'Voice-First Passwordless Studio Access'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Voice Assistant Visual State Indicator */}
          <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  isListening
                    ? 'bg-red-500 animate-ping'
                    : isSpeaking
                    ? 'bg-amber-600 animate-pulse'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="text-xs font-bold text-stone-800 truncate">
                {voiceStatus}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                {language.toUpperCase()}
              </span>
            </div>
          </div>

          {!voiceAvailable && (
            <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl text-xs text-stone-700 font-medium">
              Voice input is unavailable. You can enter the details manually below.
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: PHONE NUMBER INPUT                                                */}
          {/* ========================================================================= */}
          {step === 'phone_input' && (
            <div className="space-y-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#9c4124]" />
                    <span>
                      {language === 'te'
                        ? '📱 మొబైల్ నంబర్'
                        : language === 'hi'
                        ? '📱 मोबाइल नंबर'
                        : '📱 Mobile Number'}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      lastSpokenStepRef.current = '';
                      triggerPhoneInput();
                    }}
                    className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-[#9c4124]'
                    }`}
                    title="Speak Mobile Number"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-4 pr-10 py-3 bg-stone-50 border-2 border-stone-300 focus:border-[#9c4124] rounded-xl text-base font-black text-stone-900 focus:outline-none"
                  />
                  {phone.length === 10 && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                <p className="text-xs text-stone-500 font-medium">
                  {language === 'te'
                    ? 'ధ్వని లేదా మాన్యువల్ ద్వారా 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి'
                    : language === 'hi'
                    ? 'बोलकर या टाइप करके अपना 10 अंकों का मोबाइल नंबर दर्ज करें'
                    : 'Speak your number or type 10 digits.'}
                </p>

                {/* Quick Demo Test Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPhone('9876543210');
                      setDetectedPhone('9876543210');
                      lastSpokenStepRef.current = '';
                      setStep('phone_confirm');
                    }}
                    className="text-xs font-bold text-[#9c4124] bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    ⚡ Demo: 9876543210
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhone('9848012345');
                      setDetectedPhone('9848012345');
                      lastSpokenStepRef.current = '';
                      setStep('phone_confirm');
                    }}
                    className="text-xs font-bold text-[#9c4124] bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    ⚡ Demo: 9848012345 (Rameshwar)
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={phone.replace(/\D/g, '').length !== 10 || loading}
                onClick={() => {
                  const clean = phone.replace(/\D/g, '').slice(-10);
                  setDetectedPhone(clean);
                  lastSpokenStepRef.current = '';
                  setStep('phone_confirm');
                }}
                className="w-full py-3.5 rounded-xl bg-[#9c4124] hover:bg-[#83341b] text-white font-black text-sm transition-all shadow-md shadow-[#9c4124]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {language === 'te'
                    ? 'కొనసాగించండి'
                    : language === 'hi'
                    ? 'आगे बढ़ें'
                    : 'Continue'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1.5: CONFIRM DETECTED NUMBER                                         */}
          {/* ========================================================================= */}
          {step === 'phone_confirm' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-amber-200 text-center space-y-3">
                <span className="text-xs font-extrabold uppercase text-amber-800 tracking-wider">
                  {language === 'te'
                    ? 'ధృవీకరించండి'
                    : language === 'hi'
                    ? 'पुष्टि करें'
                    : 'Confirm Number'}
                </span>
                <p className="text-sm font-semibold text-stone-700">
                  {language === 'te'
                    ? `నేను విన్న నంబర్:`
                    : language === 'hi'
                    ? `मैंने यह नंबर सुना:`
                    : `I heard:`}
                </p>
                <div className="text-2xl font-mono font-black text-[#9c4124] tracking-wider">
                  +91 {detectedPhone || phone}
                </div>
                <p className="text-xs font-bold text-stone-600">
                  {language === 'te'
                    ? 'ఇది సరైనదేనా?'
                    : language === 'hi'
                    ? 'क्या यह सही है?'
                    : 'Is this correct?'}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handlePhoneConfirmed(detectedPhone || phone)}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {language === 'te' ? '✓ అవును' : language === 'hi' ? '✓ हाँ' : '✓ Yes'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone_input');
                      lastSpokenStepRef.current = '';
                    }}
                    className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>
                      {language === 'te' ? '✗ కాదు' : language === 'hi' ? '✗ नहीं' : '✗ No'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: OTP VERIFICATION                                                  */}
          {/* ========================================================================= */}
          {step === 'otp_input' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#9c4124]" />
                    <span>
                      {language === 'te'
                        ? 'ఆరు అంకెల ఓటీపీని నమోదు చేయండి'
                        : language === 'hi'
                        ? '6 अंकों का ओटीपी दर्ज करें'
                        : 'Enter OTP'}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      lastSpokenStepRef.current = '';
                      triggerOtpInput();
                    }}
                    className={`p-1.5 rounded-lg cursor-pointer ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-[#9c4124]'
                    }`}
                    title="Speak OTP"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900">
                  <span>Demo Code: <strong className="font-mono text-emerald-800 text-sm">123456</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
                    className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>

                {/* 6 Digit Boxes */}
                <div className="flex justify-between gap-1.5 pt-1">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const newOtp = [...otp];
                        newOtp[i] = val;
                        setOtp(newOtp);
                        if (val && i < 5) {
                          document.getElementById(`otp-${i + 1}`)?.focus();
                        }
                      }}
                      className="w-11 h-12 text-center text-xl font-black font-mono bg-stone-50 border-2 border-stone-300 focus:border-[#9c4124] rounded-xl focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={otp.join('').length !== 6 || loading}
                onClick={() => handleVerifyOtpDigits(otp.join(''))}
                className="w-full py-3.5 rounded-xl bg-[#9c4124] hover:bg-[#83341b] text-white font-black text-sm transition-all shadow-md shadow-[#9c4124]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {language === 'te'
                        ? 'ఓటీపీని ధృవీకరించండి'
                        : language === 'hi'
                        ? 'ओटीपी सत्यापित करें'
                        : 'Verify OTP'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SELLER NAME — VOICE ENTRY                                         */}
          {/* ========================================================================= */}
          {step === 'name_voice' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#9c4124]" />
                    <span>
                      {language === 'te'
                        ? '👤 కళాకారుడి పేరు'
                        : language === 'hi'
                        ? '👤 कारीगर का नाम'
                        : '👤 Seller Name'}
                    </span>
                  </label>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-[#9c4124]">
                    Voice Input
                  </span>
                </div>

                {isEditingName ? (
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="Enter seller name"
                    className="w-full px-3 py-2.5 border-2 border-[#9c4124] rounded-xl text-base font-black text-stone-900 focus:outline-none"
                  />
                ) : (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                    <p className="text-lg font-black text-stone-900 min-h-[28px]">
                      {sellerName || (
                        <span className="text-stone-400 font-medium text-sm">
                          {language === 'te' ? 'మీ పేరు కోసం వింటున్నాము...' : language === 'hi' ? 'नाम के लिए सुन रहे हैं...' : 'Listening for your name...'}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Confirm, Edit, Speak Again Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmName}
                    disabled={!sellerName.trim()}
                    className="flex-1 min-w-[100px] py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {language === 'te' ? '✓ నిర్ధారించండి' : language === 'hi' ? '✓ पुष्टि करें' : '✓ Confirm'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingName(!isEditingName)}
                    className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingName ? 'Done' : '✏️ Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      lastSpokenStepRef.current = '';
                      triggerNameVoice();
                    }}
                    className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-[#9c4124] border border-amber-300 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {language === 'te' ? '🔄 మళ్ళీ చెప్పండి' : language === 'hi' ? '🔄 दोबारा बोलें' : '🔄 Speak Again'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: HANDICRAFT WORK NAME — VOICE ENTRY                                */}
          {/* ========================================================================= */}
          {step === 'craft_voice' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-[#9c4124]" />
                    <span>
                      {language === 'te'
                        ? '🎨 హస్తకళ పని'
                        : language === 'hi'
                        ? '🎨 हस्तशिल्प कार्य'
                        : '🎨 Handicraft Work'}
                    </span>
                  </label>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-[#9c4124]">
                    Voice Input
                  </span>
                </div>

                {isEditingCraft ? (
                  <input
                    type="text"
                    value={handicraftWorkName}
                    onChange={(e) => setHandicraftWorkName(e.target.value)}
                    placeholder="e.g. Pochampally handloom weaving"
                    className="w-full px-3 py-2.5 border-2 border-[#9c4124] rounded-xl text-base font-black text-stone-900 focus:outline-none"
                  />
                ) : (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                    <p className="text-lg font-black text-stone-900 min-h-[28px]">
                      {handicraftWorkName || (
                        <span className="text-stone-400 font-medium text-sm">
                          {language === 'te' ? 'మీ పని పేరు కోసం వింటున్నాము...' : language === 'hi' ? 'शिल्प कार्य के लिए सुन रहे हैं...' : 'Listening for your craft name...'}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Pochampally Weaving', 'Hand Embroidery', 'Blue Pottery', 'Wood Carving', 'Terracotta'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setHandicraftWorkName(c)}
                      className="text-[11px] font-bold px-2 py-1 bg-stone-100 hover:bg-amber-100 text-stone-700 rounded-lg cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Confirm, Edit, Speak Again Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmCraft}
                    disabled={!handicraftWorkName.trim()}
                    className="flex-1 min-w-[100px] py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {language === 'te' ? '✓ నిర్ధారించండి' : language === 'hi' ? '✓ पुष्टि करें' : '✓ Confirm'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingCraft(!isEditingCraft)}
                    className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingCraft ? 'Done' : '✏️ Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      lastSpokenStepRef.current = '';
                      triggerCraftVoice();
                    }}
                    className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-[#9c4124] border border-amber-300 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {language === 'te' ? '🔄 మళ్ళీ చెప్పండి' : language === 'hi' ? '🔄 दोबारा बोलें' : '🔄 Speak Again'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: FINAL SELLER PROFILE CONFIRMATION & CONTINUE                      */}
          {/* ========================================================================= */}
          {step === 'final_confirm' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-400 shadow-sm space-y-4">
                <div className="text-center pb-2 border-b border-stone-100">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block mb-1">
                    {language === 'te' ? 'కళాకారుల ప్రొఫైల్' : language === 'hi' ? 'कारीगर प्रोफ़ाइल' : 'SELLER PROFILE'}
                  </span>
                  <p className="text-xs font-medium text-stone-500">
                    {language === 'te'
                      ? 'మీ వివరాలు సేవ్ చేసి స్టూడియోలోకి వెళ్లడానికి నిర్ధారించండి'
                      : language === 'hi'
                      ? 'पुष्टि करें और सीधे अपने कारीगर पोर्टल में प्रवेश करें'
                      : 'Confirm details to open your Artisan Seller Portal'}
                  </p>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                    <span className="text-stone-500 font-bold flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#9c4124]" />
                      <span>{language === 'te' ? 'కళాకారుడి పేరు:' : language === 'hi' ? 'कारीगर का नाम:' : 'Seller Name:'}</span>
                    </span>
                    <strong className="text-stone-900 font-black">{sellerName}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                    <span className="text-stone-500 font-bold flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#9c4124]" />
                      <span>{language === 'te' ? 'హస్తకళ పని:' : language === 'hi' ? 'हस्तशिल्प कार्य:' : 'Handicraft Work:'}</span>
                    </span>
                    <strong className="text-stone-900 font-black">{handicraftWorkName}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                    <span className="text-stone-500 font-bold flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-[#9c4124]" />
                      <span>{language === 'te' ? 'మొబైల్ నంబర్:' : language === 'hi' ? 'मोबाइल नंबर:' : 'Phone Number:'}</span>
                    </span>
                    <strong className="text-stone-900 font-mono font-black">+91 {phone}</strong>
                  </div>
                </div>

                {/* Final Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSaveAndContinue}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>
                          {language === 'te'
                            ? '✓ నిర్ధారించి కొనసాగించండి'
                            : language === 'hi'
                            ? '✓ पुष्टि करें और आगे बढ़ें'
                            : '✓ Confirm & Continue'}
                        </span>
                      </>
                    )}
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('name_voice');
                        lastSpokenStepRef.current = '';
                      }}
                      className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>✏️ Edit Name</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('craft_voice');
                        lastSpokenStepRef.current = '';
                      }}
                      className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>✏️ Edit Craft</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        lastSpokenStepRef.current = '';
                        triggerFinalConfirm();
                      }}
                      className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-[#9c4124] border border-amber-300 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>🔄 Speak</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ethical Trust Footnote */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Artisan Direct Setup
            </span>
            <span className="text-[#9c4124] font-bold">ShilpSetu • SIH</span>
          </div>
        </div>
      </div>
    </div>
  );
};
