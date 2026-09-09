import { LanguageCode } from '../types';

export interface CraftCategoryOption {
  id: string;
  name: string;
  nativeHi: string;
  nativeTe: string;
  iconName: string;
  example: string;
}

export const CRAFT_CATEGORIES: CraftCategoryOption[] = [
  { id: 'Weaving', name: 'Handloom & Weaving', nativeHi: 'हथकरघा बुनाई', nativeTe: 'చేనేత మగ్గం', iconName: 'Scissors', example: 'Pochampally, Banarasi, Khadi' },
  { id: 'Pottery', name: 'Terracotta & Pottery', nativeHi: 'मिट्टी के बर्तन / टेराकोटा', nativeTe: 'మట్టి పాత్రలు / టెర్రకోట', iconName: 'Flame', example: 'Khurja, Gorakhpur, Blue Pottery' },
  { id: 'Woodwork', name: 'Woodcraft & Carving', nativeHi: 'काष्ठ शिल्प एवं खिलौने', nativeTe: 'చెక్క శిల్పాలు & బొమ్మలు', iconName: 'Trees', example: 'Channapatna, Saharanpur, Kondapalli' },
  { id: 'Metalcraft', name: 'Metalcraft & Dhokra', nativeHi: 'धातु शिल्प एवं ढोकरा', nativeTe: 'లోహ శిల్పకళ & డోక్రా', iconName: 'Sparkles', example: 'Bastar Dhokra, Moradabad Brass, Bidriware' },
  { id: 'Embroidery', name: 'Embroidery & Textile', nativeHi: 'कढ़ाई एवं जरदोजी', nativeTe: 'ఎంబ్రాయిడరీ & వస్త్ర కళ', iconName: 'Feather', example: 'Chikan, Phulkari, Kantha, Kasuti' },
  { id: 'Painting', name: 'Folk & Tribal Painting', nativeHi: 'लोक चित्रकला', nativeTe: 'జానపద చిత్రలేఖనం', iconName: 'Palette', example: 'Madhubani, Warli, Pattachitra, Kalamkari' },
];

export interface PortalStrings {
  languageLabel: string;
  tagline: string;
  heroHeading: string;
  heroSub: string;
  primaryCta: string;
  secondaryCta: string;
  voicePlaying: string;
  voiceListen: string;
  voicePlay: string;
  voicePause: string;
  voiceReplay: string;
  voiceStop: string;
  welcomeAudioSpeech: string;

  // 3-step tutorial
  instructionSectionTitle: string;
  instructionSectionSub: string;
  nextStep: string;
  prevStep: string;
  skipToRole: string;
  finishInstructions: string;

  step1Badge: string;
  step1Title: string;
  step1Desc: string;
  step1Detail: string;
  step1Speech: string;

  step2Badge: string;
  step2Title: string;
  step2Desc: string;
  step2Detail: string;
  step2Speech: string;

  step3Badge: string;
  step3Title: string;
  step3Desc: string;
  step3Detail: string;
  step3Speech: string;

  // AI interactive identity
  aiSectionTitle: string;
  aiSectionSub: string;
  aiDemoButton: string;
  aiStep1Status: string;
  aiStep2Status: string;
  aiStep3Status: string;
  aiCompleteStatus: string;
  aiSampleTitle: string;
  aiSamplePrice: string;
  aiSampleStory: string;

  // Role selection
  roleHeading: string;
  roleSub: string;
  roleArtisanTitle: string;
  roleArtisanBadge: string;
  roleArtisanDesc: string;
  roleArtisanCta: string;
  roleArtisanPoints: string[];
  roleBuyerTitle: string;
  roleBuyerBadge: string;
  roleBuyerDesc: string;
  roleBuyerCta: string;
  roleBuyerPoints: string[];
  roleSelectionSpeech: string;

  // Artisan onboarding
  artisanWelcomeTitle: string;
  artisanWelcomeSub: string;
  fieldMobile: string;
  fieldName: string;
  fieldVillage: string;
  fieldCraft: string;
  fieldLang: string;
  btnGetOtp: string;
  otpTitle: string;
  otpSub: string;
  needHelpVoice: string;
  btnVerifyEnter: string;
  artisanAudioHelp: string;
  autoFillDemo: string;

