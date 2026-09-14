import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, MapPin, Sparkles, Volume2, ArrowRight, CheckCircle2, X, ShieldCheck, Globe, Mic, Check, RotateCcw } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS, CRAFT_CATEGORIES } from '../../lib/portalI18n';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { normalizeSpokenDigits } from '../../lib/useVoiceFormAssistant';

interface ArtisanOnboardingModalProps {
  language: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
  onSpeak?: (text: string) => void;
}

export const ArtisanOnboardingModal: React.FC<ArtisanOnboardingModalProps> = ({
  language,
  isOpen,
  onClose,
  onSpeak,
}) => {
  const t = PORTAL_TRANSLATIONS[language];
  const { login } = useAuth();
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Stages: 'phone_input' -> 'phone_confirm' -> 'otp_input'
  const [stage, setStage] = useState<'phone_input' | 'phone_confirm' | 'otp_input'>('phone_input');
  const [phone, setPhone] = useState('9876543210');
  const [detectedPhone, setDetectedPhone] = useState('9876543210');
  const [name, setName] = useState('Rameshwar Rao');
  const [village, setVillage] = useState('Pochampally, Yadadri');
  const [craft, setCraft] = useState('Weaving');
  const [preferredLang, setPreferredLang] = useState<LanguageCode>(language);

  // OTP State
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Voice Assistant state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('Initializing voice...');
  const [heardTranscript, setHeardTranscript] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const hasSpokenPhonePromptRef = useRef(false);
  const hasSpokenConfirmPromptRef = useRef(false);
  const hasSpokenOtpPromptRef = useRef(false);
  const isMountedRef = useRef(true);

  // TTS Helper in selected language
  const speakVoice = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
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
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-IN';

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
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {
      setIsSpeaking(false);
      onEnd?.();
    }
  }, [language]);

  // Stop all active voice audio & speech recognition
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

  // Listen for speech with Web Speech API
  const startListening = useCallback((onResult: (text: string) => void, onEnd?: () => void) => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus('Speech recognition unavailable. Please use manual inputs.');
      return;
    }

    stopAllVoice();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

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
          setVoiceStatus(`✓ Heard: "${transcript}"`);
          onResult(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e?.error);
        if (isMountedRef.current) {
          setIsListening(false);
          setVoiceStatus('❓ Could not hear clearly. You can speak again or type.');
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
    }
  }, [language, stopAllVoice]);

  // Step 1: Prompt mobile number
  const promptMobileNumber = useCallback(() => {
    const promptText =
      language === 'hi'
        ? 'कृपया अपना मोबाइल नंबर बोलें।'
        : language === 'te'
        ? 'దయచేసి మీ మొబైల్ నంబర్ చెప్పండి.'
        : 'Please enter your mobile number.';

    setVoiceStatus('🔊 Asking for mobile number...');
    speakVoice(promptText, () => {
      // Start listening for mobile number
      startListening((spoken) => {
        const parsed = normalizeSpokenDigits(spoken);
        const digitsOnly = parsed.replace(/\D/g, '');
        const clean = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

        if (clean.length >= 10) {
          setDetectedPhone(clean);
          setPhone(clean);
          setStage('phone_confirm');
        } else if (clean.length > 0) {
          setPhone(clean);
          setDetectedPhone(clean);
          setVoiceStatus(`Heard ${clean}. Please provide complete 10-digit mobile number.`);
        }
      });
    });
  }, [language, speakVoice, startListening]);

  // Step 2: Confirm mobile number
  const promptConfirmNumber = useCallback((numToConfirm: string) => {
    const spaced = numToConfirm.split('').join(' ');
    const confirmText =
      language === 'hi'
        ? `मैंने सुना ${numToConfirm}। क्या यह सही है? हाँ या नहीं बोलें।`
        : language === 'te'
        ? `నేను విన్న నంబర్ ${numToConfirm}. ఇది సరైనదేనా? అవును లేదా కాదు అని చెప్పండి.`
        : `I heard ${spaced}. Is this correct? Say Yes or No.`;

    setVoiceStatus(`🔊 Confirming mobile number: ${numToConfirm}`);
    speakVoice(confirmText, () => {
      startListening((answer) => {
        const lower = answer.toLowerCase().trim();
        const isYes =
          lower.includes('yes') ||
          lower.includes('correct') ||
          lower.includes('yeah') ||
          lower.includes('haan') ||
          lower.includes('ha') ||
          lower.includes('sahi') ||
          lower.includes('avunu') ||
          lower.includes('avnu') ||
          lower.includes('ok');

        const isNo =
          lower.includes('no') ||
          lower.includes('nahi') ||
          lower.includes('wrong') ||
          lower.includes('kaadu') ||
          lower.includes('kadu');

        if (isYes) {
          setStage('otp_input');
        } else if (isNo) {
          setStage('phone_input');
          promptMobileNumber();
        } else {
          // If unclear, default to letting user tap Yes or No
          setVoiceStatus(`Heard "${answer}". Please tap Yes or No.`);
        }
      });
    });
  }, [language, speakVoice, startListening, promptMobileNumber]);

  // Step 3: Prompt for OTP
  const promptOtp = useCallback(() => {
    const otpPrompt =
      language === 'hi'
        ? 'कृपया छह अंकों का ओटीपी बोलें।'
        : language === 'te'
        ? 'దయచేసి ఆరు అంకెల ఓటీపీ చెప్పండి.'
        : 'Please enter the OTP.';

    setVoiceStatus('🔊 Asking for OTP...');
    speakVoice(otpPrompt, () => {
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
            handleVerifyOtpWithDigits(newOtp.join(''));
          }
        }
      });
    });
  }, [language, speakVoice, startListening, otp]);

  // Trigger state transitions with voice
  useEffect(() => {
    if (!isOpen) return;
    isMountedRef.current = true;

    if (stage === 'phone_input' && !hasSpokenPhonePromptRef.current) {
      hasSpokenPhonePromptRef.current = true;
      const t = setTimeout(() => {
        promptMobileNumber();
      }, 300);
      return () => clearTimeout(t);
    }

    if (stage === 'phone_confirm' && !hasSpokenConfirmPromptRef.current) {
      hasSpokenConfirmPromptRef.current = true;
      const t = setTimeout(() => {
        promptConfirmNumber(detectedPhone || phone);
      }, 300);
      return () => clearTimeout(t);
    }

    if (stage === 'otp_input' && !hasSpokenOtpPromptRef.current) {
      hasSpokenOtpPromptRef.current = true;
      const t = setTimeout(() => {
        promptOtp();
      }, 300);
      return () => clearTimeout(t);
    }

    return () => {
      stopAllVoice();
    };
  }, [isOpen, stage, promptMobileNumber, promptConfirmNumber, promptOtp, detectedPhone, phone, stopAllVoice]);

  const handleVerifyOtpWithDigits = async (fullOtp: string) => {
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');
    stopAllVoice();

    try {
      const stateMatch = village.split(',').pop()?.trim() || 'Telangana';
      login('seller', {
        id: 'art-01',
        user_id: 'usr-art-01',
        name: name || 'Rameshwar Rao',
        category: craft,
        state: stateMatch,
        district: village || 'Pochampally',
        bio: `Master artisan practicing ${craft} traditions with generational expertise.`,
        experience_years: 25,
        phone: `+91 ${phone}`,
        profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      });

      setTimeout(() => {
        setIsVerifying(false);
        sessionStorage.setItem('open_seller_tutorial', 'true');
        sessionStorage.removeItem('kalatech_seen_seller_tour');
        onClose();
        navigate('/seller');
      }, 600);
    } catch {
      setIsVerifying(false);
      setErrorMsg('Verification failed. Please try again.');
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleFillDemo = () => {
    setName('Rameshwar Rao');
    setPhone('9876543210');
    setDetectedPhone('9876543210');
    setVillage('Pochampally, Yadadri');
    setCraft('Weaving');
    setOtp(['1', '2', '3', '4', '5', '6']);
    setStage('otp_input');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-50 rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-stone-100 px-5 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧑‍🎨</span>
            <div>
              <h3 className="font-black text-lg sm:text-xl leading-tight">
                {language === 'hi'
                  ? 'कारीगर आवाज़ लॉगिन'
                  : language === 'te'
                  ? 'కళాకారుల వాయిస్ లాగిన్'
                  : 'Artisan Voice Login'}
              </h3>
              <p className="text-xs text-amber-200 font-medium">
                {language === 'hi'
                  ? 'बोलकर मोबाइल नंबर और ओटीपी दर्ज करें'
                  : language === 'te'
                  ? 'వాయిస్ ద్వారా మొబైల్ & ఓటీపీ నమోదు'
                  : 'Voice-assisted login • Speak or tap to enter'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAllVoice();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-black/20 text-stone-200 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio Status Header */}
        <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border-b border-amber-300 px-4 py-2.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              {isListening ? (
                <Mic className="w-4 h-4 animate-ping text-white" />
              ) : isSpeaking ? (
                <Volume2 className="w-4 h-4 animate-bounce text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-amber-950 block truncate">
                {voiceStatus}
              </span>
              {heardTranscript && (
                <span className="text-[10px] text-amber-800 font-semibold block truncate">
                  Heard: "{heardTranscript}"
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (stage === 'phone_input') promptMobileNumber();
                else if (stage === 'phone_confirm') promptConfirmNumber(detectedPhone || phone);
                else promptOtp();
              }}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-black shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>🔊 Replay</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ======================================================= */}
          {/* STAGE 1: PHONE INPUT (Voice First + Manual Fallback)   */}
          {/* ======================================================= */}
          {stage === 'phone_input' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 text-center">
                <span className="text-3xl mb-1 block">📱</span>
                <h4 className="text-base sm:text-lg font-black text-stone-900">
                  {language === 'hi'
                    ? 'कृपया अपना 10 अंकों का मोबाइल नंबर बोलें'
                    : language === 'te'
                    ? 'దయచేసి మీ 10 అంకెల మొబైల్ నంబర్ చెప్పండి'
                    : 'Please Speak Your 10-Digit Mobile Number'}
                </h4>
                <p className="text-xs text-stone-600 mt-1 font-medium">
                  {language === 'hi'
                    ? 'उदाहरण: "नौ आठ सात छह पांच चार तीन दो एक शून्य"'
                    : language === 'te'
                    ? 'ఉదాహరణ: "తొమ్మిది ఎనిమిది ఏడు ఆరు ఐదు నాలుగు మూడు రెండు ఒకటి సున్నా"'
                    : 'Say numbers naturally, e.g. "9 8 7 6 5 4 3 2 1 0"'}
                </p>
              </div>

              {/* Mobile Number display and manual input */}
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>📱 Mobile Number</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(clean);
                      setDetectedPhone(clean);
                    }}
                    placeholder="9876543210"
                    className="w-full pl-14 pr-12 py-3.5 bg-white border-2 border-amber-300 focus:border-amber-600 rounded-2xl text-xl font-black text-stone-900 tracking-wider shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={promptMobileNumber}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-amber-700 hover:bg-amber-100'
                    }`}
                    title="Click to speak mobile number"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (phone.length >= 10) {
                    setDetectedPhone(phone);
                    setStage('phone_confirm');
                  } else {
                    setErrorMsg('Please enter or speak a valid 10-digit mobile number');
                  }
                }}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-base text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 active:scale-98 cursor-pointer"
              >
                <span>Continue →</span>
              </button>
            </div>
          )}

          {/* ======================================================= */}
          {/* STAGE 2: PHONE CONFIRM ("I heard 9876543210. Is this correct?") */}
          {/* ======================================================= */}
          {stage === 'phone_confirm' && (
            <div className="space-y-5 text-center">
              <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50/70 border-2 border-amber-400 shadow-sm">
                <span className="text-3xl mb-1 block">📱</span>
                <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider block mb-1">
                  Mobile Number
                </span>
                <div className="text-3xl sm:text-4xl font-black text-stone-950 tracking-wider my-2 font-mono">
                  +91 {detectedPhone || phone}
                </div>
                <p className="text-sm font-bold text-stone-700 mt-2">
                  {language === 'hi'
                    ? `मैंने सुना ${detectedPhone || phone}। क्या यह सही है?`
                    : language === 'te'
                    ? `నేను విన్న నంబర్ ${detectedPhone || phone}. ఇది సరైనదేనా?`
                    : `I heard ${detectedPhone || phone}. Is this correct?`}
                </p>
              </div>

              {/* Yes / No buttons with voice or tap */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopAllVoice();
                    setStage('otp_input');
                  }}
                  className="py-4 px-6 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-98 cursor-pointer"
                >
                  <Check className="w-6 h-6 stroke-[3]" />
                  <span>{language === 'hi' ? 'हाँ (Yes)' : language === 'te' ? 'అవును (Yes)' : '✓ Yes'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopAllVoice();
                    hasSpokenPhonePromptRef.current = false;
                    setStage('phone_input');
                  }}
                  className="py-4 px-6 rounded-2xl font-black text-lg text-stone-800 bg-stone-200 hover:bg-stone-300 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>{language === 'hi' ? 'नहीं (No)' : language === 'te' ? 'కాదు (No)' : '✗ No'}</span>
                </button>
              </div>

              <p className="text-xs text-stone-500 font-medium">
                You can say "Yes" or "No" into your microphone, or tap the button above.
              </p>
            </div>
          )}

          {/* ======================================================= */}
          {/* STAGE 3: OTP INPUT (Voice + Manual fallback)           */}
          {/* ======================================================= */}
          {stage === 'otp_input' && (
            <div className="space-y-4 py-1">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-stone-900 mb-1">
                  {t.otpTitle}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-xs mx-auto">
                  {language === 'hi'
                    ? `मोबाइल नंबर +91 ${phone} पर भेजा गया 6 अंकों का कोड`
                    : language === 'te'
                    ? `మొబైల్ +91 ${phone} కు పంపిన 6 అంకెల కోడ్`
                    : `6-digit verification code sent to +91 ${phone}`}
                </p>
              </div>

              {/* 6-Digit OTP Box */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 my-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black bg-white border-2 border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 rounded-xl text-stone-900 shadow-sm"
                  />
                ))}
              </div>

              {/* Voice Speak OTP trigger */}
              <button
                type="button"
                onClick={promptOtp}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-100/70 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Mic className="w-4 h-4 text-amber-700" />
                <span>
                  {language === 'hi'
                    ? '🎙️ बोलकर 6 अंकों का ओटीपी दर्ज करें'
                    : language === 'te'
                    ? '🎙️ ఓటీపీ చెప్పి నమోదు చేయండి'
                    : '🎙️ Speak 6-Digit OTP to Fill'}
                </span>
              </button>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleVerifyOtpWithDigits(otp.join(''))}
                  disabled={isVerifying}
                  className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-98 cursor-pointer"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying OTP...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{t.btnVerifyEnter}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    hasSpokenPhonePromptRef.current = false;
                    hasSpokenConfirmPromptRef.current = false;
                    setStage('phone_input');
                  }}
                  className="w-full py-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-all text-center cursor-pointer"
                >
                  ← Change Mobile Number
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Demo Helper Footer */}
        <div className="bg-stone-100 px-5 py-2.5 border-t border-stone-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-stone-500 font-medium">Quick Evaluator Fill:</span>
          <button
            onClick={handleFillDemo}
            className="text-amber-800 hover:text-amber-950 font-bold underline text-xs cursor-pointer"
          >
            {t.autoFillDemo} (9876543210 • 123456)
          </button>
        </div>
      </div>
    </div>
  );
};
