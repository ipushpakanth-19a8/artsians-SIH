import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  Mic, 
  Sparkles, 
  Crop, 
  CheckCircle, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  ArrowRight, 
  Layers, 
  DollarSign, 
  ShoppingBag, 
  LayoutDashboard, 
  Globe 
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
    subEn: "Let's get your handmade products online.",
    subHi: 'आइए आपके हस्तनिर्मित उत्पादों को ऑनलाइन लाएं।',
    subTe: 'మీ చేతితో తయారు చేసిన ఉత్పత్తులను ఆన్‌లైన్‌లోకి తీసుకురండి.',
    voiceEn: 'Welcome to KALAtech. This quick tour will show you how to create and sell your handmade products online.',
    voiceHi: 'KALAtech में आपका स्वागत है। यह त्वरित दौरा आपको दिखाएगा कि अपने हस्तनिर्मित उत्पादों को ऑनलाइन कैसे बनाएं और बेचें।',
    voiceTe: 'KALAtech కు స్వాగతం. ఈ శీఘ్ర పర్యటన మీ చేతితో తయారు చేసిన ఉత్పత్తులను ఆన్‌లైన్‌లో ఎలా సృష్టించాలో మరియు విక్రయించాలో మీకు చూపుతుంది.',
    fallbackDurationMs: 6500,
  },
  {
    id: 'step1_capture',
    stepNum: 1,
    titleEn: 'Step 1: Add Your Product',
    titleHi: 'चरण 1: अपना उत्पाद जोड़ें',
    titleTe: 'దశ 1: మీ ఉత్పత్తిని జోడించండి',
    subEn: 'Start by taking a photo of your handmade product or describe it with your voice.',
    subHi: 'अपने हस्तनिर्मित उत्पाद की तस्वीर लें या अपनी आवाज से उसका विवरण दें।',
    subTe: 'మీ ఉత్పత్తి ఫోటో తీయండి లేదా మీ వాయిస్‌తో వివరించండి.',
    voiceEn: 'First, add your product by taking a clear photo or describing your product using your voice.',
    voiceHi: 'सबसे पहले, एक स्पष्ट तस्वीर लेकर या अपनी आवाज़ का उपयोग करके अपने उत्पाद का विवरण जोड़ें।',
    voiceTe: 'మొదట, స్పష్టమైన ఫోటో తీయడం ద్వారా లేదా మీ వాయిస్‌ని ఉపయోగించి మీ ఉత్పత్తిని జోడించండి.',
    fallbackDurationMs: 6500,
  },
  {
    id: 'step2_sharp',
    stepNum: 2,
    titleEn: 'Step 2: Improve Your Product Image',
    titleHi: 'चरण 2: उत्पाद छवि को बेहतर बनाएं',
    titleTe: 'దశ 2: ఉత్పత్తి ఫోటోను మెరుగుపరచండి',
    subEn: 'Our image processing system automatically prepares your product photo for the catalog.',
    subHi: 'हमारी प्रणाली कैटलॉग के लिए आपकी फ़ोटो को स्वचालित रूप से तैयार करती है।',
    subTe: 'మా ఇమేజ్ ప్రాసెసింగ్ సిస్టమ్ మీ ఫోటోను ఆటోమేటిక్‌గా సిద్ధం చేస్తుంది.',
    voiceEn: 'Your product image is automatically enhanced and optimized using Sharp, so it is ready for your online catalog.',
    voiceHi: 'आपकी उत्पाद छवि को शार्प तकनीक से स्वचालित रूप से सुधारा और अनुकूलित किया जाता है ताकि यह ऑनलाइन कैटलॉग के लिए तैयार हो।',
    voiceTe: 'మీ ఉత్పత్తి చిత్రం షార్ప్ ద్వారా ఆటోమేటిక్‌గా మెరుగుపరచబడుతుంది, తద్వారా ఇది ఆన్‌లైన్ కేటలాగ్‌కు సిద్ధంగా ఉంటుంది.',
    fallbackDurationMs: 7000,
  },
  {
    id: 'step3_gemini',
    stepNum: 3,
    titleEn: 'Step 3: Create Your Product Catalog',
    titleHi: 'चरण 3: उत्पाद कैटलॉग तैयार करें',
    titleTe: 'దశ 3: ఉత్పత్తి కేటలాగ్ సృష్టించండి',
    subEn: 'Gemini AI analyzes product photo and audio to craft a professional listing.',
    subHi: 'जेमिनी एआई विवरण, श्रेणी और सामग्री तैयार करता है जिसकी आप समीक्षा कर सकते हैं।',
    subTe: 'జెమిని AI మీ ఉత్పత్తిని విశ్లేషించి పేరు, వివరణ మరియు వివరాలను సృష్టిస్తుంది.',
    voiceEn: 'Gemini AI analyzes your product and creates a product catalog with a name, description, category, material and other useful details.',
    voiceHi: 'जेमिनी एआई आपके उत्पाद का विश्लेषण करता है और नाम, विवरण, श्रेणी, सामग्री और अन्य उपयोगी विवरणों के साथ कैटलॉग बनाता है।',
    voiceTe: 'జెమిని AI మీ ఉత్పత్తిని విశ్లేషించి పేరు, వివరణ, వర్గం, మెటీరియల్ మరియు ఇతర వివరాలతో కేటలాగ్‌ను సృష్టిస్తుంది.',
    fallbackDurationMs: 7500,
  },
  {
    id: 'step4_pricing',
    stepNum: 4,
    titleEn: 'Step 4: Get a Fair Price',
    titleHi: 'चरण 4: उचित मूल्य प्राप्त करें',
    titleTe: 'దశ 4: సరసమైన ధరను పొందండి',
    subEn: 'Material Cost + Labour Cost + Profit Margin + Market Comps = Fair Price.',
    subHi: 'सामग्री + मजदूरी + लाभ मार्जिन = अनुशंसित उचित मूल्य।',
    subTe: 'మెటీరియల్ + శ్రమ + లాభం = సిఫార్సు చేసిన సరసమైన ధర.',
    voiceEn: 'Our pricing system calculates a fair recommended price using your material cost, labour, profit margin and available market information.',
    voiceHi: 'हमारी मूल्य निर्धारण प्रणाली आपकी सामग्री लागत, श्रम, लाभ मार्जिन और बाजार जानकारी का उपयोग करके एक उचित अनुशंसित मूल्य की गणना करती है।',
    voiceTe: 'మా ధరల వ్యవస్థ మీ మెటీరియల్ ఖర్చు, శ్రమ, లాభం మరియు మార్కెట్ సమాచారాన్ని ఉపయోగించి సరసమైన సిఫార్సు ధరను లెక్కిస్తుంది.',
    fallbackDurationMs: 7500,
  },
  {
    id: 'step5_approval',
    stepNum: 5,
    titleEn: 'Step 5: Review and Approve',
    titleHi: 'चरण 5: समीक्षा करें और स्वीकृत करें',
    titleTe: 'దశ 5: సమీక్షించి ఆమోదించండి',
    subEn: 'You retain 100% control. Edit any detail before approving.',
    subHi: 'अंतिम नियंत्रण आपका है। स्वीकृति से पहले किसी भी विवरण को संपादित करें।',
    subTe: 'తుది నిర్ణయం మీదే. ఆమోదించే ముందు ఏదైనా వివరాలను సవరించండి.',
    voiceEn: 'Before publishing, you can review the AI-generated catalog and recommended price. You can edit anything and approve the final product yourself.',
    voiceHi: 'प्रकाशित करने से पहले, आप एआई-जनरेटेड कैटलॉग और अनुशंसित मूल्य की समीक्षा कर सकते हैं। आप कुछ भी संपादित कर सकते हैं और स्वयं अंतिम उत्पाद को स्वीकृत कर सकते हैं।',
    voiceTe: 'ప్రచురించే ముందు, మీరు కేటలాగ్ మరియు సిఫార్సు చేసిన ధరను సమీక్షించవచ్చు. మీరు దేనినైనా సవరించవచ్చు మరియు తుది ఉత్పత్తిని మీరే ఆమోదించవచ్చు.',
    fallbackDurationMs: 7500,
  },
  {
    id: 'step6_publish',
    stepNum: 6,
    titleEn: 'Step 6: Publish Your Product',
    titleHi: 'चरण 6: अपना उत्पाद प्रकाशित करें',
    titleTe: 'దశ 6: మీ ఉత్పత్తిని ప్రచురించండి',
    subEn: 'Approved craft goes live directly for buyers across the marketplace.',
    subHi: 'स्वीकृत उत्पाद सीधे बाजार में खरीदारों के लिए लाइव हो जाता है।',
    subTe: 'ఆమోదించబడిన ఉత్పత్తి మార్కెట్‌లో కొనుగోలుదారుల కోసం నేరుగా అందుబాటులోకి వస్తుంది.',
    voiceEn: 'Once you approve your product, it can be published to the marketplace where buyers can discover it.',
    voiceHi: 'एक बार जब आप अपने उत्पाद को मंजूरी दे देते हैं, तो इसे उस बाज़ार में प्रकाशित किया जा सकता है जहाँ खरीदार इसे खोज सकते हैं।',
    voiceTe: 'మీరు మీ ఉత్పత్తిని ఆమోదించిన తర్వాత, కొనుగోలుదారులు దీనిని కనుగొనగలిగే మార్కెట్‌ప్లేస్‌లో ప్రచురించవచ్చు.',
    fallbackDurationMs: 6500,
  },
  {
    id: 'step7_government',
    stepNum: 7,
    titleEn: 'Reach More Buyers',
    titleHi: 'अधिक खरीदारों तक पहुंचें',
    titleTe: 'ఎక్కువ మంది కొనుగోలుదారులను చేరుకోండి',
    subEn: 'Export-ready schemas for national ecosystems like GeM and ONDC.',
    subHi: 'GeM और ONDC जैसे राष्ट्रीय डिजिटल व्यापार पारिस्थितिकी तंत्र के लिए तैयार।',
    subTe: 'GeM మరియు ONDC వంటి పెద్ద డిజిటల్ వాణిజ్య వేదికలకు సిద్ధం కావడం.',
    voiceEn: 'KALAtech is designed to help make artisan products marketplace-ready and support connections with larger digital commerce ecosystems such as GeM and ONDC, subject to their onboarding and integration requirements.',
    voiceHi: 'KALAtech कारीगर उत्पादों को बाज़ार के लिए तैयार बनाने और GeM और ONDC जैसे बड़े डिजिटल वाणिज्य नेटवर्क से जोड़ने में सहायता के लिए डिज़ाइन किया गया है।',
    voiceTe: 'KALAtech కళాకారుల ఉత్పత్తులను మార్కెట్-సిద్ధం చేయడానికి మరియు GeM మరియు ONDC వంటి పెద్ద డిజిటల్ వాణిజ్య పర్యావరణ వ్యవస్థలతో కనెక్షన్‌లను సులభతరం చేయడానికి రూపొందించబడింది.',
    fallbackDurationMs: 8500,
  },
  {
    id: 'step8_dashboard',
    stepNum: 8,
    titleEn: 'Your Seller Dashboard',
    titleHi: 'आपकी दुकान का डैशबोर्ड',
    titleTe: 'మీ సెల్లర్ డాష్‌బోర్డ్',
    subEn: 'Manage products, inventory, bills, prices, and orders in one place.',
    subHi: 'उत्पाद, मूल्य, बिल और ग्राहक ऑर्डर सब एक ही स्थान पर प्रबंधित करें।',
    subTe: 'ఉత్పత్తులు, ధరలు, బిల్లులు మరియు ఆర్డర్‌లను ఒకే చోట నిర్వహించండి.',
    voiceEn: 'From your seller dashboard, you can manage your products, catalogs, prices and orders in one place.',
    voiceHi: 'अपने विक्रेता डैशबोर्ड से, आप अपने उत्पादों, कैटलॉग, कीमतों और ऑर्डरों को एक ही स्थान पर प्रबंधित कर सकते हैं।',
    voiceTe: 'మీ సెల్లర్ డాష్‌బోర్డ్ నుండి, మీరు మీ ఉత్పత్తులు, కేటలాగ్‌లు, ధరలు మరియు ఆర్డర్‌లను ఒకే చోట నిర్వహించవచ్చు.',
    fallbackDurationMs: 6500,
  },
  {
    id: 'ready',
    titleEn: "You're Ready!",
    titleHi: 'आप पूरी तरह तैयार हैं!',
    titleTe: 'మీరు సిద్ధంగా ఉన్నారు!',
    subEn: 'Turn your craft into a digital business.',
    subHi: 'अपने पारंपरिक शिल्प को एक सफल डिजिटल व्यवसाय में बदलें।',
    subTe: 'మీ సాంప్రదాయ కళను డిజిటల్ వ్యాపారంగా మార్చండి.',
    voiceEn: "You're all set. Add your first product and start reaching more customers.",
    voiceHi: 'आप पूरी तरह तैयार हैं। अपना पहला उत्पाद जोड़ें और अधिक ग्राहकों तक पहुंचना शुरू करें।',
    voiceTe: 'మీరు సిద్ధంగా ఉన్నారు. మీ మొదటి ఉత్పత్తిని జోడించి, ఎక్కువ మంది కస్టమర్‌లను చేరుకోవడం ప్రారంభించండి.',
    fallbackDurationMs: 3500,
  },
];

