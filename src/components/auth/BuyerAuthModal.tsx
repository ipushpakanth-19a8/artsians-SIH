import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Sparkles, AlertCircle, ArrowRight, ShieldCheck, HelpCircle, Mic, CheckCircle2, RotateCcw, KeyRound, Edit3 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { useVoiceFormAssistant, VoiceFormFieldConfig } from '../../lib/useVoiceFormAssistant';
import { VoiceAssistBanner } from '../common/VoiceAssistBanner';
import { LanguageSelectionModal } from '../common/LanguageSelectionModal';
import { LanguageCode } from '../../types';

interface BuyerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function BuyerAuthModal({ isOpen, onClose, defaultTab = 'signin' }: BuyerAuthModalProps) {
  const { language, setLanguage } = useLanguage();
  const { sendOtp, verifyOtp, login } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('Karnataka');
  const [address, setAddress] = useState('');

  // Resend Countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Voice Form Configuration
  const phoneFields: VoiceFormFieldConfig[] = useMemo(() => [
    {
      key: 'phone',
      label: language === 'hi' ? 'खरीदार मोबाइल नंबर' : language === 'te' ? 'కొనుగోలుదారు మొబైల్' : 'Mobile Number',
      type: 'tel',
      prompts: {
        en: 'Please speak your registered 10-digit mobile number.',
        hi: 'कृपया अपना पंजीकृत 10 अंकों का मोबाइल नंबर बोलें।',
        te: 'దయచేసి మీ 10 అంకెల మొబైల్ నంబర్ చెప్పండి.',
      },
      sampleFallback: {
        en: '9444077889',
        hi: '9444077889',
        te: '9444077889',
      },
    },
  ], [language]);

  const otpFields: VoiceFormFieldConfig[] = useMemo(() => [
    {
      key: 'otp',
      label: language === 'hi' ? '6-अंकों का OTP' : language === 'te' ? '6 అంకెల OTP' : '6-Digit OTP',
      type: 'text',
      prompts: {
        en: 'Please speak the 6 digit OTP. For demo, speak 123456.',
        hi: 'कृपया 6 अंकों का ओटीपी बोलें। डेमो के लिए 123456 बोलें।',
        te: 'దయచేసి 6 అంకెల ఓటీపీని చెప్పండి. డెమో కోసం 123456 చెప్పండి.',
      },
      sampleFallback: {
        en: '123456',
        hi: '123456',
        te: '123456',
      },
    },
  ], [language]);

  const signUpFields: VoiceFormFieldConfig[] = useMemo(() => [
    {
      key: 'fullName',
      label: language === 'hi' ? 'पूरा नाम' : language === 'te' ? 'పూర్తి పేరు' : 'Full Name',
      type: 'text',
      prompts: {
        en: 'Please speak your full name.',
        hi: 'कृपया अपना पूरा नाम बोलें।',
        te: 'దయచేసి మీ పూర్తి పేరు చెప్పండి.',
      },
      sampleFallback: {
        en: 'Anita Deshmukh',
        hi: 'अनिता देशमुख',
        te: 'అనితా దేశ్ముఖ్',
      },
    },
    {
      key: 'phone',
      label: language === 'hi' ? 'मोबाइल नंबर' : language === 'te' ? 'మొబైల్ నంబర్' : 'Mobile Number',
      type: 'tel',
      prompts: {
        en: 'Please speak your 10 digit mobile number.',
        hi: 'कृपया अपना 10 अंकों का मोबाइल नंबर बोलें।',
        te: 'దయచేసి మీ 10 అంకెల మొబైల్ నంబర్ చెప్పండి.',
      },
      sampleFallback: {
        en: '9444077889',
        hi: '9444077889',
        te: '9444077889',
      },
    },
    {
      key: 'location',
      label: language === 'hi' ? 'शहर / जिला' : language === 'te' ? 'నగరం' : 'City',
      type: 'text',
      prompts: {
        en: 'Please speak your city name.',
        hi: 'कृपया अपने शहर का नाम बोलें।',
        te: 'దయచేసి మీ నగరం పేరు చెప్పండి.',
      },
      sampleFallback: {
        en: 'Bengaluru',
        hi: 'बेंगलुरु',
        te: 'బెంగళూరు',
      },
    },
  ], [language]);