  // Buyer onboarding
  buyerWelcomeTitle: string;
  buyerWelcomeSub: string;
  buyerBtnSignUp: string;
  buyerBtnSignIn: string;
  buyerBtnGuest: string;
  buyerGuestSub: string;
  buyerAudioHelp: string;

  // Common accessibility
  backToWelcome: string;
  stepIndicator: string;
  close: string;
}

export const PORTAL_TRANSLATIONS: Record<LanguageCode, PortalStrings> = {
  en: {
    languageLabel: "Language",
    tagline: "Digital Market Linkage for Indian Artisans",
    heroHeading: "Your Craft. Your Price. Your Market.",
    heroSub: "KALAtech helps artisans showcase their handicrafts, understand fair pricing, and connect directly with buyers.",
    primaryCta: "Get Started",
    secondaryCta: "Listen to Instructions 🔊",
    voicePlaying: "Playing instructions…",
    voiceListen: "Listen",
    voicePlay: "Play",
    voicePause: "Pause",
    voiceReplay: "Replay",
    voiceStop: "Stop",
    welcomeAudioSpeech: "Welcome to KALAtech. Digital market linkage for Indian artisans. Your craft, your price, your market. KALAtech helps you showcase handicrafts, calculate fair profit prices, and connect directly with genuine buyers without middlemen. Click Get Started to learn how it works.",

    instructionSectionTitle: "How KALAtech Works in 3 Simple Steps",
    instructionSectionSub: "Designed specially for artisans. Simple, visual, and guided by voice.",
    nextStep: "Next Step →",
    prevStep: "← Previous",
    skipToRole: "Skip to Start",
    finishInstructions: "Choose Your Role →",

    step1Badge: "STEP 1",
    step1Title: "📸 ADD YOUR CRAFT",
    step1Desc: "Take a photo or add a photo of your handicraft.",
    step1Detail: "Use any phone camera. Our system clarifies background and highlights the authentic handmade texture.",
    step1Speech: "Step 1: Add your craft. Simply take a photo or upload a picture of your handicraft using your smartphone camera. You do not need professional photography equipment.",

    step2Badge: "STEP 2",
    step2Title: "🤖 LET KALATECH HELP",
    step2Desc: "AI helps create your product description and understand the craft.",
    step2Detail: "KALA Mitra writes your craft story, translates into multiple languages, and highlights GI heritage tags automatically.",
    step2Speech: "Step 2: Let KALAtech help. Our friendly AI assistant examines your craft, identifies raw materials, creates an authentic description, and translates it into English, Hindi, and Telugu.",

    step3Badge: "STEP 3",
    step3Title: "💰 SET A FAIR PRICE & SELL",
    step3Desc: "Compare market prices, create your bill and connect with buyers.",
    step3Detail: "Transparent cost-plus calculation ensures 40% to 60% higher earnings than traditional middleman deductions.",
    step3Speech: "Step 3: Set a fair price and sell. KALAtech compares current market benchmarks, recommends fair profit margins for your labor hours, creates printed GST bills, and connects you directly with buyers via WhatsApp and online enquiry.",

    aiSectionTitle: "Meet KALA Mitra — Your AI Craft Assistant",
    aiSectionSub: "Friendly, fast, and built specifically for traditional Indian crafts.",
    aiDemoButton: "Try Live AI Demo",
    aiStep1Status: "Understanding your craft…",
    aiStep2Status: "Checking market prices…",
    aiStep3Status: "Creating your product story…",
    aiCompleteStatus: "Craft Story & Fair Price Ready!",
    aiSampleTitle: "Pochampally Double-Ikat Silk Saree",
    aiSamplePrice: "₹5,850 (Artisan Profit: +₹2,100 vs middleman ₹3,400)",
    aiSampleStory: "Handwoven 100% Mulberry silk woven with natural dyed tie-and-dye geometric patterns by hereditary master weavers in Yadadri district.",

    roleHeading: "How do you want to use KALAtech?",
    roleSub: "Select your profile below to continue",
    roleArtisanTitle: "I am an Artisan",
    roleArtisanBadge: "Artisan / Weaver / Potter",
    roleArtisanDesc: "Showcase my crafts, manage products and sell directly.",
    roleArtisanCta: "Continue as Artisan",
    roleArtisanPoints: [
      "📸 Easy mobile photo cataloging",
      "💰 Fair price calculation with labor wage",
      "🧾 Instant printed bill generator",
      "🤝 100% direct buyer enquiries without commission"
    ],

    roleBuyerTitle: "I am a Buyer",
    roleBuyerBadge: "Conscious Patron / Retailer",
    roleBuyerDesc: "Discover authentic handicrafts and buy directly from artisans.",
    roleBuyerCta: "Continue as Buyer",
    roleBuyerPoints: [
      "🏺 100% certified authentic Indian craft origins",
      "💵 Fair direct artisan pricing without retail markups",
      "📦 Direct artisan contact & transparent dispatch",
      "⚡ Fast checkout or instant guest browsing"
    ],
    roleSelectionSpeech: "How do you want to use KALAtech? If you make handicrafts, choose I am an Artisan. If you want to purchase authentic handicrafts, choose I am a Buyer.",

    artisanWelcomeTitle: "Welcome, Artisan! 👋",
    artisanWelcomeSub: "Let's set up your digital stall in less than 2 minutes.",
    fieldMobile: "Mobile Number",
    fieldName: "Full Name",
    fieldVillage: "Village / Town / District",
    fieldCraft: "Main Craft Type",
    fieldLang: "Preferred Language for Audio & SMS",
    btnGetOtp: "Send 6-Digit OTP",
    otpTitle: "Enter 6-Digit OTP",
    otpSub: "Enter the 6-digit OTP sent to your phone.",
    needHelpVoice: "Need help? 🔊 Listen to instructions",
    btnVerifyEnter: "Verify & Enter Artisan Studio",
    artisanAudioHelp: "Please enter your mobile number and name. Choose your craft type such as handloom weaving or pottery, then enter the 6-digit OTP sent to your phone to access your artisan studio.",
    autoFillDemo: "Auto-fill Master Artisan Demo",

    buyerWelcomeTitle: "Welcome to KALAtech 🛍️",
    buyerWelcomeSub: "Explore authentic Indian crafts directly from rural master artisans.",
    buyerBtnSignUp: "Create Buyer Account",
    buyerBtnSignIn: "Buyer Sign In",
    buyerBtnGuest: "Continue as Guest 🚀",
    buyerGuestSub: "Instant access to marketplace — no registration required now",
    buyerAudioHelp: "Welcome to KALAtech marketplace. You can sign up, sign in, or click Continue as Guest to immediately browse genuine handicrafts from master artisans across India.",

    backToWelcome: "← Back to Welcome",
    stepIndicator: "Step",
    close: "Close"
  },

  hi: {
    languageLabel: "भाषा",
    tagline: "भारतीय कारीगरों के लिए डिजिटल बाज़ार संपर्क",
    heroHeading: "आपका शिल्प। आपका मूल्य। आपका बाज़ार।",
    heroSub: "KALAtech कारीगरों को अपने हस्तशिल्प प्रदर्शित करने, उचित मूल्य समझने और सीधे खरीदारों से जुड़ने में मदद करता है।",
    primaryCta: "शुरू करें",
    secondaryCta: "निर्देश सुनें 🔊",
    voicePlaying: "निर्देश सुनाए जा रहे हैं…",
    voiceListen: "सुनें",
    voicePlay: "चलाएं",
    voicePause: "रोकें",
    voiceReplay: "पुनः सुनें",
    voiceStop: "बंद करें",
    welcomeAudioSpeech: "KALAtech में आपका स्वागत है। भारतीय कारीगरों के लिए डिजिटल बाज़ार संपर्क। आपका शिल्प, आपका मूल्य, आपका बाज़ार। KALAtech आपको अपने हस्तशिल्प प्रदर्शित करने, उचित मुनाफ़ा तय करने और बिना बिचौलियों के सीधे खरीदारों से जुड़ने में मदद करता है। यह कैसे काम करता है जानने के लिए 'शुरू करें' पर क्लिक करें।",

    instructionSectionTitle: "KALAtech कैसे काम करता है — 3 आसान कदम",
    instructionSectionSub: "कारीगरों के लिए ख़ास तौर पर तैयार। बेहद सरल, चित्रों से भरपूर और आवाज़ द्वारा मार्गदर्शित।",
    nextStep: "अगला कदम →",
    prevStep: "← पिछला",
    skipToRole: "सीधे आगे बढ़ें",
    finishInstructions: "अपनी भूमिका चुनें →",

    step1Badge: "चरण 1",
    step1Title: "📸 अपना शिल्प जोड़ें",
    step1Desc: "अपने हस्तशिल्प की एक फ़ोटो लें या जोड़ें।",
    step1Detail: "किसी भी सामान्य मोबाइल कैमरे से फ़ोटो लें। हमारा सिस्टम अपने आप पृष्ठभूमि साफ़ करके शिल्प की बनावट उभारता है।",
    step1Speech: "चरण 1: अपना शिल्प जोड़ें। अपने मोबाइल कैमरे से अपने हस्तशिल्प की एक साफ़ फ़ोटो लें या गैलरी से चुनें। आपको किसी महंगे कैमरे की ज़रूरत नहीं है।",

    step2Badge: "चरण 2",
    step2Title: "🤖 KALATECH को मदद करने दें",
    step2Desc: "AI आपके उत्पाद का विवरण बनाने और शिल्प को समझने में मदद करता है।",
    step2Detail: "कला मित्र AI आपके शिल्प की प्रामाणिक कहानी लिखता है, सामग्री पहचानता है और इसे हिंदी, अंग्रेज़ी व तेलुगु में अनुवाद करता है।",
    step2Speech: "चरण 2: KALAtech को मदद करने दें। हमारा AI सहायक आपके शिल्प को पहचानकर उसकी सुंदर कहानी लिखता है और बाज़ार के खरीदारों के लिए आकर्षक विवरण तैयार करता है।",

    step3Badge: "चरण 3",
    step3Title: "💰 सही मूल्य तय करें और बेचें",
    step3Desc: "बाज़ार भाव की तुलना करें, अपना बिल बनाएं और खरीदारों से जुड़ें।",
    step3Detail: "मेहनत और लागत का सच्चा हिसाब, जिससे बिचौलियों की तुलना में 40% से 60% अधिक कमाई हो सके।",
    step3Speech: "चरण 3: सही मूल्य तय करें और बेचें। KALAtech बाज़ार दरों की तुलना करके आपकी मजदूरी और लागत के आधार पर सही मूल्य बताता है, पक्का बिल बनाता है और सीधे व्हाट्सएप पर खरीदारों से जोड़ता है।",

    aiSectionTitle: "मिलिए 'कला मित्र' से — आपका AI शिल्प साथी",
    aiSectionSub: "सरल, भरोसेमंद और भारतीय पारंपरिक शिल्प कला के लिए विशेष रूप से निर्मित।",
    aiDemoButton: "लाइव AI डेमो देखें",
    aiStep1Status: "आपके शिल्प को समझा जा रहा है…",
    aiStep2Status: "बाज़ार के उचित मूल्यों का विश्लेषण हो रहा है…",
    aiStep3Status: "आपके उत्पाद की अनूठी कहानी तैयार हो रही है…",
    aiCompleteStatus: "शिल्प कथा एवं उचित मूल्य तैयार है!",
    aiSampleTitle: "पोचमपल्ली डबल-इकत रेशमी साड़ी",
    aiSamplePrice: "₹5,850 (कारीगर मुनाफ़ा: बिचौलिए के ₹3,400 के मुकाबले +₹2,100 अधिक)",
    aiSampleStory: "यादाद्री ज़िले के मास्टर बुनकरों द्वारा प्राकृतिक रंगों व पारंपरिक ताना-बाना तकनीक से तैयार 100% शुद्ध रेशम।",

    roleHeading: "आप KALAtech का उपयोग कैसे करना चाहते हैं?",
    roleSub: "आगे बढ़ने के लिए अपना उपयुक्त विकल्प चुनें",
    roleArtisanTitle: "मैं एक कारीगर हूँ",
    roleArtisanBadge: "कारीगर / बुनकर / कुम्हार",
    roleArtisanDesc: "अपने हस्तशिल्प प्रदर्शित करें, उत्पाद प्रबंधित करें और सीधे बेचें।",
    roleArtisanCta: "कारीगर के रूप में आगे बढ़ें",
    roleArtisanPoints: [
      "📸 आवाज़ और मोबाइल कैमरे से आसान कैटलॉग",
      "💰 श्रम पारिश्रमिक जोड़कर उचित मूल्य गणना",
      "🧾 तुरंत मुद्रण योग्य जीएसटी बिल निर्माण",
      "🤝 बिना किसी कमीशन के सीधे 100% खरीदार संपर्क"
    ],

    roleBuyerTitle: "मैं एक खरीदार हूँ",
    roleBuyerBadge: "जागरूक खरीदार / कला संरक्षक",
    roleBuyerDesc: "प्रामाणिक हस्तशिल्प खोजें और सीधे कारीगरों से खरीदें।",
    roleBuyerCta: "खरीदार के रूप में आगे बढ़ें",
    roleBuyerPoints: [
      "🏺 100% प्रामाणिक जीआई प्रमाणित भारतीय कला",
      "💵 बिना बिचौलियों के सीधा कारीगर मूल्य",
      "📦 कारीगर से सीधा संवाद और पारदर्शी डिलीवरी",
      "⚡ बिना पंजीकरण तुरंत 'अतिथि' के रूप में ब्राउज़ करें"
    ],
    roleSelectionSpeech: "आप KALAtech का उपयोग कैसे करना चाहते हैं? यदि आप हस्तशिल्प बनाते हैं, तो 'मैं एक कारीगर हूँ' चुनें। यदि आप सीधे कारीगरों से हस्तशिल्प खरीदना चाहते हैं, तो 'मैं एक खरीदार हूँ' चुनें।",

    artisanWelcomeTitle: "नमस्ते, शिल्पकार साथी! 👋",
    artisanWelcomeSub: "आइए केवल 1 मिनट में आपकी डिजिटल दुकान शुरू करें।",
    fieldMobile: "मोबाइल नंबर",
    fieldName: "आपका पूरा नाम",
    fieldVillage: "गाँव / कस्बा / ज़िला",
    fieldCraft: "मुख्य शिल्प का प्रकार",
    fieldLang: "ऑडियो और संदेश की भाषा",
    btnGetOtp: "6-अंकों का ओटीपी भेजें",
    otpTitle: "6-अंकों का ओटीपी दर्ज करें",
    otpSub: "आपके फ़ोन पर भेजा गया 6 अंकों का ओटीपी दर्ज करें।",
    needHelpVoice: "मदद चाहिए? 🔊 निर्देश सुनें",
    btnVerifyEnter: "सत्यापित करें और स्टूडियो में प्रवेश करें",
    artisanAudioHelp: "कृपया अपना मोबाइल नंबर और नाम दर्ज करें। अपना शिल्प जैसे बुनाई या मिट्टी कला चुनें, फिर फ़ोन पर आए 6 अंकों के ओटीपी को दर्ज करके अपने स्टूडियो में प्रवेश करें।",
    autoFillDemo: "मास्टर कारीगर डेमो भरें",

    buyerWelcomeTitle: "KALAtech में आपका स्वागत है 🛍️",
    buyerWelcomeSub: "भारत के दूर-दराज़ कारीगरों से सीधे हस्तनिर्मित उत्कृष्ट शिल्प प्राप्त करें।",
    buyerBtnSignUp: "नया खरीदार खाता बनाएं",
    buyerBtnSignIn: "खरीदार साइन इन",
    buyerBtnGuest: "अतिथि के रूप में जारी रखें 🚀",
    buyerGuestSub: "बिना किसी पंजीकरण के तुरंत बाज़ार ब्राउज़ करें",
    buyerAudioHelp: "KALAtech बाज़ार में आपका स्वागत है। आप खाता बना सकते हैं, साइन इन कर सकते हैं या बिना किसी झंझट के तुरंत हस्तशिल्प देखने के लिए 'अतिथि के रूप में जारी रखें' पर क्लिक कर सकते हैं।",

    backToWelcome: "← मुख्य पृष्ठ पर लौटें",
    stepIndicator: "कदम",
    close: "बंद करें"
  },

  te: {
    languageLabel: "భాష",
    tagline: "భారతీయ చేతివృత్తుల కళాకారుల కోసం డిజిటల్ మార్కెట్ అనుసంధానం",
    heroHeading: "మీ కళ. మీ ధర. మీ మార్కెట్.",
    heroSub: "కళాకారులు తమ చేతివృత్తులను ప్రదర్శించడానికి, సరసమైన ధరలను అర్థం చేసుకోవడానికి మరియు నేరుగా కొనుగోలుదారులతో కనెక్ట్ అవ్వడానికి KALAtech సహాయపడుతుంది.",
    primaryCta: "ప్రారంభించండి",
    secondaryCta: "సూచనలు వినండి 🔊",
    voicePlaying: "సూచనలు వినిపిస్తున్నాయి…",
    voiceListen: "వినండి",
    voicePlay: "ప్లే",
    voicePause: "పాజ్",
    voiceReplay: "మళ్ళీ వినండి",
    voiceStop: "ఆపు",
    welcomeAudioSpeech: "KALAtech కు స్వాగతం. భారతీయ చేతివృత్తుల కళాకారుల కోసం డిజిటల్ మార్కెట్ అనుసంధానం. మీ కళ, మీ ధర, మీ మార్కెట్. KALAtech మీ చేతివృత్తులను ప్రదర్శించడానికి, సరసమైన లాభదాయక ధరలను నిర్ణయించడానికి మరియు దళారులు లేకుండా నేరుగా కొనుగోలుదారులతో కనెక్ట్ అవ్వడానికి సహాయపడుతుంది. ఎలా పనిచేస్తుందో తెలుసుకోవడానికి 'ప్రారంభించండి' క్లిక్ చేయండి.",

    instructionSectionTitle: "KALAtech 3 సులభమైన దశల్లో ఎలా పనిచేస్తుంది",
    instructionSectionSub: "చేతివృత్తుల కళాకారుల కోసం ప్రత్యేకంగా రూపొందించబడింది. బొమ్మలతో కూడినది, సులభం మరియు వాయిస్ సహాయం గలది.",
    nextStep: "తదుపరి దశ →",
    prevStep: "← మునుపటిది",
    skipToRole: "నేరుగా ప్రారంభించండి",
    finishInstructions: "మీ పాత్రను ఎంచుకోండి →",

    step1Badge: "దశ 1",
    step1Title: "📸 మీ కళాఖండాన్ని జోడించండి",
    step1Desc: "మీ చేతివృత్తి వస్తువు ఫోటో తీయండి లేదా జోడించండి.",
    step1Detail: "సాధారణ స్మార్ట్‌ఫోన్ కెమెరా ఉపయోగించండి. మా సిస్టమ్ వెనుక భాగాన్ని శుభ్రం చేసి చేతి కళను స్పష్టంగా చూపుతుంది.",
    step1Speech: "దశ 1: మీ కళాఖండాన్ని జోడించండి. మీ స్మార్ట్‌ఫోన్ కెమెరాతో మీ చేతివృత్తి వస్తువు ఫోటో తీయండి లేదా గ్యాలరీ నుండి ఎంచుకోండి. ఖరీదైన కెమెరా అవసరం లేదు.",

    step2Badge: "దశ 2",
    step2Title: "🤖 KALATECH సహాయం తీసుకోండి",
    step2Desc: "AI ఉత్పత్తి వివరణను రూపొందించడానికి మరియు కళను అర్థం చేసుకోవడానికి సహాయపడుతుంది.",
    step2Detail: "కళా మిత్ర AI మీ కళాఖండం కథనాన్ని రాస్తుంది, ముడి పదార్థాలను గుర్తిస్తుంది మరియు తెలుగు, హిందీ, ఇంగ్లీషులలో అనువదిస్తుంది.",
    step2Speech: "దశ 2: KALAtech సహాయం తీసుకోండి. మా AI సహాయకుడు మీ కళను పరిశీలించి, కథనాన్ని రూపొందించి, కొనుగోలుదారుల కోసం ఆకర్షణీయమైన వివరణను సిద్ధం చేస్తుంది.",

    step3Badge: "దశ 3",
    step3Title: "💰 సరసమైన ధర నిర్ణయించండి మరియు అమ్మండి",
    step3Desc: "మార్కెట్ ధరలను సరిపోల్చండి, మీ బిల్లును రూపొందించండి మరియు కొనుగోలుదారులతో కనెక్ట్ అవ్వండి.",
    step3Detail: "మీ శ్రమ మరియు ఖర్చుకు న్యాయమైన లెక్క. దళారుల కంటే 40% నుండి 60% అధిక ఆదాయం లభిస్తుంది.",
    step3Speech: "దశ 3: సరసమైన ధర నిర్ణయించండి మరియు అమ్మండి. KALAtech ప్రస్తుత మార్కెట్ ధరలను పోల్చి, మీ శ్రమకు తగిన లాభదాయక ధరను సూచిస్తుంది, బిల్లులను తయారు చేస్తుంది మరియు వాట్సాప్ ద్వారా నేరుగా కొనుగోలుదారులతో అనుసంధానిస్తుంది.",

    aiSectionTitle: "'కళా మిత్ర'ను కలవండి — మీ AI క్రాఫ్ట్ అసిస్టెంట్",
    aiSectionSub: "స్నేహపూర్వకమైనది, వేగవంతమైనది మరియు భారతీయ చేతివృత్తుల కోసం ప్రత్యేకంగా తయారు చేయబడింది.",
    aiDemoButton: "ప్రత్యక్ష AI డెమో చూడండి",
    aiStep1Status: "మీ కళాఖండాన్ని అర్థం చేసుకుంటోంది…",
    aiStep2Status: "మార్కెట్ సరసమైన ధరలను తనిఖీ చేస్తోంది…",
    aiStep3Status: "మీ ఉత్పత్తి ప్రత్యేక కథనాన్ని సృష్టిస్తోంది…",
    aiCompleteStatus: "కళా కథనం మరియు సరసమైన ధర సిద్ధంగా ఉన్నాయి!",
    aiSampleTitle: "పోచంపల్లి డబుల్-ఇకత్ పట్టు చీర",
    aiSamplePrice: "₹5,850 (దళారి ఇచ్చే ₹3,400 కంటే కళాకారుడికి +₹2,100 ఎక్కువ లాభం)",
    aiSampleStory: "యాదాద్రి జిల్లాకు చెందిన నైపుణ్యం గల చేనేత కళాకారులు సహజ రంగులు, సాంప్రదాయ ఇక్కత్ నేతతో నేసిన 100% స్వచ్ఛమైన మల్బరీ పట్టు.",

    roleHeading: "మీరు KALAtech ను ఎలా ఉపయోగించాలనుకుంటున్నారు?",
    roleSub: "కొనసాగడానికి మీ పాత్రను ఎంచుకోండి",
    roleArtisanTitle: "నేను ఒక చేతివృత్తి కళాకారుడిని",
    roleArtisanBadge: "కళాకారుడు / చేనేత కార్మికుడు / కుమ్మరి",
    roleArtisanDesc: "నా చేతివృత్తులను ప్రదర్శించండి, ఉత్పత్తులను నిర్వహించండి మరియు నేరుగా అమ్మండి.",
    roleArtisanCta: "కళాకారుడిగా కొనసాగండి",
    roleArtisanPoints: [
      "📸 వాయిస్ మరియు మొబైల్ కెమెరాతో సులభమైన క్యాటలాగ్",
      "💰 శ్రమ కూలితో కూడిన సరసమైన ధర లెక్కింపు",
      "🧾 తక్షణ ప్రింట్ చేయగల జీఎస్టీ బిల్లుల సృష్టి",
      "🤝 ఎటువంటి కమీషన్ లేకుండా 100% ప్రత్యక్ష కొనుగోలుదారుల సంప్రదింపులు"
    ],

    roleBuyerTitle: "నేను ఒక కొనుగోలుదారుని",
    roleBuyerBadge: "కళా పోషకుడు / కొనుగోలుదారు",
    roleBuyerDesc: "ప్రామాణికమైన చేతివృత్తులను కనుగొనండి మరియు కళాకారుల నుండి నేరుగా కొనండి.",
    roleBuyerCta: "కొనుగోలుదారుగా కొనసాగండి",
    roleBuyerPoints: [
      "🏺 100% నిజమైన జిఐ గుర్తింపు పొందిన భారతీయ కళలు",
      "💵 దళారులు లేకుండా నేరుగా కళాకారుడి ధర",
      "📦 కళాకారుడితో ప్రత్యక్ష సంప్రదింపులు & పారదర్శక డెలివరీ",
      "⚡ రిజిస్ట్రేషన్ లేకుండానే 'అతిథి'గా వెంటనే బ్రౌజ్ చేయండి"
    ],
    roleSelectionSpeech: "మీరు KALAtech ను ఎలా ఉపయోగించాలనుకుంటున్నారు? మీరు చేతివృత్తుల వస్తువులను తయారుచేస్తే, 'నేను ఒక కళాకారుడిని' ఎంచుకోండి. ప్రామాణికమైన చేతివృత్తులను కొనుగోలు చేయాలనుకుంటే, 'నేను ఒక కొనుగోలుదారుని' ఎంచుకోండి.",

    artisanWelcomeTitle: "స్వాగతం, కళాకారుడా! 👋",
    artisanWelcomeSub: "కేవలం 1 నిమిషంలో మీ డిజిటల్ దుకాణాన్ని ఏర్పాటు చేద్దాం.",
    fieldMobile: "మొబైల్ నంబర్",
    fieldName: "మీ పూర్తి పేరు",
    fieldVillage: "గ్రామం / పట్టణం / జిల్లా",
    fieldCraft: "చేతివృత్తి రకం",
    fieldLang: "ఆడియో మరియు సందేశాల భాష",
    btnGetOtp: "6-అంకెల ఓటీపీని పంపండి",
    otpTitle: "6-అంకెల ఓటీపీని నమోదు చేయండి",
    otpSub: "మీ ఫోన్‌కు పంపిన 6 అంకెల ఓటీపీని నమోదు చేయండి.",
    needHelpVoice: "సహాయం కావాలా? 🔊 సూచనలు వినండి",
    btnVerifyEnter: "ధృవీకరించి స్టూడియోలోకి వెళ్లండి",
    artisanAudioHelp: "దయచేసి మీ మొబైల్ నంబర్ మరియు పేరు నమోదు చేయండి. మీ చేతివృత్తిని ఎంచుకుని, ఫోన్‌కు వచ్చిన 6 అంకెల ఓటీపీని నమోదు చేసి మీ స్టూడియోలోకి ప్రవేశించండి.",
    autoFillDemo: "మాస్టర్ కళాకారుడు డెమో వివరాలు నింపండి",

    buyerWelcomeTitle: "KALAtech కి స్వాగతం 🛍️",
    buyerWelcomeSub: "భారతీయ గ్రామీణ కళాకారుల నుండి నేరుగా చేతివృత్తుల వస్తువులను పొందండి.",
    buyerBtnSignUp: "కొత్త ఖాతా సృష్టించండి",
    buyerBtnSignIn: "కొనుగోలుదారు సైన్ ఇన్",
    buyerBtnGuest: "అతిథిగా కొనసాగండి 🚀",
    buyerGuestSub: "ఎటువంటి నమోదు లేకుండా వెంటనే మార్కెట్‌ప్లేస్‌ను చూడండి",
    buyerAudioHelp: "KALAtech మార్కెట్‌ప్లేస్‌కు స్వాగతం. మీరు ఖాతా సృష్టించవచ్చు, సైన్ ఇన్ చేయవచ్చు లేదా వెంటనే ఉత్పత్తులను చూడటానికి 'అతిథిగా కొనసాగండి' పై క్లిక్ చేయవచ్చు.",

    backToWelcome: "← స్వాగత పేజీకి తిరిగి వెళ్లండి",
    stepIndicator: "దశ",
    close: "మూసివేయి"
  }
};