interface SellerOnboardingProps {
  onComplete?: () => void;
}

export const SellerOnboarding: React.FC<SellerOnboardingProps> = ({ onComplete }) => {
  const { user, updateSellerOnboarding } = useAuth();
  const { language } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);

  const currentStep = SELLER_STEPS[currentIndex];

  // Get text for current language
  const getTitle = (s: StepData) => (language === 'hi' ? s.titleHi : language === 'te' ? s.titleTe : s.titleEn);
  const getSub = (s: StepData) => (language === 'hi' ? s.subHi : language === 'te' ? s.subTe : s.subEn);
  const getVoice = (s: StepData) => (language === 'hi' ? s.voiceHi : language === 'te' ? s.voiceTe : s.voiceEn);

  // Close and persist to DB
  const handleFinish = useCallback(async () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    isSpeakingRef.current = false;
    setIsSpeaking(false);

    try {
      await updateSellerOnboarding(true);
    } catch (err) {
      console.error('Error persisting seller onboarding:', err);
    }

    setIsVisible(false);
    onComplete?.();
  }, [updateSellerOnboarding, onComplete]);

  // Handle Skip Tour (Step 13)
  const handleSkip = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  // Move to next step
  const handleNextStep = useCallback(() => {
    if (currentIndex < SELLER_STEPS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentIndex, handleFinish]);

  // Speech engine
  const speakCurrent = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (isMuted || !text.trim()) {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;

      if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (language === 'te') {
        utterance.lang = 'te-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      utterance.rate = 0.93;
      utterance.pitch = 1.05;

      let started = false;

      utterance.onstart = () => {
        started = true;
        isSpeakingRef.current = true;
        setIsSpeaking(true);
        setAutoplayBlocked(false);
      };

      // When voice explanation finishes -> automatically advance (Step 12)
      utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setTimeout(() => {
          handleNextStep();
        }, 600);
      };

      utterance.onerror = (e) => {
        console.warn('Seller speech error event:', e);
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        if (!started) {
          setAutoplayBlocked(true);
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        // Detect if autoplay was suspended without firing onstart
        setTimeout(() => {
          if (!started && window.speechSynthesis.speaking === false) {
            setAutoplayBlocked(true);
          }
        }, 800);
      } catch (err) {
        setAutoplayBlocked(true);
      }
    },
    [isMuted, language, handleNextStep]
  );

  // Trigger speech when step changes
  useEffect(() => {
    if (!isVisible) return;
    const voiceText = getVoice(currentStep);

    speakCurrent(voiceText);

    // Fallback timer in case speech synthesis is unavailable or blocked
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = setTimeout(() => {
      if (!isSpeakingRef.current) {
        handleNextStep();
      }
    }, currentStep.fallbackDurationMs);

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [currentIndex, isVisible]);

  // Tap-anywhere listener to enable voice if blocked (Step 2)
  useEffect(() => {
    const handleGesture = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        if (autoplayBlocked) {
          setAutoplayBlocked(false);
          speakCurrent(getVoice(currentStep));
        }
      }
    };
    window.addEventListener('pointerdown', handleGesture, { passive: true });
    window.addEventListener('keydown', handleGesture, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, [autoplayBlocked, currentStep, speakCurrent]);

  // Keyboard Escape to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  if (!isVisible) return null;

  // Render diagram/visual per step
  const renderStepVisual = () => {
    switch (currentStep.id) {
      case 'welcome':
        return (
          <div className="p-6 bg-gradient-to-b from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#9c4124] to-amber-600 flex items-center justify-center text-white text-3xl shadow-lg mb-3">
              🤝
            </div>
            <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
              Artisan Saathi • KALAtech
            </span>
            <p className="text-xs text-stone-300 text-center mt-2 max-w-xs">
              Personal Virtual Business Assistant for Traditional Indian Craftspeople
            </p>
          </div>
        );

      case 'step1_capture':
        return (
          <div className="grid grid-cols-2 gap-3 p-4 bg-stone-900/80 rounded-2xl border border-amber-500/30">
            <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl border border-white/10 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-2">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Camera Photo</span>
              <span className="text-[10px] text-stone-400">Snap craft on smartphone</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl border border-white/10 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Voice Note</span>
              <span className="text-[10px] text-stone-400">Describe in your mother tongue</span>
            </div>
          </div>
        );

      case 'step2_sharp':
        return (
          <div className="p-4 bg-stone-900/80 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="px-2 py-1 rounded bg-stone-800 border border-stone-700">Raw Photo</span>
              <span className="text-amber-400 font-bold">➔ Sharp Pipeline ➔</span>
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">1080p Studio Crop</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] text-stone-300 pt-1">
              <span className="p-1.5 rounded bg-white/5">Auto-Crop</span>
              <span className="p-1.5 rounded bg-white/5">1:1 Square</span>
              <span className="p-1.5 rounded bg-white/5">Studio Light</span>
              <span className="p-1.5 rounded bg-white/5">Compress</span>
            </div>
          </div>
        );

      case 'step3_gemini':
        return (
          <div className="p-4 bg-stone-900/80 rounded-2xl border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Gemini 2.5 Multimodal AI Catalog Engine</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left text-[11px] text-stone-300">
              <div className="p-2 rounded bg-white/5 border border-white/10">✓ Title & Cultural Story</div>
              <div className="p-2 rounded bg-white/5 border border-white/10">✓ Traditional Motifs</div>
              <div className="p-2 rounded bg-white/5 border border-white/10">✓ Material & Dimensions</div>
              <div className="p-2 rounded bg-white/5 border border-white/10">✓ GI Tag Heritage Check</div>
            </div>
            <p className="text-[10px] text-amber-200/80 italic text-center pt-1">
              *You can freely edit all AI-generated text before publishing
            </p>
          </div>
        );

      case 'step4_pricing':
        return (
          <div className="p-4 bg-stone-900/80 rounded-2xl border border-amber-500/30 space-y-2 text-xs">
            <div className="bg-white/5 p-2.5 rounded-xl space-y-1 text-stone-300">
              <div className="flex justify-between">
                <span>Material Cost:</span>
                <span className="font-mono text-white font-bold">₹500</span>
              </div>
              <div className="flex justify-between">
                <span>Labour Hours (Fair Wage):</span>
                <span className="font-mono text-white font-bold">₹300</span>
              </div>
              <div className="flex justify-between">
                <span>Profit Margin:</span>
                <span className="font-mono text-white font-bold">₹200</span>
              </div>
              <div className="border-t border-white/20 pt-1 flex justify-between font-bold text-amber-400">
                <span>Recommended Fair Price:</span>
                <span className="font-mono text-base">₹1,000</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 text-center">
              (Recommendation only — you always set the final price)
            </p>
          </div>
        );

      case 'step5_approval':
        return (
          <div className="p-4 bg-stone-900/80 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-white">100% Artisan Control</h4>
              <p className="text-[11px] text-stone-300 leading-snug">
                Review photos, descriptions, and prices. Edit anything you wish and click Approve.
              </p>
            </div>
          </div>
        );

      case 'step6_publish':
        return (
          <div className="p-4 bg-stone-900/80 rounded-2xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-200">
              <span className="flex items-center gap-1.5 font-bold">
                <ShoppingBag className="w-4 h-4 text-emerald-400" /> Live Marketplace
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[10px]">
                0% Middleman Cuts
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-stone-300 text-left">
              Direct B2C listings, phone & WhatsApp contact, and fair buyer transactions.
            </div>
          </div>
        );

      case 'step7_government':
        return (
          <div className="p-4 bg-stone-900/80 rounded-2xl border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>National Marketplace Standards</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-stone-300">
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <span className="font-bold text-white block text-xs">GeM Export</span>
                Government e-Marketplace compliant schema
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <span className="font-bold text-white block text-xs">ONDC Network</span>
                Open Network for Digital Commerce ready
              </div>
            </div>
          </div>
        );

      case 'step8_dashboard':
        return (
          <div className="p-4 bg-stone-900/80 rounded-2xl border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>All-In-One Artisan Studio</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] text-stone-300">
              <span className="p-1.5 rounded bg-white/5">📦 Orders</span>
              <span className="p-1.5 rounded bg-white/5">📄 Bills</span>
              <span className="p-1.5 rounded bg-white/5">📈 Earnings</span>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="p-6 bg-gradient-to-b from-emerald-600/20 to-teal-700/20 rounded-2xl border border-emerald-400/40 flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transform scale-110">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-black text-white font-['Rozha_One',serif]">
              {language === 'hi' ? 'आप पूरी तरह तैयार हैं!' : language === 'te' ? 'మీరు సిద్ధంగా ఉన్నారు!' : "You're All Set!"}
            </h3>
            <p className="text-xs text-emerald-200 max-w-xs font-medium">
              {language === 'hi'
                ? 'विक्रेता डैशबोर्ड खुल रहा है...'
                : language === 'te'
                ? 'సెల్లర్ డాష్‌బోర్డ్ తెరవబడుతోంది...'
                : 'Opening your seller dashboard now...'}
            </p>
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
      aria-label="Artisan Seller Voice Onboarding Tutorial"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-stone-900 to-black text-white rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col items-center">
        {/* Top bar with branding & Skip Tour button (Step 13) */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#9c4124] flex items-center justify-center text-white font-black text-xs">
              SS
            </div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {language === 'hi' ? 'कारीगर प्रशिक्षण' : language === 'te' ? 'కళాకారుల శిక్షణ' : 'Artisan Tour'}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Skip Tour and open seller dashboard"
          >
            <span>Skip Tour</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Visual Presentation */}
        <div className="w-full py-2">
          {/* Progress dots for the 8 numerical steps */}
          {currentStep.stepNum && (
            <div className="flex items-center justify-center gap-1.5 mb-3" role="progressbar">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div
                  key={num}
                  className={`transition-all duration-300 rounded-full ${
                    num === currentStep.stepNum
                      ? 'w-5 h-1.5 bg-amber-400 shadow-xs'
                      : num < (currentStep.stepNum || 0)
                      ? 'w-1.5 h-1.5 bg-amber-600'
                      : 'w-1.5 h-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="w-full max-w-sm mx-auto">{renderStepVisual()}</div>
        </div>

        {/* Spoken text visible on-screen (Accessibility & Low Literacy) */}
        <div className="space-y-1.5 max-w-md px-2 text-center mt-3">
          <h2 className="text-base sm:text-lg font-extrabold text-white font-['Rozha_One',serif]">
            {getTitle(currentStep)}
          </h2>
          <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium">
            {getSub(currentStep)}
          </p>
          <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-stone-200 text-xs leading-relaxed shadow-inner">
            "{getVoice(currentStep)}"
          </div>
        </div>

        {/* Autoplay blocked banner (Graceful Fallback) */}
        {autoplayBlocked && !isMuted && (
          <div
            onClick={() => {
              setAutoplayBlocked(false);
              speakCurrent(getVoice(currentStep));
            }}
            className="mt-3 animate-bounce inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Voice guidance ready — tap anywhere to enable sound.</span>
          </div>
        )}

        {/* Status indicator */}
        <div className="mt-4 text-[11px] text-stone-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>
            {currentIndex === 0
              ? 'Starting tour...'
              : currentIndex === SELLER_STEPS.length - 1
              ? 'Entering Seller Dashboard...'
              : 'Auto-advancing on voice completion...'}
          </span>
        </div>
      </div>
    </div>
  );
};
