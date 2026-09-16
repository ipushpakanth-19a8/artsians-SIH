import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, UserPlus, LogIn, Sparkles, Volume2, X, ShieldCheck, Mic } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS } from '../../lib/portalI18n';
import { useAuth } from '../../lib/AuthContext';
import { useVoiceFormAssistant, VoiceFormFieldConfig } from '../../lib/useVoiceFormAssistant';
import { VoiceAssistBanner } from '../common/VoiceAssistBanner';

interface BuyerOnboardingModalProps {
  language: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
  onSpeak?: (text: string) => void;
}

export const BuyerOnboardingModal: React.FC<BuyerOnboardingModalProps> = ({
  language,
  isOpen,
  onClose,
  onSpeak,
}) => {
  const t = PORTAL_TRANSLATIONS[language];
  const { login, loginBuyer, signupBuyer } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'options' | 'signin' | 'signup'>('options');
  const [identifier, setIdentifier] = useState('buyer@culturecurate.in');
  const [password, setPassword] = useState('Buyer@123456');
  const [name, setName] = useState('Anita Deshmukh');
  const [phone, setPhone] = useState('9444077889');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Voice Form Config
  const signInVoiceFields: VoiceFormFieldConfig[] = useMemo(() => [
    {
      key: 'identifier',
      label: language === 'hi' ? '10 अंकों का मोबाइल' : language === 'te' ? '10 అంకెల మొబైల్' : '10-Digit Mobile',
      type: 'tel',
      prompts: {
        en: 'Please speak your 10-digit mobile number.',
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
      key: 'password',
      label: language === 'hi' ? 'पासवर्ड' : language === 'te' ? 'పాస్వర్డ్' : 'Password',
      type: 'password',
      prompts: {
        en: 'Please speak your password.',
        hi: 'कृपया अपना पासवर्ड बोलें।',
        te: 'దయచేసి మీ పాస్వర్డ్ చెప్పండి.',
      },
      sampleFallback: {
        en: 'Buyer@123456',
        hi: 'Buyer@123456',
        te: 'Buyer@123456',
      },
    },
  ], [language]);

  const signUpVoiceFields: VoiceFormFieldConfig[] = useMemo(() => [
    {
      key: 'name',
      label: language === 'hi' ? 'पूरा नाम' : language === 'te' ? 'పూర్తి పేరు' : 'Full Name',
      type: 'text',
      prompts: {
        en: 'Please speak your full name.',
        hi: 'कृपया अपना नाम बोलें।',
        te: 'దయచేసి మీ పేరు చెప్పండి.',
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
        te: 'దయచేసి మీ మొబైల్ నంబర్ చెప్పండి.',
      },
      sampleFallback: {
        en: '9444077889',
        hi: '9444077889',
        te: '9444077889',
      },
    },
    {
      key: 'password',
      label: language === 'hi' ? 'पासवर्ड' : language === 'te' ? 'పాస్వర్డ్' : 'Password',
      type: 'password',
      prompts: {
        en: 'Please speak your password.',
        hi: 'कृपया अपना पासवर्ड बोलें।',
        te: 'దయచేసి మీ పాస్వర్డ్ చెప్పండి.',
      },
      sampleFallback: {
        en: 'Buyer@123456',
        hi: 'Buyer@123456',
        te: 'Buyer@123456',
      },
    },
  ], [language]);

  const handleFieldFilled = (key: string, value: string) => {
    if (key === 'identifier') setIdentifier(value);
    if (key === 'password') setPassword(value);
    if (key === 'name') setName(value);
    if (key === 'phone') setPhone(value);
  };

  const voice = useVoiceFormAssistant({
    language,
    fields: activeTab === 'signin' ? signInVoiceFields : signUpVoiceFields,
    onFieldFilled: handleFieldFilled,
  });

  if (!isOpen) return null;

  const handleGuestEntry = () => {
    voice.stopAssistant();
    login('buyer');
    onClose();
    navigate('/buyer');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      voice.stopAssistant();
      const res = await loginBuyer(identifier, password);
      if (res.success) {
        onClose();
        navigate('/buyer');
      } else {
        login('buyer');
        onClose();
        navigate('/buyer');
      }
    } catch {
      login('buyer');
      onClose();
      navigate('/buyer');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      voice.stopAssistant();
      const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
      const res = await signupBuyer({
        name,
        email: `${cleanPhone}@buyer.in`,
        phone: cleanPhone,
        password,
        confirmPassword: password,
      });
      if (res.success) {
        onClose();
        navigate('/buyer');
      } else {
        login('buyer');
        onClose();
        navigate('/buyer');
      }
    } catch {
      login('buyer');
      onClose();
      navigate('/buyer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-50 rounded-3xl border-2 border-emerald-400 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-stone-100 px-5 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🛍️</span>
            <div>
              <h3 className="font-black text-lg leading-tight">
                {t.buyerWelcomeTitle}
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                {t.buyerWelcomeSub}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              voice.stopAssistant();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-black/20 text-stone-200 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Help Bar */}
        <div className="bg-emerald-100/90 border-b border-emerald-300 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-800 shrink-0" />
            {t.needHelpVoice}
          </span>
          <button
            type="button"
            onClick={() => onSpeak && onSpeak(t.buyerAudioHelp)}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-black shadow-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{t.voiceListen} 🔊</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Active Voice Assistant Banner */}
          <VoiceAssistBanner
            language={language}
            isListening={voice.isListening}
            isSpeaking={voice.isSpeaking}
            activeFieldKey={voice.activeFieldKey}
            statusMessage={voice.statusMessage}
            transcript={voice.transcript}
            onStop={voice.stopAssistant}
          />

          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {activeTab === 'options' && (
            <div className="space-y-4 py-2">
              {/* Primary Guest Card */}
              <div className="bg-white rounded-2xl border-2 border-emerald-300 p-5 text-center shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3 text-2xl">
                  ⚡
                </div>
                <h4 className="text-base sm:text-lg font-black text-stone-900 mb-1">
                  Fastest Way to Explore
                </h4>
                <p className="text-xs text-stone-600 mb-4 font-medium">
                  {t.buyerGuestSub}
                </p>

                <button
                  onClick={handleGuestEntry}
                  className="w-full min-h-[50px] py-3 px-6 rounded-xl font-black text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                >
                  <span>{t.buyerBtnGuest}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Alternative Standard Sign In / Sign Up buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('signin')}
                  className="min-h-[48px] p-3 rounded-xl bg-white border-2 border-stone-300 hover:border-emerald-500 font-bold text-xs sm:text-sm text-stone-800 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-700" />
                  <span>{t.buyerBtnSignIn}</span>
                </button>

                <button
                  onClick={() => setActiveTab('signup')}
                  className="min-h-[48px] p-3 rounded-xl bg-white border-2 border-stone-300 hover:border-emerald-500 font-bold text-xs sm:text-sm text-stone-800 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-emerald-700" />
                  <span>{t.buyerBtnSignUp}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              {/* Voice Assistance Button */}
              <button
                type="button"
                onClick={voice.startGuidedFlow}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amber-700" />
                  <span>{language === 'hi' ? '🎙️ बोलकर लॉगिन विवरण भरें' : '🎙️ Voice Assist Login Details'}</span>
                </div>
                <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Speak
                </span>
              </button>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="9444077889"
                    className="w-full pl-3.5 pr-10 py-3 bg-white border-2 border-stone-300 focus:border-emerald-500 rounded-xl text-sm font-semibold text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => voice.recordSingleField('identifier')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-emerald-700 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-3 bg-white border-2 border-stone-300 focus:border-emerald-500 rounded-xl text-sm font-semibold text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => voice.recordSingleField('password')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-emerald-700 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] py-3 rounded-xl font-black text-white bg-emerald-700 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.buyerBtnSignIn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    voice.stopAssistant();
                    setActiveTab('options');
                  }}
                  className="w-full py-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 text-center cursor-pointer"
                >
                  ← Back to Options
                </button>
              </div>
            </form>
          )}

          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              {/* Voice Assistance Button */}
              <button
                type="button"
                onClick={voice.startGuidedFlow}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amber-700" />
                  <span>{language === 'hi' ? '🎙️ बोलकर विवरण भरें' : '🎙️ Voice Assist Register'}</span>
                </div>
                <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Speak
                </span>
              </button>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border-2 border-stone-300 focus:border-emerald-500 rounded-xl text-sm font-semibold text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => voice.recordSingleField('name')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-emerald-700 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border-2 border-stone-300 focus:border-emerald-500 rounded-xl text-sm font-semibold text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => voice.recordSingleField('phone')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-emerald-700 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border-2 border-stone-300 focus:border-emerald-500 rounded-xl text-sm font-semibold text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => voice.recordSingleField('password')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-emerald-700 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] py-3 rounded-xl font-black text-white bg-emerald-700 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t.buyerBtnSignUp}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    voice.stopAssistant();
                    setActiveTab('options');
                  }}
                  className="w-full py-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 text-center cursor-pointer"
                >
                  ← Back to Options
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
