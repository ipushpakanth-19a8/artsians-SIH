import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, MapPin, Sparkles, Volume2, ArrowRight, CheckCircle2, X, ShieldCheck, Globe } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS, CRAFT_CATEGORIES } from '../../lib/portalI18n';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';

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
  const { login, signupSeller } = useAuth();
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [phone, setPhone] = useState('9848012345');
  const [name, setName] = useState('Rameshwar Rao');
  const [village, setVillage] = useState('Pochampally, Yadadri');
  const [craft, setCraft] = useState('Weaving');
  const [preferredLang, setPreferredLang] = useState<LanguageCode>(language);

  // OTP State
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setStep('otp');
    if (onSpeak) {
      onSpeak(t.otpSub);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    // auto focus next input if digit entered
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

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const updated = [...otp];
      for (let i = 0; i < 6; i++) {
        updated[i] = pasted[i] || '';
      }
      setOtp(updated);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const stateMatch = village.split(',').pop()?.trim() || 'Telangana';
      // Authenticate as artisan in the app
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

      // Small success delay for pleasant micro-interaction
      setTimeout(() => {
        setIsVerifying(false);
        onClose();
        navigate('/seller');
      }, 600);
    } catch (err) {
      setIsVerifying(false);
      setErrorMsg('Verification failed. Please try again.');
    }
  };

  const handleFillDemo = () => {
    setName('Govindram Sharma');
    setPhone('9876543210');
    setVillage('Khurja, Uttar Pradesh');
    setCraft('Pottery');
    setPreferredLang('hi');
    setLanguage('hi');
    setOtp(['1', '2', '3', '4', '5', '6']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-50 rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-stone-100 px-5 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧑‍🎨</span>
            <div>
              <h3 className="font-black text-lg sm:text-xl leading-tight">
                {t.artisanWelcomeTitle}
              </h3>
              <p className="text-xs text-amber-200 font-medium">
                {t.artisanWelcomeSub}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 text-stone-200 hover:text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Help Bar for Low-Literacy Support */}
        <div className="bg-amber-100/90 border-b border-amber-300 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-amber-800 shrink-0" />
            {t.needHelpVoice}
          </span>
          <button
            onClick={() => onSpeak && onSpeak(t.artisanAudioHelp)}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black shadow-xs transition-all flex items-center gap-1"
          >
            <span>{t.voiceListen} 🔊</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {/* Mobile Number - Large touch target */}
              <div>
                <label className="block text-sm sm:text-base font-extrabold text-stone-900 mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>{t.fieldMobile} *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98480 12345"
                    className="w-full pl-14 pr-4 py-3.5 bg-white border-2 border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-2xl text-lg font-bold text-stone-900 tracking-wider shadow-inner"
                  />
                </div>
              </div>

              {/* Artisan Name */}
              <div>
                <label className="block text-sm sm:text-base font-extrabold text-stone-900 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>{t.fieldName} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rameshwar Rao"
                  className="w-full px-4 py-3.5 bg-white border-2 border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-2xl text-base sm:text-lg font-bold text-stone-900 shadow-inner"
                />
              </div>

              {/* Village / District */}
              <div>
                <label className="block text-sm sm:text-base font-extrabold text-stone-900 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>{t.fieldVillage}</span>
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Pochampally, Yadadri Bhoodan"
                  className="w-full px-4 py-3 bg-white border-2 border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-2xl text-base font-semibold text-stone-900 shadow-inner"
                />
              </div>

              {/* Craft Type Selector */}
              <div>
                <label className="block text-sm sm:text-base font-extrabold text-stone-900 mb-2">
                  {t.fieldCraft}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CRAFT_CATEGORIES.map((cat) => {
                    const isSelected = craft === cat.id;
                    const label = language === 'hi' ? cat.nativeHi : language === 'te' ? cat.nativeTe : cat.name;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCraft(cat.id)}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-xs'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-extrabold truncate">
                          {label}
                        </span>
                        <span className="text-[10px] text-stone-500 truncate mt-0.5">
                          {cat.example}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Language for Audio & SMS */}
              <div>
                <label className="block text-sm sm:text-base font-extrabold text-stone-900 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span>{t.fieldLang}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'en', label: 'English', sub: 'English' },
                    { id: 'hi', label: 'हिन्दी', sub: 'Hindi' },
                    { id: 'te', label: 'తెలుగు', sub: 'Telugu' },
                  ].map((l) => {
                    const isSelected = preferredLang === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setPreferredLang(l.id as LanguageCode);
                          setLanguage(l.id as LanguageCode);
                        }}
                        className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                          isSelected
                            ? 'bg-amber-100 border-amber-600 text-amber-950 font-black shadow-xs ring-2 ring-amber-300'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300 font-bold'
                        }`}
                      >
                        <span className="text-sm block">{l.label}</span>
                        <span className="text-[10px] text-stone-500 block">{l.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 active:scale-98"
                >
                  <span>{t.btnGetOtp}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          ) : (
            /* OTP VERIFICATION VIEW */
            <div className="space-y-5 py-2">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-stone-900 mb-1">
                  {t.otpTitle}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-xs mx-auto">
                  {t.otpSub} (+91 {phone})
                </p>
              </div>

              {/* 6-Digit Big OTP Inputs */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 my-4">
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
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black bg-white border-2 border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 rounded-xl text-stone-900 shadow-sm"
                  />
                ))}
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-98"
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
                  onClick={() => setStep('form')}
                  className="w-full py-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-all text-center"
                >
                  ← Edit Phone / Details
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
            className="text-amber-800 hover:text-amber-950 font-bold underline text-xs"
          >
            {t.autoFillDemo}
          </button>
        </div>
      </div>
    </div>
  );
};
