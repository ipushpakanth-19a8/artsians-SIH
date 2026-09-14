import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  Mic, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Volume2, 
  ArrowRight, 
  ArrowLeft,
  DollarSign, 
  ShoppingBag, 
  FileText,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { useLanguage } from '../../../lib/LanguageContext';
import { LanguageCode } from '../../../types';

interface StepData {
  id: string;
  stepNum?: number;
  titleEn: string;
  titleHi: string;
  titleTe: string;
  subEn: string;
  subHi: string;
  subTe: string;
  voiceEn: string;
  voiceHi: string;
  voiceTe: string;
  fallbackDurationMs: number;
}

const SELLER_STEPS: StepData[] = [
  {
    id: 'welcome',
    titleEn: 'Welcome to KALAtech',
    titleHi: 'KALAtech में आपका स्वागत है',
    titleTe: 'KALAtech కు స్వాగతం',
    subEn: "Let's explore your handicraft business tools.",
    subHi: 'आइए अपने हस्तशिल्प व्यवसाय टूल देखें।',
    subTe: 'మీ చేతివృత్తి వ్యాపార సాధనాలను తెలుసుకోండి.',
    voiceEn: 'Welcome to KALAtech. Here is your quick handicraft journey tour. You can say Next, Back, or Skip anytime.',
    voiceHi: 'KALAtech में आपका स्वागत है। यह आपका हस्तशिल्प दौरा है। आप कभी भी अगला, पीछे या छोड़ें बोल सकते हैं।',
    voiceTe: 'KALAtech కు స్వాగతం. ఇది మీ హస్తకళల పర్యటన. మీరు ఎప్పుడైనా తరువాత, వెనుకకు లేదా వదిలివేయి అని చెప్పవచ్చు.',
    fallbackDurationMs: 6000,
  },
  {
    id: 'step1_add',
    stepNum: 1,
    titleEn: '📸 Add Handicraft',
    titleHi: '📸 हस्तशिल्प जोड़ें',
    titleTe: '📸 చేతివృత్తిని జోడించండి',
    subEn: 'Add your craft product using your phone camera',
    subHi: 'अपने फ़ोन कैमरे से अपना शिल्प उत्पाद जोड़ें',
    subTe: 'మీ ఫోన్ కెమెరా ఉపయోగించి మీ ఉత్పత్తిని జోడించండి',
    voiceEn: 'First, you can add your handicraft using your camera.',
    voiceHi: 'सबसे पहले, आप अपने कैमरे का उपयोग करके अपना हस्तशिल्प जोड़ सकते हैं।',
    voiceTe: 'మొదట, మీరు మీ కెమెరాను ఉపయోగించి మీ చేతివృత్తిని జోడించవచ్చు.',
    fallbackDurationMs: 5000,
  },
  {
    id: 'step2_voice',
    stepNum: 2,
    titleEn: '🎙️ Voice Product Details',
    titleHi: '🎙️ आवाज़ से उत्पाद विवरण',
    titleTe: '🎙️ వాయిస్ ఉత్పత్తి వివరాలు',
    subEn: 'Speak product name, craft type, and material naturally',
    subHi: 'नाम, शिल्प और सामग्री बिना टाइप किए बोलकर बताएं',
    subTe: 'టైప్ చేయకుండా పేరు, కళ మరియు మెటీరియల్ చెప్పండి',
    voiceEn: 'You can tell us your product details using your voice. You do not need to type everything.',
    voiceHi: 'आप अपनी आवाज़ का उपयोग करके हमें अपने उत्पाद का विवरण बता सकते हैं। आपको सब कुछ टाइप करने की आवश्यकता नहीं है।',
    voiceTe: 'మీరు మీ వాయిస్‌ని ఉపయోగించి ఉత్పత్తి వివరాలను చెప్పవచ్చు. మీరు ప్రతిదీ టైప్ చేయవలసిన అవసరం లేదు.',
    fallbackDurationMs: 6500,
  },
  {
    id: 'step3_catalog',
    stepNum: 3,
    titleEn: '🤖 AI Catalog',
    titleHi: '🤖 AI कैटलॉग निर्माण',
    titleTe: '🤖 AI కేటలాగ్',
    subEn: 'Automatic heritage story, description, and tags',
    subHi: 'स्वचालित विरासत कहानी, विवरण और सर्च टैग',
    subTe: 'ఆటోమేటిక్ వివరణ, సాంప్రదాయ కథనం మరియు ట్యాగ్‌లు',
    voiceEn: 'KALAtech can help create your product description from your craft information and image.',
    voiceHi: 'KALAtech आपकी शिल्प जानकारी और छवि से आपके उत्पाद का विवरण तैयार करने में मदद कर सकता है।',
    voiceTe: 'KALAtech మీ కళ సమాచారం మరియు చిత్రం నుండి ఉత్పత్తి వివరణను రూపొందించడంలో సహాయపడుతుంది.',
    fallbackDurationMs: 6500,
  },
  {
    id: 'step4_pricing',
    stepNum: 4,
    titleEn: '💰 Fair Pricing',
    titleHi: '💰 पारदर्शी उचित मूल्य',
    titleTe: '💰 సరసమైన ధర',
    subEn: 'Material Cost + Labor Hours (Living Wage) + 25% Margin',
    subHi: 'सामग्री लागत + उचित मजदूरी + 25% मार्जिन',
    subTe: 'మెటీరియల్ + సరసమైన వేతనం + 25% మార్జిన్',
    voiceEn: 'We calculate a transparent recommended fair price using your material cost, work time and configured pricing factors.',
    voiceHi: 'हम आपकी सामग्री लागत, कार्य समय और मूल्य निर्धारण कारकों का उपयोग करके पारदर्शी उचित मूल्य की गणना करते हैं।',
    voiceTe: 'మేము మీ మెటీరియల్ ఖర్చు, పని సమయం మరియు ధరల కారకాలను ఉపయోగించి పారదర్శకమైన సరసమైన ధరను లెక్కిస్తాము.',
    fallbackDurationMs: 7500,
  },
  {
    id: 'step5_billing',
    stepNum: 5,
    titleEn: '🧾 Billing',
    titleHi: '🧾 बिलिंग और रसीद',
    titleTe: '🧾 బిల్లింగ్',
    subEn: 'Hear and inspect exact price breakdown before invoice generation',
    subHi: 'रसीद और चेकआउट से पहले पूरी कीमत का हिसाब सुनें',
    subTe: 'ధరల విభజనను చూసి మరియు విని సరిచూసుకోండి',
    voiceEn: 'Before checkout, you can see and hear how your product price was calculated.',
    voiceHi: 'चेकआउट से पहले, आप देख और सुन सकते हैं कि आपके उत्पाद की कीमत की गणना कैसे की गई थी।',
    voiceTe: 'చెక్‌అవుట్‌కు ముందు, మీ ఉత్పత్తి ధర ఎలా లెక్కించబడిందో మీరు చూడవచ్చు మరియు వినవచ్చు.',
    fallbackDurationMs: 6500,
  },
  {
    id: 'step6_market',
    stepNum: 6,
    titleEn: '🛍️ Market',
    titleHi: '🛍️ बाज़ार और बिक्री',
    titleTe: '🛍️ మార్కెట్ లింకేజ్',
    subEn: 'Direct marketplace, customer enquiries, and order fulfillment',
    subHi: 'सीधे खरीदार, व्हाट्सएप पूछताछ और सुरक्षित भुगतान',
    subTe: 'కొనుగోలుదారులు, వాట్సాప్ విచారణలు మరియు ఆర్డర్లు',
    voiceEn: 'After approval, your product can continue through the available marketplace and order flow.',
    voiceHi: 'अनुमोदन के बाद, आपका उत्पाद उपलब्ध बाज़ार और ऑर्डर प्रवाह के माध्यम से आगे बढ़ सकता है।',
    voiceTe: 'ఆమోదం తర్వాత, మీ ఉత్పత్తి అందుబాటులో ఉన్న మార్కెట్ మరియు ఆర్డర్ ఫ్లో ద్వారా కొనసాగవచ్చు.',
    fallbackDurationMs: 6500,
  },
  {
    id: 'ready',
    titleEn: "You're All Set!",
    titleHi: 'आप पूरी तरह तैयार हैं!',
    titleTe: 'మీరు సిద్ధంగా ఉన్నారు!',
    subEn: 'Start your handcrafted digital shop.',
    subHi: 'अपनी हस्तशिल्प दुकान शुरू करें।',
    subTe: 'మీ చేతివృత్తి దుకాణాన్ని ప్రారంభించండి.',
    voiceEn: "You are ready. Tap Add Handicraft to begin or say Next to open your shop.",
    voiceHi: 'आप तैयार हैं। शुरू करने के लिए हस्तशिल्प जोड़ें पर टैप करें या आगे बढ़ें।',
    voiceTe: 'మీరు సిద్ధంగా ఉన్నారు. ప్రారంభించడానికి చేతివృత్తిని జోడించండి పై నొక్కండి.',
    fallbackDurationMs: 4000,
  },
];

