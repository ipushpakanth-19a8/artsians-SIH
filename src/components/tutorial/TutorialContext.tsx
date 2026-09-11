import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../lib/LanguageContext';
import { speakText } from '../../lib/i18n';

export interface TutorialMission {
  level: number;
  id: string;
  titleEn: string;
  titleHi: string;
  titleTe: string;
  saathiEn: string;
  saathiHi: string;
  saathiTe: string;
  targetId: string;
  expectedRoute: string;
  points: number;
  badge?: {
    id: string;
    titleEn: string;
    titleHi: string;
    titleTe: string;
    icon: string;
    desc: string;
  };
}

export const TUTORIAL_MISSIONS: TutorialMission[] = [
  {
    level: 1,
    id: 'meet-shop',
    titleEn: 'Level 1: Meet Your Shop',
    titleHi: 'लेवल 1: अपनी दुकान से मिलें',
    titleTe: 'లెవల్ 1: మీ దుకాణాన్ని తెలుసుకోండి',
    saathiEn: '👋 Hi! I am Artisan Saathi. Welcome to your shop dashboard! 🏠 Home takes you back here • 🛍️ Products shows what you sell • 📦 Orders manages purchases • 💰 Earnings shows business growth.',
    saathiHi: '👋 नमस्ते! मैं कला साथी हूँ। आपकी दुकान में स्वागत है! 🏠 होम आपको यहाँ वापस लाता है • 🛍️ उत्पाद आपकी बिक्री दिखाता है • 📦 ऑर्डर्स ग्राहक खरीद प्रबंधित करता है • 💰 कमाई व्यापार की बढ़त दिखाती है।',
    saathiTe: '👋 నమస్కారం! నేను కళా సాథీ. మీ దుకాణానికి స్వాగతం! 🏠 హోమ్ ఇక్కడికి తెస్తుంది • 🛍️ ఉత్పత్తులు మీ సరుకును చూపుతాయి • 📦 ఆర్డర్లు కొనుగోళ్లను నిర్వహిస్తాయి • 💰 ఆదాయం వృద్ధిని చూపుతుంది.',
    targetId: 'dashboard-snapshot',
    expectedRoute: '/seller',
    points: 10,
  },
  {
    level: 2,
    id: 'add-product',
    titleEn: 'Level 2: Add Your First Product',
    titleHi: 'लेवल 2: पहला उत्पाद जोड़ें',
    titleTe: 'లెవల్ 2: మొదటి ఉత్పత్తిని జోడించండి',
    saathiEn: 'Every digital shop starts with its first product! Tap "+ Add Product" to begin our guided listing wizard.',
    saathiHi: 'हर डिजिटल दुकान पहले उत्पाद से शुरू होती है! हमारे 4-चरणीय विज़ार्ड को शुरू करने के लिए "+ नया उत्पाद जोड़ें" पर टैप करें।',
    saathiTe: 'ప్రతి డిజిటల్ దుకాణం మొదటి ఉత్పత్తితోనే ప్రారంభమవుతుంది! "+ ఉత్పత్తిని జోడించండి" పై నొక్కండి.',
    targetId: 'action-add-product',
    expectedRoute: '/seller',
    points: 10,
    badge: {
      id: 'first-product',
      titleEn: 'First Product',
      titleHi: 'पहला उत्पाद',
      titleTe: 'మొదటి ఉత్పత్తి',
      icon: '🏅',
      desc: 'Started your digital craft catalog.',
    },
  },
  {
    level: 3,
    id: 'take-photo',
    titleEn: 'Level 3: Take a Product Photo',
    titleHi: 'लेवल 3: उत्पाद की फ़ोटो लें',
    titleTe: 'లెవల్ 3: ఉత్పత్తి ఫోటో తీయండి',
    saathiEn: '📸 Take a clear photo of your craft. Tips: ✓ Good lighting ✓ Keep centered ✓ Avoid busy background ✓ Show whole craft. Tap "Handwoven Kalamkari Saree" below to test with an example product!',
    saathiHi: '📸 अपने शिल्प की साफ़ फ़ोटो लें। सुझाव: ✓ अच्छी रोशनी ✓ उत्पाद बीच में रखें ✓ साफ़ पृष्ठभूमि ✓ पूरा शिल्प दिखाएं। उदाहरण उत्पाद से जांचने के लिए नीचे "कलमकारी साड़ी" पर टैप करें!',
    saathiTe: '📸 మీ చేతివృత్తి వస్తువు ఫోటో తీయండి. సూచనలు: ✓ మంచి వెలుతురు ✓ మధ్యలో ఉంచండి ✓ స్పష్టమైన నేపథ్యం. నమూనా కోసం క్రింది "కలంకారీ చీర" పై నొక్కండి!',
    targetId: 'photo-preset-sample',
    expectedRoute: '/seller/add',
    points: 15,
    badge: {
      id: 'photo-pro',
      titleEn: 'Photo Pro',
      titleHi: 'फ़ोटो प्रो',
      titleTe: 'ఫోటో ప్రో',
      icon: '📸',
      desc: 'Mastered taking and uploading craft product photos.',
    },
  },
  {
    level: 4,
    id: 'ai-studio',
    titleEn: 'Level 4: AI Photo Studio',
    titleHi: 'लेवल 4: AI फ़ोटो स्टूडियो',
    titleTe: 'లెవల్ 4: AI ఫోటో స్టూడియో',
    saathiEn: '✨ I will help make your photo look professional. Look at Before ➔ After: background cleaned and studio lighting balanced. Tap "Approve Enhanced Photo ✨".',
    saathiHi: '✨ मैं आपकी फ़ोटो को स्टूडियो जैसी बनाऊंगा। पहले और बाद में देखें: पृष्ठभूमि साफ़ और सही रोशनी। "Approve Enhanced Photo" पर टैप करें।',
    saathiTe: '✨ నేను మీ ఫోటోను ప్రొఫెషనల్‌గా మారుస్తాను. బిఫోర్ ➔ ఆఫ్టర్ చూడండి. "Approve Enhanced Photo" పై నొక్కండి.',
    targetId: 'ai-studio-compare',
    expectedRoute: '/seller/add',
    points: 15,
  },
  {
    level: 5,
    id: 'craft-story',
    titleEn: 'Level 5: Create Your Listing',
    titleHi: 'लेवल 5: उत्पाद विवरण तैयार करें',
    titleTe: 'లెవల్ 5: ఉత్పత్తి వివరాలు రూపొందించండి',
    saathiEn: '✍️ You do not need to write everything yourself! AI created your product name, description, materials, and heritage story. You are always in control. Tap "Continue to Story".',
    saathiHi: '✍️ आपको सब कुछ खुद लिखने की ज़रूरत नहीं है! AI ने नाम, विवरण, सामग्री और विरासत कहानी तैयार कर दी है। नियंत्रण हमेशा आपका है। "Continue" पर टैप करें।',
    saathiTe: '✍️ మీరు అంతా స్వయంగా రాయాల్సిన అవసరం లేదు! AI పేరు, వివరణ, పదార్థాలు మరియు కథనాన్ని రూపొందించింది. "Continue" పై నొక్కండి.',
    targetId: 'ai-craft-attributes',
    expectedRoute: '/seller/add',
    points: 20,
    badge: {
      id: 'storyteller',
      titleEn: 'Storyteller',
      titleHi: 'शिल्प कथाकार',
      titleTe: 'కథకుడు',
      icon: '✍️',
      desc: 'Created an authentic heritage story for digital buyers.',
    },
  },
  {
    level: 6,
    id: 'fair-pricing',
    titleEn: 'Level 6: Find a Fair Price',
    titleHi: 'लेवल 6: उचित मूल्य तय करें',
    titleTe: 'లెవల్ 6: సరసమైన ధర తెలుసుకోండి',
    saathiEn: '💰 Price Mission: Material Cost + Your Time + Packaging + Profit = Suggested Range ₹1,100 – ₹1,350 (Recommended: ₹1,249). This is a suggestion, not fixed. You decide what your craft is worth!',
    saathiHi: '💰 मूल्य मिशन: सामग्री लागत + आपका समय + पैकेजिंग + मुनाफ़ा = सुझाई गई सीमा ₹1,100 – ₹1,350 (अनुशंसित: ₹1,249)। यह एक सुझाव है, तयशुदा नहीं। आप तय करते हैं कि आपके शिल्प का मूल्य क्या है!',
    saathiTe: '💰 ధర మిషన్: మెటీరియల్ + శ్రమ + ప్యాకేజింగ్ + లాభం = సిఫార్సు చేసిన ధర ₹1,249. ఇది ఒక సలహా మాత్రమే, మీ శ్రమ విలువను మీరే నిర్ణయిస్తారు!',
    targetId: 'ai-price-box',
    expectedRoute: '/seller/add',
    points: 20,
    badge: {
      id: 'smart-seller',
      titleEn: 'Smart Seller',
      titleHi: 'स्मार्ट विक्रेता',
      titleTe: 'స్మార్ట్ సెల్లర్',
      icon: '💰',
      desc: 'Learned living-wage transparent cost calculation.',
    },
  },
  {
    level: 7,
    id: 'publish-product',
    titleEn: 'Level 7: Publish Your Product',
    titleHi: 'लेवल 7: उत्पाद बाज़ार में प्रकाशित करें',
    titleTe: 'లెవల్ 7: ఉత్పత్తిని ప్రచురించండి',
    saathiEn: '🎉 Your product is ready for customers! Review your photo, name, and price, then tap "Publish Product to Marketplace 🚀" to launch it in your online shop.',
    saathiHi: '🎉 आपका उत्पाद ग्राहकों के लिए तैयार है! फ़ोटो, नाम और मूल्य देखकर "Publish Product to Marketplace" पर टैप करें।',
    saathiTe: '🎉 మీ ఉత్పత్తి సిద్ధమైంది! సమీక్షించి, "Publish Product to Marketplace" పై నొక్కండి.',
    targetId: 'publish-product-btn',
    expectedRoute: '/seller/add',
    points: 50,
    badge: {
      id: 'digital-seller',
      titleEn: 'Digital Seller',
      titleHi: 'डिजिटल विक्रेता',
      titleTe: 'డిజిటల్ సెల్లర్',
      icon: '🛍️',
      desc: 'Published your first authentic craft product to the marketplace.',
    },
  },
  {
    level: 8,
    id: 'explore-orders',
    titleEn: 'Level 8: Manage Customer Orders',
    titleHi: 'लेवल 8: ग्राहक ऑर्डर्स प्रबंधित करें',
    titleTe: 'లెవల్ 8: ఆర్డర్ల నిర్వహణ',
    saathiEn: '📦 When customers buy from you, manage orders here: New ➔ Confirmed ➔ Preparing ➔ Shipped ➔ Delivered. You keep 100% of your earnings with zero commission!',
    saathiHi: '📦 जब ग्राहक आपसे खरीदेंगे, तो यहाँ से संभालें: नया ➔ पुष्ट ➔ तैयारी ➔ भेजा गया ➔ पहुँचाया गया। शून्य कमीशन के साथ पूरी कमाई आपकी है!',
    saathiTe: '📦 కొనుగోలుదారులు ఆర్డర్ చేసినప్పుడు, ఈ 6 దశల ద్వారా నిర్వహించండి. ఎటువంటి కమిషన్ లేకుండా పూర్తి ఆదాయం మీకే చేరుతుంది!',
    targetId: 'order-timeline-card',
    expectedRoute: '/seller/orders',
    points: 20,
    badge: {
      id: 'order-ready',
      titleEn: 'Order Ready',
      titleHi: 'ऑर्डर रेडी',
      titleTe: 'ఆర్డర్ రెడీ',
      icon: '📦',
      desc: 'Learned how to pack, track, and ship direct customer orders.',
    },
  },
  {
    level: 9,
    id: 'check-earnings',
    titleEn: 'Level 9: Check Your Earnings',
    titleHi: 'लेवल 9: अपनी कमाई और व्यापार देखें',
    titleTe: 'లెవల్ 9: మీ ఆదాయం తనిఖీ చేయండి',
    saathiEn: '💰 This is where you see your business growing! Track total sales, estimated profit, and direct bank settlements. Everything you earn is 100% yours. Tap "Got It / Next" to complete your journey!',
    saathiHi: '💰 यहाँ आप अपने व्यापार को बढ़ते हुए देख सकते हैं! कुल बिक्री, मुनाफ़ा और बैंक खाते में सीधी रकम ट्रैक करें। यात्रा पूरी करने के लिए "Got It / Next" पर टैप करें!',
    saathiTe: '💰 మీ వ్యాపార వృద్ధిని ఇక్కడ చూడవచ్చు! అమ్మకాలు, లాభం మరియు బ్యాంకు ఖాతా వివరాలు ఇక్కడ ఉంటాయి. యాత్ర పూర్తి చేయడానికి "Got It / Next" పై నొక్కండి!',
    targetId: 'earnings-summary-card',
    expectedRoute: '/seller/sales',
    points: 25,
    badge: {
      id: 'artisan-star',
      titleEn: 'Artisan Star',
      titleHi: 'कारीगर सितारा',
      titleTe: 'కళా స్టార్',
      icon: '🏆',
      desc: 'Completed the entire Artisan Journey onboarding.',
    },
  },
];