  const activeFields = step === 'otp' ? otpFields : tab === 'signin' ? phoneFields : signUpFields;

  const handleFieldFilled = (key: string, value: string) => {
    if (key === 'phone') setPhone(value.replace(/[^0-9]/g, ''));
    if (key === 'otp') setOtp(value.replace(/[^0-9]/g, ''));
    if (key === 'fullName') setFullName(value);
    if (key === 'location') setLocation(value);
  };

  const voice = useVoiceFormAssistant({
    language,
    fields: activeFields,
    onFieldFilled: handleFieldFilled,
  });

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError(t.validMobileRequired);
      return;
    }

    if (tab === 'signup' && (!fullName.trim() || fullName.trim().length < 2)) {
      setError(t.nameRequired);
      return;
    }

    setLoading(true);
    const res = await sendOtp(cleanPhone, 'buyer');
    setLoading(false);

    if (res.success) {
      setStep('otp');
      setResendCooldown(30);
      setOtp('123456'); // Pre-fill demo OTP for fast tester validation
    } else {
      setError(res.error || 'Failed to send OTP. Please check your mobile number.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanOtp = otp.replace(/[^0-9]/g, '');

    if (cleanOtp.length < 4) {
      setError('Please enter the 6-digit OTP code (Demo: 123456)');
      return;
    }

    setLoading(true);
    const res = await verifyOtp({
      phone: cleanPhone,
      otp: cleanOtp,
      role: 'buyer',
      name: fullName.trim() || undefined,
      location: location.trim() || undefined,
      state,
      business_name: address.trim() || undefined,
    });
    setLoading(false);

    if (res.success) {
      voice.stopAssistant();
      setShowLanguageModal(true);
    } else {
      setError(res.error || 'Invalid OTP code. Please enter 123456.');
    }
  };

  const handleLanguageChosen = (chosenLang: LanguageCode) => {
    setLanguage(chosenLang);
    sessionStorage.setItem('open_buyer_tutorial', 'true');
    sessionStorage.removeItem('ShilpSetu_seen_buyer_tour');
    setShowLanguageModal(false);
    onClose();
    navigate('/buyer');
  };

  const handleQuickDemoFill = async () => {
    setPhone('9444077889');
    setError(null);
    setLoading(true);
    await sendOtp('9444077889', 'buyer');
    setLoading(false);
    setStep('otp');
    setResendCooldown(30);
    setOtp('123456');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="relative bg-[#FFFDF8] rounded-3xl max-w-lg w-full shadow-2xl border border-[#D9CEB8] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A8462D] via-[#8D3823] to-[#29221D] p-6 text-white relative">
          <button
            onClick={() => {
              voice.stopAssistant();
              onClose();
            }}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black font-serif">
                {step === 'otp'
                  ? t.enterOtp
                  : tab === 'signin'
                  ? t.buyerSignInTitle
                  : t.buyerSignUpTitle}
              </h2>
              <p className="text-[#F3E5AB] text-xs">
                {step === 'otp'
                  ? '🔒 Passwordless OTP Verification'
                  : 'Direct Artisan Heritage Marketplace • No Password Required'}
              </p>
            </div>
          </div>

          {/* Tab Switcher (Only in Phone Step) */}
          {step === 'phone' && (
            <div className="flex bg-black/25 p-1 rounded-xl mt-4">
              <button
                onClick={() => {
                  voice.stopAssistant();
                  setTab('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tab === 'signin' ? 'bg-[#FFFDF8] text-[#29221D] shadow-xs' : 'text-[#F3E5AB] hover:text-white'
                }`}
              >
                {t.signIn}
              </button>
              <button
                onClick={() => {
                  voice.stopAssistant();
                  setTab('signup');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tab === 'signup' ? 'bg-[#FFFDF8] text-[#29221D] shadow-xs' : 'text-[#F3E5AB] hover:text-white'
                }`}
              >
                {t.signUp}
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Quick Demo Fill Button (Only in Phone Step) */}
          {step === 'phone' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="flex-1 py-2 px-3 rounded-xl bg-[#C88732]/15 hover:bg-[#C88732]/25 border border-[#C88732]/40 text-[#A8462D] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C88732]" />
                <span>⚡ {t.quickDemoLogin} (9444077889)</span>
              </button>
            </div>
          )}

          {/* Voice Assistant Status Bar */}
          <VoiceAssistBanner
            voice={voice}
            language={language}
            fields={activeFields}
          />

          {/* Interactive Voice Helper Button */}
          <button
            type="button"
            onClick={voice.startGuidedFlow}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#FFFDF8] hover:bg-[#F7F2E8] border-2 border-[#D9CEB8] hover:border-[#A8462D] text-[#29221D] font-black text-xs sm:text-sm flex items-center justify-between shadow-xs transition-all active:scale-[0.99] cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A8462D] to-[#C88732] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block leading-tight font-extrabold text-[#29221D] text-xs sm:text-sm">
                  {language === 'hi'
                    ? '🎙️ बोलकर विवरण भरें (आवाज़ सहायक)'
                    : language === 'te'
                    ? '🎙️ వాయిస్ అసిస్టెంట్ ద్వారా వివరాలు నమోదు'
                    : '🎙️ Voice Assist Login Details'}
                </span>
                <span className="text-[10px] text-[#A8462D] font-bold block">
                  {step === 'otp'
                    ? (language === 'hi' ? 'ओटीपी बोलें (डेमो: 123456)' : 'Speak 6-digit OTP (Demo: 123456)')
                    : (language === 'hi' ? 'क्लिक करें और 10 अंकों का मोबाइल नंबर बोलें' : 'Speak your 10-digit mobile number')}
                </span>
              </div>
            </div>
            <span className="bg-[#A8462D] hover:bg-[#8D3823] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
              {language === 'hi' ? 'आवाज़ से भरें' : language === 'te' ? 'వాయిస్' : 'Speak'}
            </span>
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: OTP VERIFICATION (NO PASSWORD NEEDED)              */}
          {/* ========================================================= */}
          {step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Phone number badge with edit button */}
              <div className="p-3.5 bg-[#F7F2E8] border border-[#D9CEB8] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#A8462D] text-white flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#6B5E55] block">OTP sent to mobile</span>
                    <span className="text-sm font-black text-[#29221D] font-mono tracking-wide">+91 {phone}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFFDF8] border border-[#D9CEB8] text-[#29221D] text-xs font-bold hover:bg-[#F7F2E8] cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{language === 'hi' ? 'बदलें' : 'Change'}</span>
                </button>
              </div>

              {/* Demo OTP Banner */}
              <div className="p-3 bg-[#C88732]/15 border border-[#C88732]/35 rounded-xl flex items-center justify-between text-xs text-[#29221D]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#A8462D] shrink-0" />
                  <span>Demo OTP code is <strong className="font-mono text-sm font-black text-[#A8462D]">123456</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp('123456')}
                  className="px-2 py-0.5 rounded bg-[#A8462D] hover:bg-[#8D3823] text-white text-[11px] font-bold cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-xs font-bold text-[#6B5E55] mb-1.5">
                  {t.enterOtp}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className={`w-full pl-4 pr-11 py-3 bg-[#FFFDF8] border rounded-xl text-[#29221D] text-center tracking-[0.4em] font-mono text-xl font-black focus:outline-none focus:ring-2 focus:ring-[#A8462D] transition-all ${
                      voice.activeFieldKey === 'otp'
                        ? 'border-[#A8462D] ring-2 ring-[#C88732]/40 bg-[#FFFDF8]'
                        : 'border-[#D9CEB8]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => voice.recordSingleField('otp')}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                      voice.activeFieldKey === 'otp' && voice.isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-[#8C827A] hover:text-[#A8462D] hover:bg-[#F7F2E8]'
                    }`}
                    title={language === 'hi' ? 'ओटीपी बोलें' : 'Speak OTP'}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className="artisan-btn-primary w-full py-3 bg-[#A8462D] hover:bg-[#8D3823] text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{language === 'hi' ? 'सत्यापित करें और खरीदारी करें' : 'Verify & Browse Marketplace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Link */}
              <div className="text-center pt-1">
                {resendCooldown > 0 ? (
                  <span className="text-xs text-[#6B5E55] font-medium">
                    Resend OTP in <strong className="font-mono text-[#29221D]">{resendCooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="inline-flex items-center gap-1.5 text-xs text-[#A8462D] hover:underline font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.resendOtp}</span>
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* ========================================================= */
            /* STEP 1: ENTER PHONE (SIGN IN OR SIGN UP)                  */
            /* ========================================================= */
            tab === 'signin' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#6B5E55] mb-1.5">{t.emailOrMobile}</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 9444077889"
                      className={`w-full pl-3.5 pr-11 py-3 bg-[#FFFDF8] border rounded-xl text-[#29221D] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#A8462D] transition-all ${
                        voice.activeFieldKey === 'phone'
                          ? 'border-[#A8462D] ring-2 ring-[#C88732]/40 bg-[#FFFDF8]'
                          : 'border-[#D9CEB8]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => voice.recordSingleField('phone')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                        voice.activeFieldKey === 'phone' && voice.isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'text-[#8C827A] hover:text-[#A8462D] hover:bg-[#F7F2E8]'
                      }`}
                      title={language === 'hi' ? 'मोबाइल नंबर बोलें' : 'Speak mobile number'}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#6B5E55] mt-1">
                    No password required. Instant OTP login.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="artisan-btn-primary w-full py-3 bg-[#A8462D] hover:bg-[#8D3823] text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t.sendOtp}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-[#6B5E55]">
                    {t.noAccount}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signup');
                        setError(null);
                      }}
                      className="text-[#A8462D] font-bold hover:underline cursor-pointer"
                    >
                      {t.createAccount}
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* Buyer Sign Up Tab */
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#6B5E55] mb-1">Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anita Deshmukh"
                      className="w-full pl-3 pr-10 py-2 bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl text-[#29221D] text-sm focus:outline-none focus:ring-2 focus:ring-[#A8462D]"
                    />
                    <button
                      type="button"
                      onClick={() => voice.recordSingleField('fullName')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8C827A] hover:text-[#A8462D]"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6B5E55] mb-1">Mobile Number (10 digits) *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="9444077889"
                      className="w-full pl-3 pr-10 py-2 bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl text-[#29221D] text-sm focus:outline-none focus:ring-2 focus:ring-[#A8462D]"
                    />
                    <button
                      type="button"
                      onClick={() => voice.recordSingleField('phone')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8C827A] hover:text-[#A8462D]"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#6B5E55] mb-1">City</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Bengaluru"
                        className="w-full pl-3 pr-8 py-2 bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl text-[#29221D] text-sm focus:outline-none focus:ring-2 focus:ring-[#A8462D]"
                      />
                      <button
                        type="button"
                        onClick={() => voice.recordSingleField('location')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8C827A] hover:text-[#A8462D]"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#6B5E55] mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Karnataka"
                      className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl text-[#29221D] text-sm focus:outline-none focus:ring-2 focus:ring-[#A8462D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="artisan-btn-primary w-full mt-2 py-3 bg-[#A8462D] hover:bg-[#8D3823] text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t.sendOtp}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-[#6B5E55]">
                    {t.haveAccount}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signin');
                        setError(null);
                      }}
                      className="text-[#A8462D] font-bold hover:underline cursor-pointer"
                    >
                      {t.signIn}
                    </button>
                  </p>
                </div>
              </form>
            )
          )}

          {/* Direct Benefits Footnote */}
          <div className="pt-2 border-t border-[#D9CEB8] flex items-center justify-between text-[11px] text-[#6B5E55]">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Authentic GI & Artisan Direct
            </span>
            <span className="text-[#A8462D] font-bold">Encrypted OTP Access</span>
          </div>
        </div>
      </div>

      {/* Language Selection Modal upon Login */}
      {showLanguageModal && (
        <LanguageSelectionModal
          isOpen={showLanguageModal}
          onClose={() => handleLanguageChosen(language)}
          onSelectLanguage={handleLanguageChosen}
          title="Welcome! Choose Your Language"
          subtitle="Select your preferred language for buyer voice tour and app navigation"
        />
      )}
    </div>
  );
}
