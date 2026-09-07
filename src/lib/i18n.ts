import { LanguageCode } from '../types';

export interface UIStrings {
  appName: string;
  tagline: string;
  forArtisans: string;
  forBuyers: string;
  evaluatorDefense: string;
  selectLanguage: string;
  english: string;
  hindi: string;
  telugu: string;
  audioGuide: string;
  listening: string;
  listenToGuide: string;
  stopAudio: string;
  
  // Onboarding
  welcomeTitle: string;
  welcomeSub: string;
  enterPhone: string;
  sendOtp: string;
  enterOtp: string;
  verifyOtp: string;
  resendOtp: string;
  artisanDetails: string;
  fullName: string;
  craftCategory: string;
  stateDistrict: string;
  state: string;
  district: string;
  yearsOfExperience: string;
  completeProfile: string;
  
  // Dashboard
  myArtisanStudio: string;
  publishedProducts: string;
  draftProducts: string;
  buyerEnquiries: string;
  incomeImpactTitle: string;
  middlemanComparison: string;
  addNewCraft: string;
  viewEnquiries: string;
  noProductsYet: string;
  startFirstListing: string;
  
  // Creation Wizard
  stepPhoto: string;
  stepEnhance: string;
  stepCatalog: string;
  stepPricing: string;
  stepLinkage: string;
  stepPublish: string;
  
  // Step 1 Photo
  captureOrUpload: string;
  takePhoto: string;
  uploadGallery: string;
  orTrySampleCrafts: string;
  
  // Step 2 Enhance
  aiEnhancementTitle: string;
  aiEnhancementSub: string;
  before: string;
  after: string;
  enhancementApplied: string;
  originalUnmodified: string;
  
  // Step 3 Catalog
  smartCatalogTitle: string;
  smartCatalogSub: string;
  productTitle: string;
  productDesc: string;
  material: string;
  estDimensions: string;
  tags: string[];
  aiGeneratedBadge: string;
  voiceDictate: string;
  
  // Step 4 Pricing
  smartPricingTitle: string;
  smartPricingSub: string;
  rawMaterialCost: string;
  laborHours: string;
  fairHourlyWage: string;
  suggestedFairRange: string;
  recommendedPrice: string;
  middlemanPayout: string;
  fairMarketGain: string;
  acceptSuggested: string;
  setCustomPrice: string;
  pricingRationale: string;
  
  // Step 5 Market Linkage
  marketLinkageTitle: string;
  marketLinkageSub: string;
  matchingChannels: string;
  matchScore: string;
  shareWhatsApp: string;
  shareDirectLink: string;
  
  // Step 6 Publish
  publishTitle: string;
  publishSuccess: string;
  viewInMarketplace: string;
  publishListing: string;
  
  // Buyer Marketplace
  browseCatalog: string;
  searchCrafts: string;
  filterCategory: string;
  allCategories: string;
  priceRange: string;
  enquireNow: string;
  authenticHandmade: string;
  artisanOrigin: string;
  sendEnquiryTitle: string;
  buyerName: string;
  buyerPhone: string;
  buyerQuantity: string;
  buyerMessage: string;
  submitEnquiry: string;
  enquirySentSuccess: string;
  close: string;
  back: string;
  next: string;
}