interface TutorialContextType {
  isActive: boolean;
  isPaused: boolean;
  currentLevel: number;
  currentMission: TutorialMission;
  journeyPoints: number;
  unlockedBadges: string[];
  activeTarget: string | null;
  showWelcomeModal: boolean;
  openWelcomeModal: () => void;
  showRewardModal: { title: string; points: number; badge?: any } | null;
  showCompletionModal: boolean;
  returningBanner: boolean;
  dismissReturningBanner: () => void;
  startJourney: () => void;
  startDemoJourney: () => void;
  pauseJourney: () => void;
  resumeJourney: () => void;
  skipJourney: () => void;
  nextLevel: () => void;
  prevLevel: () => void;
  completeCurrentMission: () => void;
  resetJourney: () => void;
  closeWelcomeModal: () => void;
  closeRewardModal: () => void;
  closeCompletionModal: () => void;
  showMe: (missionId?: string) => void;
  listenCurrentMission: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const STORAGE_KEY = 'shilpsetu_artisan_journey_state';

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [journeyPoints, setJourneyPoints] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState<{ title: string; points: number; badge?: any } | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [returningBanner, setReturningBanner] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentLevel) setCurrentLevel(parsed.currentLevel);
        if (parsed.journeyPoints) setJourneyPoints(parsed.journeyPoints);
        if (parsed.unlockedBadges) setUnlockedBadges(parsed.unlockedBadges);
        if (parsed.isActive !== undefined) setIsActive(parsed.isActive);
        if (parsed.isPaused !== undefined) setIsPaused(parsed.isPaused);

        // If user returned halfway through (e.g. Level 2 to 9) and journey is not active, greet them!
        if (parsed.currentLevel > 1 && parsed.currentLevel <= TUTORIAL_MISSIONS.length && !parsed.isActive) {
          setReturningBanner(true);
        }
      } else {
        // First login welcome
        if (location.pathname.startsWith('/seller')) {
          setShowWelcomeModal(true);
        }
      }
    } catch {}
  }, []);

  // Listen for navigation into /seller: if user has no saved journey and is not in journey, show welcome
  useEffect(() => {
    if (location.pathname.startsWith('/seller')) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved && !isActive && !showWelcomeModal) {
          setShowWelcomeModal(true);
        }
      } catch {}
    }
  }, [location.pathname, isActive, showWelcomeModal]);

  // Persist state updates
  useEffect(() => {
    try {
      const state = {
        isActive,
        isPaused,
        currentLevel,
        journeyPoints,
        unlockedBadges,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [isActive, isPaused, currentLevel, journeyPoints, unlockedBadges]);

  const currentMission = TUTORIAL_MISSIONS.find((m) => m.level === currentLevel) || TUTORIAL_MISSIONS[0];
  const activeTarget = isActive && !isPaused ? currentMission.targetId : null;

  // Sync route if tutorial active
  useEffect(() => {
    if (isActive && !isPaused) {
      if (location.pathname !== currentMission.expectedRoute) {
        // If mission expects another route, navigate user there smoothly
        navigate(currentMission.expectedRoute);
      }
    }
  }, [isActive, isPaused, currentLevel, location.pathname]);

  const startJourney = () => {
    setShowWelcomeModal(false);
    setIsActive(true);
    setIsPaused(false);
    setCurrentLevel(1);
    navigate('/seller');
  };

  const startDemoJourney = () => {
    setShowWelcomeModal(false);
    setIsActive(true);
    setIsPaused(false);
    setCurrentLevel(3); // Fast-track: Photo -> AI studio -> Description -> Price -> Publish -> Order -> Earnings
    navigate('/seller/add');
  };

  const pauseJourney = () => {
    setIsPaused(true);
  };

  const resumeJourney = () => {
    setIsActive(true);
    setIsPaused(false);
    navigate(currentMission.expectedRoute);
  };

  const skipJourney = () => {
    setIsActive(false);
    setIsPaused(false);
    setShowWelcomeModal(false);
  };

  const completeCurrentMission = () => {
    const mission = currentMission;
    const newPoints = journeyPoints + mission.points;
    setJourneyPoints(newPoints);

    let updatedBadges = [...unlockedBadges];
    if (mission.badge && !updatedBadges.includes(mission.badge.id)) {
      updatedBadges.push(mission.badge.id);
      setUnlockedBadges(updatedBadges);
    }

    // Show celebration reward popup
    setShowRewardModal({
      title: language === 'hi' ? mission.titleHi : language === 'te' ? mission.titleTe : mission.titleEn,
      points: mission.points,
      badge: mission.badge,
    });

    if (currentLevel >= TUTORIAL_MISSIONS.length) {
      setIsActive(false);
      setShowCompletionModal(true);
    } else {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const nextLevel = () => {
    if (currentLevel < TUTORIAL_MISSIONS.length) {
      setCurrentLevel(currentLevel + 1);
    } else {
      setIsActive(false);
      setShowCompletionModal(true);
    }
  };

  const prevLevel = () => {
    if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1);
    }
  };

  const resetJourney = () => {
    setCurrentLevel(1);
    setJourneyPoints(0);
    setUnlockedBadges([]);
    setIsActive(true);
    setIsPaused(false);
    setShowCompletionModal(false);
    navigate('/seller');
  };

  const showMe = (missionId?: string) => {
    if (missionId) {
      const found = TUTORIAL_MISSIONS.find(m => m.id === missionId);
      if (found) setCurrentLevel(found.level);
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const listenCurrentMission = () => {
    const text = language === 'hi'
      ? currentMission.saathiHi
      : language === 'te'
      ? currentMission.saathiTe
      : currentMission.saathiEn;
    speakText(text, language);
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        isPaused,
        currentLevel,
        currentMission,
        journeyPoints,
        unlockedBadges,
        activeTarget,
        showWelcomeModal,
        openWelcomeModal: () => setShowWelcomeModal(true),
        showRewardModal,
        showCompletionModal,
        returningBanner,
        dismissReturningBanner: () => setReturningBanner(false),
        startJourney,
        startDemoJourney,
        pauseJourney,
        resumeJourney,
        skipJourney,
        nextLevel,
        prevLevel,
        completeCurrentMission,
        resetJourney,
        closeWelcomeModal: () => setShowWelcomeModal(false),
        closeRewardModal: () => setShowRewardModal(null),
        closeCompletionModal: () => setShowCompletionModal(false),
        showMe,
        listenCurrentMission,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
