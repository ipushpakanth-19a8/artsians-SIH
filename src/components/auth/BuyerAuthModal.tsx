import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, ShieldCheck, HelpCircle, Mic } from 'lucide-react';
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
  const { loginBuyer, signupBuyer } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('Karnataka');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fields configured for voice input
  const signInFields: VoiceFormFieldConfig[] = useMemo(() => [
    {
      key: 'signInIdentifier',
      label: language === 'hi' ? 'ईमेल या मोबाइल नंबर' : language === 'te' ? 'ఈమెయిల్ లేదా మొబైల్' : 'Email or Mobile Number',
      type: 'text',
      prompts: {
        en: 'Please speak your registered email address or 10-digit mobile number.',
        hi: 'कृपया अपना पंजीकृत ईमेल पता या 10 अंकों का मोबाइल नंबर बोलें।',
        te: 'దయచేసి మీ రిజిస్టర్డ్ ఈమెయిల్ లేదా 10 అంకెల మొబైల్ నంబర్ చెప్పండి.',
      },
      sampleFallback: {
        en: 'buyer@culturecurate.in',
        hi: 'buyer@culturecurate.in',
        te: 'buyer@culturecurate.in',
      },
    },
    {
      key: 'signInPassword',
      label: language === 'hi' ? 'पासवर्ड' : language === 'te' ? 'పాస్వర్డ్' : 'Password',
      type: 'password',
      prompts: {
        en: 'Now please speak your password.',
        hi: 'अब अपना पासवर्ड बोलें।',
        te: 'ఇప్పుడు మీ పాస్వర్డ్ చెప్పండి.',
      },
      sampleFallback: {
        en: 'Buyer@123456',
        hi: 'Buyer@123456',
        te: 'Buyer@123456',
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
      key: 'email',
      label: language === 'hi' ? 'ईमेल पता' : language === 'te' ? 'ఈమెయిల్' : 'Email Address',
      type: 'email',
      prompts: {
        en: 'Please speak your email address.',
        hi: 'कृपया अपना ईमेल पता बोलें।',
        te: 'దయచేసి మీ ఈమెయిల్ చెప్పండి.',
      },
      sampleFallback: {
        en: 'buyer@culturecurate.in',
        hi: 'buyer@culturecurate.in',
        te: 'buyer@culturecurate.in',
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
      label: language === 'hi' ? 'शहर' : language === 'te' ? 'నగరం' : 'City or Location',
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
    {
      key: 'password',
      label: language === 'hi' ? 'पासवर्ड' : language === 'te' ? 'పాస్వర్డ్' : 'Password',
      type: 'password',
      prompts: {
        en: 'Please speak your desired password.',
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

  const activeFields = tab === 'signin' ? signInFields : signUpFields;

  const handleFieldFilled = (key: string, value: string) => {
    if (key === 'signInIdentifier') setSignInIdentifier(value);
    if (key === 'signInPassword') setSignInPassword(value);
    if (key === 'fullName') setFullName(value);
    if (key === 'email') setEmail(value);
    if (key === 'phone') setPhone(value);
    if (key === 'location') setLocation(value);
    if (key === 'password') {
      setPassword(value);
      setConfirmPassword(value);
    }
  };

  const voice = useVoiceFormAssistant({
    language,
    fields: activeFields,
    onFieldFilled: handleFieldFilled,
  });

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!signInIdentifier.trim()) {
      setError(t.validEmailRequired);
      return;
    }
    if (!signInPassword) {
      setError(t.passwordMinLength);
      return;
    }

    setLoading(true);
    const res = await loginBuyer(signInIdentifier.trim(), signInPassword);
    setLoading(false);
    if (res.success) {
      voice.stopAssistant();
      setShowLanguageModal(true);
    } else {
      setError(res.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(t.nameRequired);
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError(t.validEmailRequired);
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError(t.validMobileRequired);
      return;
    }
    if (!password || password.length < 6) {
      setError(t.passwordMinLength);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordsMustMatch);
      return;
    }

    setLoading(true);
    const res = await signupBuyer({
      name: fullName.trim(),
      email: email.trim(),
      phone: cleanPhone,
      password,
      confirmPassword,
      location: location.trim() || undefined,
      state,
      address: address.trim() || undefined,
    });
    setLoading(false);

    if (res.success) {
      voice.stopAssistant();
      setShowLanguageModal(true);
    } else {
      setError(res.error || 'Registration failed. Please review the form.');
    }
  };

  const handleLanguageChosen = (chosenLang: LanguageCode) => {
    setLanguage(chosenLang);
    sessionStorage.setItem('open_buyer_tutorial', 'true');
    sessionStorage.removeItem('kalatech_seen_buyer_tour');
    setShowLanguageModal(false);
    onClose();
    navigate('/buyer');
  };

  const handleQuickDemoFill = () => {
    setSignInIdentifier('buyer@culturecurate.in');
    setSignInPassword('Buyer@123456');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-teal-800 p-6 text-white relative">
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
              <h2 className="text-xl font-black font-['Rozha_One',serif]">
                {tab === 'signin' ? t.buyerSignInTitle : t.buyerSignUpTitle}
              </h2>
              <p className="text-emerald-100 text-xs">Direct Artisan Heritage Marketplace</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4">
            <button
              onClick={() => {
                voice.stopAssistant();
                setTab('signin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === 'signin' ? 'bg-white text-stone-900 shadow' : 'text-emerald-100 hover:text-white'
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
                tab === 'signup' ? 'bg-white text-stone-900 shadow' : 'text-emerald-100 hover:text-white'
              }`}
            >
              {t.signUp}
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
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

          {/* Voice Assistance Master Button */}
          <button
            type="button"
            onClick={voice.startGuidedFlow}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-300 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-between shadow-xs transition-all active:scale-[0.99] cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block leading-tight font-extrabold text-stone-900 text-xs sm:text-sm">
                  {language === 'hi'
                    ? '🎙️ बोलकर लॉगिन विवरण भरें (Voice Assist)'
                    : language === 'te'
                    ? '🎙️ వాయిస్ ద్వారా వివరాలు నమోదు చేయండి'
                    : '🎙️ Voice Assist Login Details'}
                </span>
                <span className="text-[10px] text-amber-800 font-bold block">
                  {language === 'hi'
                    ? 'बटन दबाकर बोलें - सहायक अपने आप भरेगा'
                    : language === 'te'
                    ? 'మాట్లాడండి - వివరాలు ఆటోమేటిక్‌గా నమోదు అవుతాయి'
                    : 'Click to speak and auto-fill details'}
                </span>
              </div>
            </div>
            <span className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
              {language === 'hi' ? 'आवाज़ से भरें' : language === 'te' ? 'వాయిస్' : 'Speak'}
            </span>
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Identifier Input with Field Mic */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">{t.emailOrMobile}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="e.g. buyer@culturecurate.in or 9444077889"
                    className={`w-full pl-3.5 pr-11 py-2.5 bg-stone-50 border rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      voice.activeFieldKey === 'signInIdentifier'
                        ? 'border-amber-500 ring-2 ring-amber-300 bg-amber-50/50'
                        : 'border-stone-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => voice.recordSingleField('signInIdentifier')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                      voice.activeFieldKey === 'signInIdentifier' && voice.isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-stone-400 hover:text-amber-700 hover:bg-amber-100/60'
                    }`}
                    title={language === 'hi' ? 'ईमेल या मोबाइल बोलें' : 'Speak email or mobile'}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Password Input with Field Mic */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700">{t.password}</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-emerald-700 hover:underline font-semibold"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter password"
                    className={`w-full pl-3.5 pr-20 py-2.5 bg-stone-50 border rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      voice.activeFieldKey === 'signInPassword'
                        ? 'border-amber-500 ring-2 ring-amber-300 bg-amber-50/50'
                        : 'border-stone-300'
                    }`}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => voice.recordSingleField('signInPassword')}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        voice.activeFieldKey === 'signInPassword' && voice.isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'text-stone-400 hover:text-amber-700 hover:bg-amber-100/60'
                      }`}
                      title={language === 'hi' ? 'पासवर्ड बोलें' : 'Speak password'}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                {loading ? t.loading : t.signIn}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Fill Helper */}
              <div className="pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="w-full py-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {t.quickDemoLogin} (Anita Deshmukh • Bengaluru)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.fullName} *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Anita Deshmukh"
                    className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => voice.recordSingleField('fullName')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-amber-700"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="buyer@culturecurate.in"
                      className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => voice.recordSingleField('email')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-amber-700"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mobile (10 digits) *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9444077889"
                      className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => voice.recordSingleField('phone')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-amber-700"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.locationCity}</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => voice.recordSingleField('location')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-amber-700"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.state}</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, apartment, locality"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.password} *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.confirmPassword} *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                {loading ? t.loading : t.createAccount}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% Proceeds to Artisans • Fair Trade Certified
          </span>
          <button
            onClick={() => {
              voice.stopAssistant();
              setTab(tab === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            {tab === 'signin' ? t.noAccount : t.haveAccount}
          </button>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              Password Reset Assistance
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              If you forgot your password, please contact the KALAtech buyer support desk at <span className="font-semibold text-emerald-700">support@kalatech.gov.in</span> with your registered mobile or email.
            </p>
            <p className="text-xs text-stone-500">
              Demo credentials: <code className="bg-stone-100 px-2 py-0.5 rounded font-mono text-stone-800">buyer@culturecurate.in / Buyer@123456</code>
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

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