export const translations: Record<LanguageCode, UIStrings> = {
  en: {
    appName: "Antigravity",
    tagline: "AI Market Linkage & Smart Cataloging for Artisans",
    forArtisans: "Artisan Studio",
    forBuyers: "Buyer Marketplace",
    evaluatorDefense: "AI Audit & Data Proof",
    selectLanguage: "Language",
    english: "English",
    hindi: "हिन्दी (Hindi)",
    telugu: "తెలుగు (Telugu)",
    audioGuide: "Audio Guide",
    listening: "Listening...",
    listenToGuide: "Tap to listen to screen instructions",
    stopAudio: "Stop audio",
    
    welcomeTitle: "Empowering Rural & Folk Artisans",
    welcomeSub: "Turn your handmade crafts into professional multilingual catalogs with fair pricing in minutes.",
    enterPhone: "Mobile Phone Number",
    sendOtp: "Send OTP Code",
    enterOtp: "Enter 6-Digit OTP",
    verifyOtp: "Verify & Enter Studio",
    resendOtp: "Resend Code (Demo: 123456)",
    artisanDetails: "Artisan Profile Setup",
    fullName: "Your Full Name",
    craftCategory: "Primary Craft Tradition",
    stateDistrict: "Your Region / Village",
    state: "State",
    district: "District / Town",
    yearsOfExperience: "Years Practicing Craft",
    completeProfile: "Enter Artisan Studio",
    
    myArtisanStudio: "Artisan Workshop Dashboard",
    publishedProducts: "Active Listings",
    draftProducts: "Draft Creations",
    buyerEnquiries: "Buyer Inquiries",
    incomeImpactTitle: "Direct-to-Market Income Gain",
    middlemanComparison: "Extra income earned compared to local middleman cuts",
    addNewCraft: "Add New Handcrafted Product",
    viewEnquiries: "View Buyer Messages",
    noProductsYet: "No handcrafted listings yet",
    startFirstListing: "Capture a photo of your craft to begin smart cataloging",
    
    stepPhoto: "1. Photo",
    stepEnhance: "2. Clean Up",
    stepCatalog: "3. Catalog",
    stepPricing: "4. Fair Price",
    stepLinkage: "5. Buyers",
    stepPublish: "6. Publish",
    
    captureOrUpload: "Upload or Snap Craft Photo",
    takePhoto: "Open Camera",
    uploadGallery: "Upload from Gallery",
    orTrySampleCrafts: "Or test instantly with authentic Indian craft samples:",
    
    aiEnhancementTitle: "AI Photo Studio Enhancement",
    aiEnhancementSub: "Automatically normalizes shadows, enhances vibrant natural craft colors, and cleans backgrounds.",
    before: "Raw Photo",
    after: "AI Studio Enhanced",
    enhancementApplied: "Studio Lighting & Sharpness Optimized",
    originalUnmodified: "Original Camera Capture",
    
    smartCatalogTitle: "AI Smart Catalog Generator",
    smartCatalogSub: "Gemini Vision extracts product title, heritage description, materials, and tags automatically.",
    productTitle: "Craft Title",
    productDesc: "Authentic Heritage Story & Description",
    material: "Traditional Materials Used",
    estDimensions: "Estimated Dimensions / Size",
    tags: ["Handmade", "Heritage", "Traditional"],
    aiGeneratedBadge: "AI Extracted — You can edit anything",
    voiceDictate: "Tap to Speak (Voice Dictation)",
    
    smartPricingTitle: "Fair Economic Pricing Engine",
    smartPricingSub: "Combines your raw costs with curated market benchmarks to prevent undervaluation and middleman exploitation.",
    rawMaterialCost: "Raw Materials Cost (₹)",
    laborHours: "Hours of Dedicated Handcrafting",
    fairHourlyWage: "Fair Hourly Wage Standard (₹/hr)",
    suggestedFairRange: "Recommended Fair Market Range",
    recommendedPrice: "Target Recommended Price",
    middlemanPayout: "Typical Middleman Offer",
    fairMarketGain: "Artisan Profit Gain",
    acceptSuggested: "Apply Suggested Price",
    setCustomPrice: "Set Custom Selling Price",
    pricingRationale: "Market Rationale & Economic Proof",
    
    marketLinkageTitle: "Market Linkage & Buyer Matching",
    marketLinkageSub: "AI matches this specific craft to the highest-margin commercial channels and institutional buyers.",
    matchingChannels: "Recommended Sales Channels",
    matchScore: "Fit Match",
    shareWhatsApp: "Share to WhatsApp Buyers",
    shareDirectLink: "Copy Verified Product Link",
    
    publishTitle: "Multilingual Publishing Complete",
    publishSuccess: "Your product is now listed in English, Hindi, and Telugu!",
    viewInMarketplace: "View in Buyer Marketplace",
    publishListing: "Publish to Marketplace",
    
    browseCatalog: "Direct Artisan Marketplace",
    searchCrafts: "Search pottery, ikat silks, woodwork, tribal art...",
    filterCategory: "Filter by Tradition",
    allCategories: "All Crafts",
    priceRange: "Price Range",
    enquireNow: "Enquire Directly with Artisan",
    authenticHandmade: "100% Certified Artisan Handmade",
    artisanOrigin: "Craft Origin",
    sendEnquiryTitle: "Send Inquiry to Master Artisan",
    buyerName: "Your Name / Organization",
    buyerPhone: "Phone or WhatsApp Number",
    buyerQuantity: "Quantity Needed (Units)",
    buyerMessage: "Inquiry Details or Custom Order Request",
    submitEnquiry: "Send Direct Inquiry",
    enquirySentSuccess: "Inquiry sent successfully! The artisan has been notified directly.",
    close: "Close",
    back: "Back",
    next: "Continue"
  },
  
  hi: {
    appName: "Antigravity",
    tagline: "कारीगरों के लिए AI बाज़ार लिंकेज एवं स्मार्ट कैटलॉगिंग",
    forArtisans: "कारीगर स्टूडियो (Artisan)",
    forBuyers: "ग्राहक बाज़ार (Buyer)",
    evaluatorDefense: "AI ऑडिट और डेटा प्रमाण",
    selectLanguage: "भाषा चुनें",
    english: "English",
    hindi: "हिन्दी (Hindi)",
    telugu: "తెలుగు (Telugu)",
    audioGuide: "ऑडियो सहायता",
    listening: "सुन रहे हैं...",
    listenToGuide: "स्क्रीन निर्देश सुनने के लिए टैप करें",
    stopAudio: "ऑडियो रोकें",
    
    welcomeTitle: "कारीगरों और शिल्पकारों का सशक्तिकरण",
    welcomeSub: "अपनी हस्तकला की फोटो लें और कुछ ही मिनटों में बहुभाषी कैटलॉग तथा उचित मूल्य प्राप्त करें।",
    enterPhone: "मोबाइल नंबर दर्ज करें",
    sendOtp: "OTP कोड भेजें",
    enterOtp: "6-अंकों का OTP डालें",
    verifyOtp: "सत्यापित करें और आगे बढ़ें",
    resendOtp: "पुनः भेजें (डेमो: 123456)",
    artisanDetails: "कारीगर प्रोफ़ाइल सेटअप",
    fullName: "आपका पूरा नाम",
    craftCategory: "शिल्प परंपरा / श्रेणी",
    stateDistrict: "आपका गाँव / जिला",
    state: "राज्य",
    district: "जिला",
    yearsOfExperience: "शिल्पकला का अनुभव (वर्ष)",
    completeProfile: "स्टूडियो में प्रवेश करें",
    
    myArtisanStudio: "कारीगर कार्यशाला डैशबोर्ड",
    publishedProducts: "सक्रिय उत्पाद",
    draftProducts: "अधूरे ड्राफ्ट",
    buyerEnquiries: "खरीदारों की पूछताछ",
    incomeImpactTitle: "सीधे बाज़ार से बढ़ी हुई आय",
    middlemanComparison: "बिचौलियों के मुकाबले कारीगर की अतिरिक्त सीधी बचत",
    addNewCraft: "नया हस्तशिल्प उत्पाद जोड़ें",
    viewEnquiries: "खरीदार संदेश देखें",
    noProductsYet: "अभी तक कोई उत्पाद सूचीबद्ध नहीं है",
    startFirstListing: "स्मार्ट कैटलॉगिंग शुरू करने के लिए अपने उत्पाद की तस्वीर लें",
    
    stepPhoto: "1. फोटो",
    stepEnhance: "2. संवारें",
    stepCatalog: "3. विवरण",
    stepPricing: "4. सही मूल्य",
    stepLinkage: "5. खरीदार",
    stepPublish: "6. प्रकाशित",
    
    captureOrUpload: "उत्पाद की तस्वीर लें या अपलोड करें",
    takePhoto: "कैमरा खोलें",
    uploadGallery: "गैलरी से चुनें",
    orTrySampleCrafts: "या तुरंत इन पारंपरिक शिल्प नमूनों से आज़माएं:",
    
    aiEnhancementTitle: "AI फोटो स्टूडियो सुधार",
    aiEnhancementSub: "छाया को हटाता है, शिल्प के प्राकृतिक रंगों को निखारता है और पृष्ठभूमि साफ करता है।",
    before: "मूल फोटो (Before)",
    after: "AI स्टूडियो फिनिश (After)",
    enhancementApplied: "स्टूडियो लाइटिंग और स्पष्टता लागू",
    originalUnmodified: "कैमरे की मूल तस्वीर",
    
    smartCatalogTitle: "AI स्मार्ट कैटलॉग निर्माण",
    smartCatalogSub: "Gemini AI तस्वीर देखकर शीर्षक, पारंपरिक कहानी, सामग्री और टैग स्वचालित भरता है।",
    productTitle: "उत्पाद का नाम",
    productDesc: "पारंपरिक विरासत और निर्माण कहानी",
    material: "प्रयुक्त पारंपरिक सामग्री",
    estDimensions: "अनुमानित माप / आकार",
    tags: ["हस्तनिर्मित", "पारंपरिक", "विरासत"],
    aiGeneratedBadge: "AI द्वारा सुझाया गया — आप बदलाव कर सकते हैं",
    voiceDictate: "बोलकर दर्ज करें (आवाज इनपुट)",
    
    smartPricingTitle: "उचित आर्थिक मूल्य कैलकुलेटर",
    smartPricingSub: "आपकी लागत और बाज़ार के शोधित डेटा का विश्लेषण कर सही मूल्य सीमा तय करता है।",
    rawMaterialCost: "कच्चे माल की लागत (₹)",
    laborHours: "शिल्प बनाने में लगे कुल घंटे",
    fairHourlyWage: "उचित पारिश्रमिक दर (₹/घंटा)",
    suggestedFairRange: "अनुशंसित उचित बाज़ार मूल्य सीमा",
    recommendedPrice: "सर्वोत्तम अनुशंसित मूल्य",
    middlemanPayout: "बिचौलिए द्वारा दी जाने वाली आम कीमत",
    fairMarketGain: "कारीगर को सीधा शुद्ध लाभ",
    acceptSuggested: "सुझाया गया मूल्य लागू करें",
    setCustomPrice: "अपनी पसंद का मूल्य रखें",
    pricingRationale: "मूल्य निर्धारण का आर्थिक आधार",
    
    marketLinkageTitle: "बाज़ार लिंकेज एवं खरीदार मिलान",
    marketLinkageSub: "AI आपके उत्पाद को उपयुक्त खुदरा, बुटीक और निर्यात खरीदारों से जोड़ता है।",
    matchingChannels: "अनुशंसित बिक्री माध्यम",
    matchScore: "मिलान स्कोर",
    shareWhatsApp: "WhatsApp पर खरीदारों को भेजें",
    shareDirectLink: "उत्पाद लिंक कॉपी करें",
    
    publishTitle: "बहुभाषी प्रकाशन संपन्न",
    publishSuccess: "आपका उत्पाद अंग्रेजी, हिन्दी और तेलुगु में तैयार है!",
    viewInMarketplace: "ग्राहक बाज़ार में देखें",
    publishListing: "बाज़ार में प्रकाशित करें",
    
    browseCatalog: "कारीगरों का सीधा बाज़ार",
    searchCrafts: "मिट्टी के बर्तन, साड़ियां, लकड़ी के शिल्प, कलाकृतियां खोजें...",
    filterCategory: "शिल्प परंपरा के अनुसार",
    allCategories: "सभी हस्तशिल्प",
    priceRange: "मूल्य सीमा",
    enquireNow: "कारीगर से सीधे संपर्क करें",
    authenticHandmade: "100% प्रमाणित हस्तनिर्मित शिल्प",
    artisanOrigin: "शिल्प की उत्पत्ति",
    sendEnquiryTitle: "मास्टर कारीगर को पूछताछ भेजें",
    buyerName: "आपका नाम या संस्था",
    buyerPhone: "फोन या WhatsApp नंबर",
    buyerQuantity: "आवश्यक मात्रा (संख्या)",
    buyerMessage: "ऑर्डर या विशेष पूछताछ का विवरण",
    submitEnquiry: "सीधी पूछताछ भेजें",
    enquirySentSuccess: "पूछताछ सफलतापूर्वक भेजी गई! कारीगर को सूचित कर दिया गया है।",
    close: "बंद करें",
    back: "पीछे",
    next: "आगे बढ़ें"
  },
  
  te: {
    appName: "Antigravity",
    tagline: "చేతివృత్తి కళాకారుల కోసం AI మార్కెట్ లింకేజ్ & స్మార్ట్ క్యాటలాగ్",
    forArtisans: "కళాకారుల స్టూడియో (Artisan)",
    forBuyers: "కొనుగోలుదారుల మార్కెట్ (Buyer)",
    evaluatorDefense: "AI ఆడిట్ & డేటా ఆధారం",
    selectLanguage: "భాష ఎంచుకోండి",
    english: "English",
    hindi: "हिन्दी (Hindi)",
    telugu: "తెలుగు (Telugu)",
    audioGuide: "ఆడియో సహాయం",
    listening: "వింటున్నారు...",
    listenToGuide: "సూచనలను వినడానికి నొక్కండి",
    stopAudio: "ఆడియో ఆపు",
    
    welcomeTitle: "గ్రామీణ చేతివృత్తి కళాకారుల సాధికారత",
    welcomeSub: "మీ చేతివృత్తి వస్తువుల ఫోటో తీయండి - కొద్ది నిమిషాల్లో బహుభాషా క్యాటలాగ్ మరియు న్యాయమైన ధరను పొందండి.",
    enterPhone: "మొబైల్ ఫోన్ నంబర్",
    sendOtp: "OTP పంపండి",
    enterOtp: "6 అంకెల OTP నమోదు చేయండి",
    verifyOtp: "ధృవీకరించి స్టూడియోలోకి వెళ్లండి",
    resendOtp: "మళ్ళీ పంపండి (డెమో: 123456)",
    artisanDetails: "కళాకారుల ప్రొఫైల్ సెటప్",
    fullName: "మీ పూర్తి పేరు",
    craftCategory: "చేతివృత్తి సంప్రదాయం",
    stateDistrict: "మీ గ్రామం / ప్రాంతం",
    state: "రాష్ట్రం",
    district: "జిల్లా",
    yearsOfExperience: "చేతివృత్తి అనుభవం (సంవత్సరాలు)",
    completeProfile: "స్టూడియో తెరవండి",
    
    myArtisanStudio: "కళాకారుల వర్క్‌షాప్ డాష్‌బోర్డ్",
    publishedProducts: "విక్రయానికి సిద్ధంగా ఉన్నవి",
    draftProducts: "డ్రాఫ్ట్ వస్తువులు",
    buyerEnquiries: "కొనుగోలుదారుల విచారణలు",
    incomeImpactTitle: "నేరుగా మార్కెట్ ద్వారా వచ్చిన అదనపు ఆదాయం",
    middlemanComparison: "దళారీల కంటే కళాకారుడికి దక్కిన అదనపు లాభం",
    addNewCraft: "కొత్త చేతిపని వస్తువును చేర్చండి",
    viewEnquiries: "కొనుగోలుదారుల సందేశాలు చూడండి",
    noProductsYet: "ఇంకా ఏ ఉత్పత్తులు చేర్చబడలేదు",
    startFirstListing: "స్మార్ట్ క్యాటలాగింగ్ ప్రారంభించడానికి మీ వస్తువు ఫోటో తీయండి",
    
    stepPhoto: "1. ఫోటో",
    stepEnhance: "2. మెరుగుపరచండి",
    stepCatalog: "3. వివరాలు",
    stepPricing: "4. సరసమైన ధర",
    stepLinkage: "5. కొనుగోలుదారులు",
    stepPublish: "6. ప్రచురించండి",
    
    captureOrUpload: "వస్తువు ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి",
    takePhoto: "కెమెరా తెరవండి",
    uploadGallery: "గ్యాలరీ నుండి ఎంచుకోండి",
    orTrySampleCrafts: "లేదా ఈ ప్రసిద్ధ సాంప్రదాయ కళా నమూనాలను పరీక్షించండి:",
    
    aiEnhancementTitle: "AI ఫోటో స్టూడియో మెరుగుదల",
    aiEnhancementSub: "నీడలను తొలగిస్తుంది, రంగులను ప్రకాశవంతం చేస్తుంది మరియు నేపథ్యాన్ని శుభ్రపరుస్తుంది.",
    before: "అసలు ఫోటో (Before)",
    after: "AI మెరుగుపరిచిన ఫోటో (After)",
    enhancementApplied: "స్టూడియో వెలుతురు & స్పష్టత వర్తించబడింది",
    originalUnmodified: "కెమెరా నుండి నేరుగా వచ్చిన ఫోటో",
    
    smartCatalogTitle: "AI స్మార్ట్ క్యాటలాగ్ సృష్టికర్త",
    smartCatalogSub: "Gemini AI ఫోటోను విశ్లేషించి శీర్షిక, సంప్రదాయ కథనం, ముడిసరుకు వివరాలను ఆటోమేటిక్‌గా ఇస్తుంది.",
    productTitle: "వస్తువు పేరు",
    productDesc: "సాంప్రదాయ వారసత్వం & తయారీ వివరణ",
    material: "ఉపయోగించిన సాంప్రదాయ ముడిసరుకు",
    estDimensions: "అంచనా కొలతలు / పరిమాణం",
    tags: ["చేతిపని", "సాంప్రదాయం", "వారసత్వం"],
    aiGeneratedBadge: "AI అందించిన వివరాలు — మీరు సవరించవచ్చు",
    voiceDictate: "మాట్లాడి నమోదు చేయండి (వాయిస్ టైపింగ్)",
    
    smartPricingTitle: "న్యాయమైన ఆర్థిక ధర గణన",
    smartPricingSub: "మీ ఖర్చులు మరియు మార్కెట్ ధరలను పోల్చి సరసమైన ధర పరిధిని నిర్ణయిస్తుంది.",
    rawMaterialCost: "ముడిసరుకు ఖర్చు (₹)",
    laborHours: "వస్తువు తయారీకి పట్టిన గంటలు",
    fairHourlyWage: "గంటకు న్యాయమైన కూలి (₹/గం)",
    suggestedFairRange: "సిఫార్సు చేయబడిన సరసమైన మార్కెట్ ధర పరిధి",
    recommendedPrice: "సరైన లక్ష్య ధర",
    middlemanPayout: "సాధారణంగా దళారీ ఇచ్చే మొత్తం",
    fairMarketGain: "కళాకారుడికి దక్కే అదనపు లాభం",
    acceptSuggested: "సిఫార్సు చేసిన ధరను వర్తింపజేయండి",
    setCustomPrice: "మీకు కావలసిన ధరను నిర్ణయించండి",
    pricingRationale: "ధర నిర్ణయానికి ఆర్థిక కారణం",
    
    marketLinkageTitle: "మార్కెట్ లింకేజ్ & కొనుగోలుదారుల అనుసంధానం",
    marketLinkageSub: "ఈ చేతిపనికి సరిపోయే ఉత్తమ దుకాణాలు, బొటిక్‌లు మరియు ఎగుమతి ఛానెళ్లను AI కనుగొంటుంది.",
    matchingChannels: "సిఫార్సు చేయబడిన అమ్మకపు మార్గాలు",
    matchScore: "సరిపోలిక స్కోరు",
    shareWhatsApp: "WhatsApp ద్వారా పంపండి",
    shareDirectLink: "లింక్ కాపీ చేయండి",
    
    publishTitle: "బహుభాషా ప్రచురణ పూర్తయింది",
    publishSuccess: "మీ వస్తువు ఇంగ్లీష్, హిందీ మరియు తెలుగులో సిద్ధంగా ఉంది!",
    viewInMarketplace: "కొనుగోలుదారుల మార్కెట్‌లో చూడండి",
    publishListing: "మార్కెట్‌లోకి విడుదల చేయండి",
    
    browseCatalog: "కళాకారుల ప్రత్యక్ష మార్కెట్",
    searchCrafts: "మట్టి పాత్రలు, పోచంపల్లి ఇక్కత్, చెక్క బొమ్మలు, చేతివృత్తులు వెతకండి...",
    filterCategory: "సంప్రదాయ విభాగం",
    allCategories: "అన్ని రకాలు",
    priceRange: "ధర పరిధి",
    enquireNow: "కళాకారుడిని నేరుగా సంప్రదించండి",
    authenticHandmade: "100% ప్రామాణిక చేతితో చేసిన వస్తువు",
    artisanOrigin: "కళ పుట్టిన ప్రాంతం",
    sendEnquiryTitle: "కళాకారునికి విచారణ సందేశం పంపండి",
    buyerName: "మీ పేరు లేదా సంస్థ",
    buyerPhone: "ఫోన్ లేదా WhatsApp నంబర్",
    buyerQuantity: "కావలసిన పరిమాణం (యూనిట్లు)",
    buyerMessage: "ఆర్డర్ వివరాలు లేదా ప్రత్యేక అభ్యర్థన",
    submitEnquiry: "సందేశం పంపండి",
    enquirySentSuccess: "సందేశం విజయవంతంగా పంపబడింది! కళాకారుడికి సమాచారం అందింది.",
    close: "మూసివేయి",
    back: "వెనుకకు",
    next: "తదుపరి"
  }
};

export function speakText(text: string, lang: LanguageCode = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'te') {
      utterance.lang = 'te-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error:', e);
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
