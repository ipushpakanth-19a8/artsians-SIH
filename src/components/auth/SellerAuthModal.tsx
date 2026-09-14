import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, X, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, HelpCircle, Mic } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { useVoiceFormAssistant, VoiceFormFieldConfig } from '../../lib/useVoiceFormAssistant';
import { VoiceAssistBanner } from '../common/VoiceAssistBanner';
import { LanguageSelectionModal } from '../common/LanguageSelectionModal';
import { LanguageCode } from '../../types';

interface SellerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

const CRAFT_CATEGORIES = [
  'Weaving',
  'Blue Pottery',
  'Metalcraft / Dhokra',
  'Woodwork',
  'Folk Painting',
  'Embroidery / Zardozi',
  'Terracotta & Clay',
  'Bamboo & Cane',
  'Leathercraft',
];

export function SellerAuthModal({ isOpen, onClose, defaultTab = 'signin' }: SellerAuthModalProps) {
  const { language, setLanguage } = useLanguage();
  const { loginSeller, signupSeller, login } = useAuth();
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
  const [craftType, setCraftType] = useState('Weaving');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('Telangana');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Voice Form Fields Configuration
  const signInFields: VoiceFormFieldConfig[] = useMemo(() => [
    {
      key: 'signInIdentifier',
      label: language === 'hi' ? 'कारीगर फोन या ईमेल' : language === 'te' ? 'కళాకారుల ఫోన్ లేదా ఈమెయిల్' : 'Phone or Email',
      type: 'text',
      prompts: {
        en: 'Please speak your artisan registered phone number or email address.',
        hi: 'कृपया अपना पंजीकृत फोन नंबर या ईमेल पता बोलें।',
        te: 'దయచేసి మీ నమోదిత ఫోన్ నంబర్ లేదా ఈమెయిల్ చెప్పండి.',
      },
      sampleFallback: {
        en: '9848012345',
        hi: '9848012345',
        te: '9848012345',
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
        en: 'Seller@123456',
        hi: 'Seller@123456',
        te: 'Seller@123456',
      },
    },
  ], [language]);

  const signUpFields: VoiceFormFieldConfig[] = useMemo(() => [
    {
      key: 'fullName',
      label: language === 'hi' ? 'कारीगर का नाम' : language === 'te' ? 'కళాకారుడి పేరు' : 'Artisan Name',
      type: 'text',
      prompts: {
        en: 'Please speak your full name.',
        hi: 'कृपया अपना पूरा नाम बोलें।',
        te: 'దయచేసి మీ పూర్తి పేరు చెప్పండి.',
      },
      sampleFallback: {
        en: 'Rameshwar Rao',
        hi: 'रामेश्वर राव',
        te: 'రామేశ్వర్ రావు',
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
        en: '9848012345',
        hi: '9848012345',
        te: '9848012345',
      },
    },
    {
      key: 'location',
      label: language === 'hi' ? 'गाँव या जिला' : language === 'te' ? 'గ్రామం లేదా జిల్లా' : 'Village or District',
      type: 'text',
      prompts: {
        en: 'Please speak your village or district name.',
        hi: 'कृपया अपने गाँव या जिले का नाम बोलें।',
        te: 'దయచేసి మీ గ్రామం లేదా జిల్లా పేరు చెప్పండి.',
      },
      sampleFallback: {
        en: 'Pochampally, Yadadri',
        hi: 'पोचमपल्ली, यादद्री',
        te: 'పోచంపల్లి, యాదాద్రి',
      },
    },
    {
      key: 'password',
      label: language === 'hi' ? 'पासवर्ड' : language === 'te' ? 'పాస్వర్డ్' : 'Password',
      type: 'password',
      prompts: {
        en: 'Please speak a password for your shop.',
        hi: 'कृपया अपनी दुकान के लिए पासवर्ड बोलें।',
        te: 'దయచేసి పాస్వర్డ్ చెప్పండి.',
      },
      sampleFallback: {
        en: 'Seller@123456',
        hi: 'Seller@123456',
        te: 'Seller@123456',
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
    const res = await loginSeller(signInIdentifier.trim(), signInPassword);
    setLoading(false);
    if (res.success) {
      voice.stopAssistant();
      setShowLanguageModal(true);
    } else {
      setError(res.error || 'Failed to sign in. Please verify your credentials.');
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
    const res = await signupSeller({
      name: fullName.trim(),
      email: email.trim(),
      phone: cleanPhone,
      password,
      confirmPassword,
      craftType,
      businessName: businessName.trim() || undefined,
      location: location.trim() || undefined,
      state,
    });
    setLoading(false);

    if (res.success) {
      voice.stopAssistant();
      setShowLanguageModal(true);
    } else {
      setError(res.error || 'Registration failed. Please check the form.');
    }
  };

  const handleLanguageChosen = (chosenLang: LanguageCode) => {
    setLanguage(chosenLang);
    sessionStorage.setItem('open_seller_tutorial', 'true');
    sessionStorage.removeItem('kalatech_seen_seller_tour');
    setShowLanguageModal(false);
    onClose();
    navigate('/seller');
  };

  const handleQuickDemoFill = () => {
    setSignInIdentifier('rameshwar@artisan.in');
    setSignInPassword('Seller@123456');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 p-6 text-white relative">
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
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black font-['Rozha_One',serif]">
                {tab === 'signin' ? t.sellerSignInTitle : t.sellerSignUpTitle}
              </h2>
              <p className="text-amber-100 text-xs">Direct Artisan Commerce & GI Protected Portal</p>
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
                tab === 'signin' ? 'bg-white text-stone-900 shadow' : 'text-amber-100 hover:text-white'
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
                tab === 'signup' ? 'bg-white text-stone-900 shadow' : 'text-amber-100 hover:text-white'
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block leading-tight font-extrabold text-stone-900 text-xs sm:text-sm">
                  {language === 'hi'
                    ? '🎙️ बोलकर लॉगिन विवरण भरें (आवाज़ सहायक)'
                    : language === 'te'
                    ? '🎙️ వాయిస్ అసిస్టెంట్ ద్వారా వివరాలు నమోదు'
                    : '🎙️ Voice Assist Login Details'}
                </span>
                <span className="text-[10px] text-amber-800 font-bold block">
                  {language === 'hi'
                    ? 'क्लिक करें और बोलें - मोबाइल व पासवर्ड तुरंत भरें'
                    : language === 'te'
                    ? 'క్లిక్ చేసి మాట్లాడండి - వివరాలు ఆటోమేటిక్‌గా నమోదు'
                    : 'Click to speak and auto-fill details'}
                </span>
              </div>
            </div>
            <span className="bg-[#9c4124] hover:bg-[#83341b] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
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
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">{t.emailOrMobile}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="e.g. rameshwar@artisan.in or 9848012345"
                    className={`w-full pl-3.5 pr-11 py-2.5 bg-stone-50 border rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
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
                    title={language === 'hi' ? 'बोलकर भरें' : 'Speak this field'}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700">{t.password}</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-amber-700 hover:underline font-semibold"
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
                    className={`w-full pl-3.5 pr-20 py-2.5 bg-stone-50 border rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
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
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                {loading ? t.loading : t.signIn}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Fill Helper */}
              <div className="pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="w-full py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {t.quickDemoLogin} (Rameshwar Rao • Pochampally)
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
                    placeholder="e.g. Rameshwar Rao"
                    className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="artisan@pochampally.org"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
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
                      placeholder="9848012345"
                      className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.craftType} *</label>
                <select
                  value={craftType}
                  onChange={(e) => setCraftType(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {CRAFT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Studio / Workshop Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Pochampally Heritage Handloom Society"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Village / District</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Pochampally, Yadadri"
                      className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    placeholder="e.g. Telangana"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
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
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
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
            Fair Trade Verified & Encrypted
          </span>
          <button
            onClick={() => {
              voice.stopAssistant();
              setTab(tab === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="text-amber-700 font-bold hover:underline cursor-pointer"
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
              <HelpCircle className="w-5 h-5 text-amber-600" />
              Password Reset Assistance
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              For security, artisan accounts can request a rapid password reset via SMS OTP or contact their district craft cluster officer at <span className="font-semibold text-amber-700">support@kalatech.gov.in</span>.
            </p>
            <p className="text-xs text-stone-500">
              Demo credentials: <code className="bg-stone-100 px-2 py-0.5 rounded font-mono text-stone-800">rameshwar@artisan.in / Seller@123456</code>
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
          title="Welcome Artisan! Choose Your Language / भाषा चुनें"
          subtitle="Select your preferred language for studio tools and voice guide"
        />
      )}
    </div>
  );
}