interface SellerOnboardingProps {
  onComplete?: () => void;
}

export const SellerOnboarding: React.FC<SellerOnboardingProps> = ({ onComplete }) => {
  const { updateSellerOnboarding } = useAuth();
  const { language } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [heardCommand, setHeardCommand] = useState('');

  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);

  const currentStep = SELLER_STEPS[currentIndex];

  const getTitle = (s: StepData) => (language === 'hi' ? s.titleHi : language === 'te' ? s.titleTe : s.titleEn);
  const getSub = (s: StepData) => (language === 'hi' ? s.subHi : language === 'te' ? s.subTe : s.subEn);
  const getVoice = (s: StepData) => (language === 'hi' ? s.voiceHi : language === 'te' ? s.voiceTe : s.voiceEn);

  // Close and persist to storage
  const handleFinish = useCallback(async () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setIsListening(false);

    try {
      await updateSellerOnboarding(true);
      sessionStorage.setItem('kalatech_seen_seller_tour', 'true');
      sessionStorage.removeItem('open_seller_tutorial');
    } catch (err) {
      console.error('Error persisting seller onboarding:', err);
    }

    setIsVisible(false);
    onComplete?.();
  }, [updateSellerOnboarding, onComplete]);

  const handleSkip = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  const handleNextStep = useCallback(() => {
    if (currentIndex < SELLER_STEPS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentIndex, handleFinish]);

  const handlePrevStep = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Voice Command Recognition for "Next", "Back", "Skip"
  const startListeningForCommands = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript?.toLowerCase() || '';
        setHeardCommand(text);

        const isNext =
          text.includes('next') ||
          text.includes('continue') ||
          text.includes('agla') ||
          text.includes('aage') ||
          text.includes('taruvatha') ||
          text.includes('munduku');

        const isBack =
          text.includes('back') ||
          text.includes('previous') ||
          text.includes('peeche') ||
          text.includes('venukaku') ||
          text.includes('venuka');

        const isSkip =
          text.includes('skip') ||
          text.includes('stop') ||
          text.includes('chodo') ||
          text.includes('close') ||
          text.includes('vadiliveyi') ||
          text.includes('aapu');

        if (isNext) {
          handleNextStep();
        } else if (isBack) {
          handlePrevStep();
        } else if (isSkip) {
          handleSkip();
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [language, handleNextStep, handlePrevStep, handleSkip]);

  // Speech synthesis for current step
  const speakCurrent = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;

      if (language === 'hi') utterance.lang = 'hi-IN';
      else if (language === 'te') utterance.lang = 'te-IN';
      else utterance.lang = 'en-IN';

      utterance.rate = 0.93;
      utterance.pitch = 1.02;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setIsSpeaking(true);
        setAutoplayBlocked(false);
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        // Start listening for voice commands once assistant finishes speaking
        startListeningForCommands();
      };

      utterance.onerror = (e) => {
        console.warn('Speech error:', e);
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setAutoplayBlocked(true);
      };

      try {
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
      }
    },
    [language, startListeningForCommands]
  );

  // Play voice narration on step change
  useEffect(() => {
    speakCurrent(getVoice(currentStep));

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [currentIndex, currentStep, speakCurrent]);

  if (!isVisible) return null;

  // Step Visuals matching the 6-step tour
  const renderStepVisual = () => {
    switch (currentStep.id) {
      case 'welcome':
        return (
          <div className="p-6 bg-gradient-to-br from-amber-600/30 to-orange-700/30 rounded-2xl border-2 border-amber-400/40 text-center space-y-2">
            <span className="text-4xl block animate-bounce">👋</span>
            <h3 className="text-lg font-black text-amber-300 font-['Rozha_One',serif]">
              {getTitle(currentStep)}
            </h3>
            <p className="text-xs text-stone-200">{getSub(currentStep)}</p>
          </div>
        );

      case 'step1_add':
        return (
          <div className="p-5 bg-stone-900/90 rounded-2xl border-2 border-amber-400 flex items-center gap-4 text-left shadow-lg ring-4 ring-amber-400/20">
            <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
              <Camera className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
                Highlighted Action
              </span>
              <h4 className="text-sm font-black text-white">+ Add Handicraft Button</h4>
              <p className="text-xs text-stone-300 mt-0.5">
                Capture your craft directly with your phone camera
              </p>
            </div>
          </div>
        );

      case 'step2_voice':
        return (
          <div className="p-5 bg-stone-900/90 rounded-2xl border-2 border-amber-400 flex items-center gap-4 text-left shadow-lg ring-4 ring-amber-400/20">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Mic className="w-7 h-7 animate-ping" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
                Highlighted Input
              </span>
              <h4 className="text-sm font-black text-white">Voice Product Questionnaire</h4>
              <p className="text-xs text-stone-300 mt-0.5">
                Just speak your craft details — no typing required
              </p>
            </div>
          </div>
        );

      case 'step3_catalog':
        return (
          <div className="p-5 bg-stone-900/90 rounded-2xl border-2 border-amber-400 flex items-center gap-4 text-left shadow-lg ring-4 ring-amber-400/20">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-400 block">
                Highlighted Feature
              </span>
              <h4 className="text-sm font-black text-white">AI Craft Catalog Inspection</h4>
              <p className="text-xs text-stone-300 mt-0.5">
                Generates heritage stories and GI recognition in 3 languages
              </p>
            </div>
          </div>
        );

      case 'step4_pricing':
        return (
          <div className="p-4 bg-stone-900/90 rounded-2xl border-2 border-amber-400 space-y-2 shadow-lg ring-4 ring-amber-400/20">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-amber-400" /> Living Wage Fair Price
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-black">
                Backend Deterministic
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
              <div className="flex justify-between text-stone-300">
                <span>Raw Materials + Labor Hours + 25% Margin</span>
              </div>
              <div className="border-t border-white/10 pt-1 flex justify-between font-black text-amber-400 text-sm">
                <span>Fair Recommended Living Wage</span>
              </div>
            </div>
          </div>
        );

      case 'step5_billing':
        return (
          <div className="p-5 bg-stone-900/90 rounded-2xl border-2 border-amber-400 flex items-center gap-4 text-left shadow-lg ring-4 ring-amber-400/20">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block">
                Highlighted Feature
              </span>
              <h4 className="text-sm font-black text-white">Billing & Voice Price Explanation</h4>
              <p className="text-xs text-stone-300 mt-0.5">
                Listen to "🔊 Explain Fair Price" before finalizing invoices
              </p>
            </div>
          </div>
        );

      case 'step6_market':
        return (
          <div className="p-5 bg-stone-900/90 rounded-2xl border-2 border-amber-400 flex items-center gap-4 text-left shadow-lg ring-4 ring-amber-400/20">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-black tracking-wider text-blue-400 block">
                Highlighted Destination
              </span>
              <h4 className="text-sm font-black text-white">Direct Marketplace & Orders</h4>
              <p className="text-xs text-stone-300 mt-0.5">
                Receive orders directly from conscious buyers across India
              </p>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="p-6 bg-gradient-to-b from-emerald-600/30 to-teal-700/30 rounded-2xl border-2 border-emerald-400 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-black text-white font-['Rozha_One',serif]">
              {getTitle(currentStep)}
            </h3>
            <p className="text-xs text-emerald-200">{getSub(currentStep)}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Artisan Seller Voice Onboarding Tour"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-stone-900 to-black text-white rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden p-6 sm:p-7 flex flex-col items-center">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#9c4124] flex items-center justify-center text-white font-black text-xs">
              SS
            </div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {language === 'hi' ? 'कारीगर डिजिटल यात्रा' : language === 'te' ? 'కళాకారుల డిజిటల్ పర్యటన' : 'Artisan Journey Tour'}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span>Skip Tour</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Visual */}
        <div className="w-full py-1">
          {/* Progress dots for 6 numerical steps */}
          {currentStep.stepNum && (
            <div className="flex items-center justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div
                  key={num}
                  className={`transition-all duration-300 rounded-full ${
                    num === currentStep.stepNum
                      ? 'w-6 h-2 bg-amber-400 shadow-sm'
                      : num < (currentStep.stepNum || 0)
                      ? 'w-2 h-2 bg-amber-600'
                      : 'w-2 h-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="w-full max-w-sm mx-auto">{renderStepVisual()}</div>
        </div>

        {/* Spoken Text visible on-screen */}
        <div className="space-y-1.5 max-w-md px-2 text-center mt-3 w-full">
          <h2 className="text-base sm:text-lg font-extrabold text-white font-['Rozha_One',serif]">
            {getTitle(currentStep)}
          </h2>
          <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium">
            {getSub(currentStep)}
          </p>
          <div className="p-3 bg-black/50 rounded-2xl border border-amber-500/20 text-stone-200 text-xs leading-relaxed shadow-inner">
            "{getVoice(currentStep)}"
          </div>
        </div>

        {/* Audio / Voice Recognition Status */}
        <div className="mt-3 flex items-center justify-between w-full px-2 text-[11px] text-amber-300 font-semibold">
          <div className="flex items-center gap-1.5">
            {isSpeaking ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>Speaking in {language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}...</span>
              </>
            ) : isListening ? (
              <>
                <Mic className="w-4 h-4 text-emerald-400 animate-ping" />
                <span>Listening: say "Next", "Back", or "Skip"</span>
              </>
            ) : (
              <span>Voice commands active</span>
            )}
          </div>
          {heardCommand && (
            <span className="text-[10px] text-stone-400">Heard: "{heardCommand}"</span>
          )}
        </div>

        {/* Manual Navigation Buttons: Next, Back, Skip Tour */}
        <div className="w-full grid grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-white/10">
          <button
            onClick={handlePrevStep}
            disabled={currentIndex === 0}
            className={`py-3 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentIndex === 0
                ? 'bg-white/5 text-stone-600 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 text-stone-200 active:scale-98'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'hi' ? 'पीछे' : language === 'te' ? 'వెనుకకు' : 'Back'}</span>
          </button>

          <button
            onClick={handleSkip}
            className="py-3 px-3 rounded-2xl font-bold text-xs bg-white/10 hover:bg-white/20 text-stone-300 transition-all active:scale-98 cursor-pointer flex items-center justify-center"
          >
            <span>{language === 'hi' ? 'छोड़ें' : language === 'te' ? 'వదిలివేయి' : 'Skip Tour'}</span>
          </button>

          <button
            onClick={handleNextStep}
            className="py-3 px-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1"
          >
            <span>
              {currentIndex === SELLER_STEPS.length - 1
                ? language === 'hi' ? 'शुरू करें' : language === 'te' ? 'ప్రారంభించు' : 'Finish'
                : language === 'hi' ? 'अगला' : language === 'te' ? 'తరువాత' : 'Next'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
